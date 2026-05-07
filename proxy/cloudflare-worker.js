// ═══════════════════════════════════════════════════════════════════════════
//  HALO Name Validator — Cloudflare Worker proxy
// ═══════════════════════════════════════════════════════════════════════════
//
// Proxy mínimo entre el frontend (GitHub Pages) y la API de Anthropic.
// La API key vive como Worker Secret en Cloudflare; NUNCA la verá el browser.
//
// ──── DEPLOY VÍA DASHBOARD (zero-CLI, recomendado) ─────────────────────────
//   1. https://dash.cloudflare.com → Workers & Pages → Create → Worker
//   2. Pega TODO este fichero en el editor → Deploy
//   3. Settings → Variables and Secrets → Add → "Type: Secret":
//        Name:  ANTHROPIC_API_KEY
//        Value: sk-ant-api03-...
//   4. (opcional, recomendado) añade otra variable de tipo Plain text:
//        Name:  CORS_ORIGINS
//        Value: https://<usuario>.github.io
//      (Sin esto el Worker permite llamadas desde cualquier origen.)
//   5. Copia la URL pública (ej. halo-proxy.<sub>.workers.dev) y pégala en
//      el panel "⚙ Configuración AI" del frontend, en el campo "Backend URL":
//        https://halo-proxy.<sub>.workers.dev/api/ai-check
//
// ──── DEPLOY VÍA WRANGLER (CLI) ────────────────────────────────────────────
//   cd proxy
//   npm i -g wrangler
//   wrangler login
//   wrangler secret put ANTHROPIC_API_KEY  # te pide pegar la key
//   wrangler deploy
//
// ──── CACHE + APROBACIONES GLOBALES (KV) — opcional, MUY recomendado ──────
//   Activa la cache de 1h sobre /api/ai-check (~70% hit rate en un Tour) y
//   propaga aprobaciones humanas a todos los operarios.
//
//   Dashboard:
//     1. Workers & Pages → Storage → KV → Create namespace "halo-cache"
//     2. Tu Worker → Settings → Variables → KV Namespace Bindings → Add
//        Variable name: KV
//        Namespace:     halo-cache
//
//   Wrangler:
//     wrangler kv namespace create halo-cache
//     # Pega el id devuelto en wrangler.toml como [[kv_namespaces]] binding="KV"
//     wrangler deploy
//
//   El Worker es fail-soft: si KV no está bindeado, sigue funcionando sin
//   cache ni aprobaciones globales (el frontend mantiene su localStorage).
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Eres un sistema de moderación de nombres para el HALO del Santiago Bernabéu —
un anillo de pantallas LED en lo alto del estadio del Real Madrid que muestra
los nombres de los aficionados que pagan por incluirlos durante el Tour.
El estadio recibe visitantes de todo el mundo, así que los nombres mostrados
son LEÍDOS y vistos por niños, familias y medios de comunicación.

Tu trabajo es decidir si un nombre propuesto es apropiado para mostrarse.

═══════════════════════════════════════════════════════════════════════════
QUÉ DEBES RECHAZAR (con MÁXIMA paranoia)
═══════════════════════════════════════════════════════════════════════════

1. Lenguaje soez explícito en español, inglés o francés.
2. Slurs raciales, étnicos, religiosos, sexuales, de género o capacitistas.
3. Nombres-broma con doble sentido fonético (Aitor Tilla → "a tortilla",
   Susana Oria → "su zanahoria", Mike Hunt → "my cunt", Jean Bon → "jambon",
   Anne Culé → "enculé"). Léelos en voz alta y concatenados sin espacios.
4. Trampas: leet (pu7@), espaciado (P u t a), inversión (atup).
5. Apología violencia/terrorismo (ETA, Hitler, ISIS, KKK).
6. Referencias sexuales explícitas disfrazadas de nombre.

═══════════════════════════════════════════════════════════════════════════
CONTEXTO REAL MADRID — CASO ESPECIAL
═══════════════════════════════════════════════════════════════════════════

Este HALO es del Real Madrid:

A) RECHAZAR: identidad/homenaje a jugadores rivales (Pep Guardiola, Lionel
   Messi, Andrés Iniesta, Carles Puyol, Gerard Piqué, Cholo Simeone, Diego
   Costa, Ronaldinho…) y chants (Visca el Barça, Madrid de mierda,
   Florentino Dimisión).

B) PERMITIR: aficionados con apellidos legítimos coincidentes con jugadores
   rivales. EJEMPLO CRÍTICO:
     - "Ángela Guardiola Guardiola" → ALLOWED (real persona, "Guardiola" es
       apellido catalán común; el primer nombre Ángela y apellido duplicado
       dejan claro que NO es Pep Guardiola)
     - "Marta Iniesta", "Pedro Piqué López", "Juan Puyol" → ALLOWED
   Heurística: si el primer nombre NO coincide con el del jugador famoso
   probablemente es una persona real. ALLOWED o REVIEW.

C) PERMITIR jugadores y leyendas del Madrid (Vinicius, Bellingham, Modric,
   Cristiano, Zidane, Ramos…).

═══════════════════════════════════════════════════════════════════════════
CALIBRACIÓN
═══════════════════════════════════════════════════════════════════════════

- "OFFENSIVE": >85% seguro de ofensivo / nombre-broma / homenaje-rival.
- "SUSPICIOUS": 30%-85% duda. Va a revisión humana.
- "CLEAN": <30% duda.

confidence_offensive es un entero 0-100.

Es preferible un falso positivo que un falso negativo, PERO bloquear
"Ángela Guardiola Guardiola" sería un error: prefiere CLEAN o SUSPICIOUS
bajo, nunca OFFENSIVE.

Responde EXCLUSIVAMENTE con JSON ajustándose al esquema indicado.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['CLEAN', 'SUSPICIOUS', 'OFFENSIVE'] },
    confidence_offensive: { type: 'integer', minimum: 0, maximum: 100 },
    languages_with_issue: {
      type: 'array',
      items: { type: 'string', enum: ['es', 'en', 'fr', 'other'] },
    },
    categories: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'profanity', 'slur', 'sexual', 'scatological', 'joke-name',
          'phonetic-trick', 'leet-substitution', 'reversed', 'extremism',
          'violence', 'impersonation', 'rival-team', 'other',
        ],
      },
    },
    phonetic_reading: { type: 'string' },
    rationale: { type: 'string' },
  },
  required: [
    'verdict', 'confidence_offensive', 'languages_with_issue',
    'categories', 'phonetic_reading', 'rationale',
  ],
  additionalProperties: false,
};

// ═══════════════════════════════════════════════════════════════════════════
//  Cache + aprobaciones globales — Cloudflare KV
// ═══════════════════════════════════════════════════════════════════════════
//
// Para activar:
//   1. Workers & Pages → Storage → KV → Create namespace "halo-cache"
//   2. Workers & Pages → tu Worker → Settings → Variables → KV Namespace
//      Bindings → Add: variable name `KV`, namespace `halo-cache`.
//
// Si KV no está bindeado, el Worker sigue funcionando (sin cache, sin
// aprobaciones). Es fail-soft: nunca rompe la respuesta.

const CACHE_TTL_SECONDS = 60 * 60;           // 1h para resultados de IA
const APPROVAL_TTL_SECONDS = 60 * 60 * 24 * 30; // 30d para aprobaciones humanas
const CACHE_PREFIX = 'aicheck:';
const APPROVAL_PREFIX = 'approve:';

// ─── Worker entrypoint ─────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const cors = buildCorsHeaders(env.CORS_ORIGINS, request.headers.get('Origin'));

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // Health-check (útil para "Probar conexión" desde el frontend)
    if (request.method === 'GET' && url.pathname === '/api/health') {
      const picked = pickProvider(env);
      const providers_available = [];
      if (env.ANTHROPIC_API_KEY) providers_available.push('anthropic');
      if (env.OPENAI_API_KEY) providers_available.push('openai');
      if (env.GOOGLE_API_KEY) providers_available.push('google');
      return jsonResponse(
        {
          ok: true,
          ai_layer: !!picked,
          kv_layer: !!env.KV,
          providers_available,
          provider: picked?.provider ?? null,
          model: picked?.defaultModel ?? null,
          vision_model: 'claude-sonnet-4-6',
          endpoints: [
            '/api/ai-check', '/api/scan-document', '/api/approve', '/api/metrics',
          ],
          mode: 'cloudflare-worker',
        },
        200,
        cors,
      );
    }

    // Métricas agregadas — útil para el dashboard del operario.
    if (request.method === 'GET' && url.pathname === '/api/metrics') {
      return getMetrics(env, cors);
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Use POST /api/ai-check, /api/scan-document, o /api/approve' },
        405,
        cors,
      );
    }

    // ── Endpoint: extracción de documentos identificativos vía Claude Vision
    if (url.pathname === '/api/scan-document') {
      return scanDocument(request, env, cors);
    }

    // ── Endpoint NUEVO: aprobaciones globales del operario.
    //    El frontend lo invoca cuando el operario aprueba manualmente
    //    un nombre marcado como REVIEW. La aprobación se propaga a TODOS
    //    los operarios vía KV.
    if (url.pathname === '/api/approve') {
      return recordApproval(request, env, cors, ctx);
    }

    if (url.pathname !== '/api/ai-check') {
      return jsonResponse(
        { error: 'Use POST /api/ai-check, /api/scan-document, o /api/approve' },
        405,
        cors,
      );
    }

    return aiCheck(request, env, cors, ctx);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
//  /api/ai-check con cache KV + aprobaciones globales + métricas
// ═══════════════════════════════════════════════════════════════════════════
async function aiCheck(request, env, cors, ctx) {
  const t0 = Date.now();

  // Auto-detect provider — el primero que tenga key configurada.
  // Override con env.AI_PROVIDER ('anthropic' | 'openai' | 'google').
  const providerInfo = pickProvider(env);
  if (!providerInfo) {
    return jsonResponse(
      {
        enabled: false,
        reason:
          'No hay API key configurada. Añade en Settings → Variables and ' +
          'Secrets una de: ANTHROPIC_API_KEY, OPENAI_API_KEY o GOOGLE_API_KEY.',
      },
      500,
      cors,
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonResponse({ error: 'JSON inválido' }, 400, cors); }

  const input = body?.input;
  if (typeof input !== 'string' || !input.trim()) {
    return jsonResponse({ error: 'Campo "input" (string) requerido' }, 400, cors);
  }

  // Hash determinista del input normalizado (lower + sin acentos + sin
  // espacios redundantes). Mismo nombre → misma clave de cache, sin
  // importar capitalización o espaciado.
  const hashKey = await canonicalHash(input);

  // ── PASO A: ¿Hay aprobación humana previa? Si sí, devolvemos CLEAN
  //           con la razón "previously approved by operator".
  if (env.KV) {
    try {
      const approval = await env.KV.get(APPROVAL_PREFIX + hashKey, 'json');
      if (approval && approval.approved) {
        const elapsed = Date.now() - t0;
        const result = {
          enabled: true,
          verdict: 'CLEAN',
          confidence_offensive: 0,
          languages_with_issue: [],
          categories: [],
          phonetic_reading: '',
          rationale:
            `Aprobado previamente por operario (${approval.approver_id ?? 'humano'} · ` +
            `${approval.timestamp ?? ''}). Marcado como CLEAN.`,
          source: 'human-approval-cache',
          usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0 },
        };
        logMetrics(env, ctx, {
          endpoint: 'ai-check',
          input_len: input.length,
          verdict: 'CLEAN',
          source: 'human-approval-cache',
          elapsed_ms: elapsed,
        });
        return jsonResponse(result, 200, cors);
      }
    } catch (err) {
      // KV temporalmente caído — no rompemos el flujo, seguimos a IA.
    }
  }

  // ── PASO B: ¿Hay resultado cacheado de Anthropic? TTL 1h.
  if (env.KV) {
    try {
      const cached = await env.KV.get(CACHE_PREFIX + hashKey, 'json');
      if (cached) {
        const elapsed = Date.now() - t0;
        cached.source = 'kv-cache';
        cached.cache_hit = true;
        logMetrics(env, ctx, {
          endpoint: 'ai-check',
          input_len: input.length,
          verdict: cached.verdict,
          source: 'kv-cache',
          elapsed_ms: elapsed,
        });
        return jsonResponse(cached, 200, cors);
      }
    } catch {
      // ignoramos errores de KV
    }
  }

  // ── PASO C: Llamada real al provider seleccionado.
  const result = await callProvider(input, providerInfo);
  result.provider = providerInfo.provider;
  result.model = result.model || providerInfo.defaultModel;
  const elapsed = Date.now() - t0;

  // Sólo cacheamos respuestas exitosas y que tengan veredicto. Errores de red
  // o JSON-malformed-from-model NO se cachean (no queremos repetir errores).
  if (env.KV && result?.verdict && !result.error) {
    const cacheEntry = { ...result, cached_at: Date.now() };
    if (ctx?.waitUntil) {
      ctx.waitUntil(
        env.KV.put(CACHE_PREFIX + hashKey, JSON.stringify(cacheEntry),
                   { expirationTtl: CACHE_TTL_SECONDS })
          .catch(() => {})
      );
    } else {
      // Fallback síncrono si no hay waitUntil (test env).
      try {
        await env.KV.put(CACHE_PREFIX + hashKey, JSON.stringify(cacheEntry),
                         { expirationTtl: CACHE_TTL_SECONDS });
      } catch {}
    }
  }

  logMetrics(env, ctx, {
    endpoint: 'ai-check',
    input_len: input.length,
    verdict: result?.verdict ?? 'ERROR',
    source: 'anthropic',
    elapsed_ms: elapsed,
    error: result?.error || null,
  });
  result.source = 'anthropic';
  return jsonResponse(result, 200, cors);
}

// ═══════════════════════════════════════════════════════════════════════════
//  /api/approve — aprendizaje desde el operario
// ═══════════════════════════════════════════════════════════════════════════
//
// Cuando un operario aprueba manualmente un nombre que el sistema marcó
// REVIEW (por ejemplo "Francisco Franco García" tras comprobar DNI),
// guardamos esa decisión en KV con TTL 30 días. Cualquier operario en
// cualquier instancia de la app verá ese mismo nombre como CLEAN.
//
// Body: { input: string, approver_id?: string, note?: string }
async function recordApproval(request, env, cors, ctx) {
  if (!env.KV) {
    return jsonResponse(
      { ok: false, error: 'KV namespace no configurado en el Worker' },
      503,
      cors,
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonResponse({ ok: false, error: 'JSON inválido' }, 400, cors); }

  const input = body?.input;
  if (typeof input !== 'string' || !input.trim()) {
    return jsonResponse(
      { ok: false, error: 'Campo "input" (string) requerido' }, 400, cors,
    );
  }
  const approverId = String(body?.approver_id ?? 'operator').slice(0, 64);
  const note = String(body?.note ?? '').slice(0, 200);

  const hashKey = await canonicalHash(input);
  const entry = {
    approved: true,
    approver_id: approverId,
    note,
    timestamp: new Date().toISOString(),
    input_preview: input.slice(0, 60),
  };

  try {
    await env.KV.put(APPROVAL_PREFIX + hashKey, JSON.stringify(entry),
                     { expirationTtl: APPROVAL_TTL_SECONDS });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: 'KV put failed: ' + err.message }, 500, cors,
    );
  }

  // También invalidamos el cache de IA para este input — la próxima vez
  // que alguien meta el mismo nombre saltará directo a aprobación.
  try { await env.KV.delete(CACHE_PREFIX + hashKey); } catch {}

  logMetrics(env, ctx, {
    endpoint: 'approve',
    input_len: input.length,
    approver: approverId,
  });

  return jsonResponse(
    { ok: true, hash: hashKey, ttl_seconds: APPROVAL_TTL_SECONDS },
    200, cors,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Hash determinista de un nombre para clave de cache/aprobación
// ═══════════════════════════════════════════════════════════════════════════
//
// Normaliza:
//   - Lowercase
//   - Strip diacritics (NFD)
//   - Colapsa espacios
// y luego SHA-256 → hex. La normalización es importante: "Pablo Escobar",
// "PABLO ESCOBAR", "pablo escobar", "Pablo  Escobar " → mismo hash.
async function canonicalHash(input) {
  const normalized = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  Métricas — log estructurado JSON + agregación en KV
// ═══════════════════════════════════════════════════════════════════════════
//
// Dos canales:
//   ▸ console.log JSON  — Cloudflare Logs / Logpush los captura automático
//                         para envío a Logflare / Grafana / Datadog.
//   ▸ KV counters       — agregación día-a-día en `metrics:YYYY-MM-DD` para
//                         dashboard sin depender de logs externos.
//
// Estructura del counter diario (entrada KV):
//   {
//     date: "2026-05-05",
//     totals: { ai_check: 0, approve: 0, scan_document: 0 },
//     verdicts: { CLEAN: 0, SUSPICIOUS: 0, OFFENSIVE: 0, REVIEW: 0,
//                 ALLOWED: 0, REJECTED: 0, ERROR: 0 },
//     sources: { 'human-approval-cache': 0, 'kv-cache': 0, 'anthropic': 0 },
//     latency_ms: { sum: 0, count: 0 },   // promedio = sum/count
//     errors: 0,
//   }
//
// TTL 90 días por entrada — historial de los últimos 3 meses.

const METRICS_PREFIX = 'metrics:';
const METRICS_TTL_SECONDS = 60 * 60 * 24 * 90;

function todayKey() {
  return METRICS_PREFIX + new Date().toISOString().slice(0, 10);
}

function logMetrics(env, ctx, fields) {
  const entry = { ts: new Date().toISOString(), ...fields };
  try { console.log(JSON.stringify(entry)); } catch {}

  // Agregación en KV — best-effort. waitUntil para no bloquear la respuesta.
  if (!env.KV) return;
  const updater = async () => {
    const key = todayKey();
    let m;
    try { m = await env.KV.get(key, 'json'); } catch { m = null; }
    if (!m) m = {
      date: key.slice(METRICS_PREFIX.length),
      totals: {}, verdicts: {}, sources: {},
      latency_ms: { sum: 0, count: 0 },
      errors: 0,
    };
    const ep = String(fields.endpoint || 'other').replace(/-/g, '_');
    m.totals[ep] = (m.totals[ep] || 0) + 1;
    if (fields.verdict) m.verdicts[fields.verdict] = (m.verdicts[fields.verdict] || 0) + 1;
    if (fields.source) m.sources[fields.source] = (m.sources[fields.source] || 0) + 1;
    if (typeof fields.elapsed_ms === 'number') {
      m.latency_ms.sum += fields.elapsed_ms;
      m.latency_ms.count += 1;
    }
    if (fields.error) m.errors = (m.errors || 0) + 1;
    try {
      await env.KV.put(key, JSON.stringify(m), { expirationTtl: METRICS_TTL_SECONDS });
    } catch {}
  };
  if (ctx?.waitUntil) ctx.waitUntil(updater().catch(() => {}));
  else updater().catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════
//  /api/metrics — devuelve los counters de los últimos 14 días
// ═══════════════════════════════════════════════════════════════════════════
async function getMetrics(env, cors) {
  if (!env.KV) {
    return jsonResponse(
      { ok: false, error: 'KV namespace no bindeado en este Worker.' },
      503, cors,
    );
  }
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }
  const series = [];
  for (const date of days) {
    let m;
    try { m = await env.KV.get(METRICS_PREFIX + date, 'json'); }
    catch { m = null; }
    if (!m) continue;
    series.push({
      date,
      totals: m.totals || {},
      verdicts: m.verdicts || {},
      sources: m.sources || {},
      avg_latency_ms: m.latency_ms?.count
        ? Math.round(m.latency_ms.sum / m.latency_ms.count)
        : null,
      errors: m.errors || 0,
    });
  }

  // Agregado total de los 14 días para mostrar headline.
  const summary = series.reduce((acc, d) => {
    for (const [k, v] of Object.entries(d.totals)) acc.totals[k] = (acc.totals[k] || 0) + v;
    for (const [k, v] of Object.entries(d.verdicts)) acc.verdicts[k] = (acc.verdicts[k] || 0) + v;
    for (const [k, v] of Object.entries(d.sources)) acc.sources[k] = (acc.sources[k] || 0) + v;
    acc.errors += d.errors;
    if (d.avg_latency_ms != null) {
      acc._lat_sum += d.avg_latency_ms;
      acc._lat_n += 1;
    }
    return acc;
  }, { totals: {}, verdicts: {}, sources: {}, errors: 0, _lat_sum: 0, _lat_n: 0 });

  const cacheHits = (summary.sources['kv-cache'] || 0) +
                    (summary.sources['human-approval-cache'] || 0);
  const totalAi = summary.totals['ai_check'] || 0;
  const cacheHitRate = totalAi > 0 ? Math.round((cacheHits / totalAi) * 100) : null;

  return jsonResponse(
    {
      ok: true,
      window_days: 14,
      series: series.reverse(), // antiguo → nuevo
      summary: {
        totals: summary.totals,
        verdicts: summary.verdicts,
        sources: summary.sources,
        errors: summary.errors,
        avg_latency_ms: summary._lat_n ? Math.round(summary._lat_sum / summary._lat_n) : null,
        cache_hit_rate_pct: cacheHitRate,
      },
    },
    200, cors,
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function buildCorsHeaders(allowedRaw, requestOrigin) {
  const allowed = String(allowedRaw || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  if (allowed.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (requestOrigin && allowed.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
  }
  // Si no matchea, no incluimos el header → el browser bloqueará la respuesta.
  return headers;
}

function jsonResponse(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  Multi-provider AI: Anthropic Claude · OpenAI GPT · Google Gemini
// ═══════════════════════════════════════════════════════════════════════════
//
// Selección:
//   ▸ env.AI_PROVIDER ('anthropic' | 'openai' | 'google') fuerza uno
//   ▸ Si no está, prueba en orden: Anthropic > OpenAI > Google
//
// Devuelve { provider, apiKey, defaultModel } o null si ninguno disponible.
function pickProvider(env) {
  const requested = env.AI_PROVIDER?.trim();
  const candidates = {
    anthropic: { key: env.ANTHROPIC_API_KEY, defaultModel: 'claude-opus-4-7' },
    openai: { key: env.OPENAI_API_KEY, defaultModel: 'gpt-4o-2024-11-20' },
    google: { key: env.GOOGLE_API_KEY, defaultModel: 'gemini-2.5-pro' },
  };

  if (requested && candidates[requested]?.key) {
    return {
      provider: requested,
      apiKey: candidates[requested].key,
      defaultModel: candidates[requested].defaultModel,
    };
  }
  for (const provider of ['anthropic', 'openai', 'google']) {
    if (candidates[provider].key) {
      return {
        provider,
        apiKey: candidates[provider].key,
        defaultModel: candidates[provider].defaultModel,
      };
    }
  }
  return null;
}

async function callProvider(input, info) {
  switch (info.provider) {
    case 'anthropic': return callAnthropic(input, info.apiKey);
    case 'openai':    return callOpenAI(input, info.apiKey);
    case 'google':    return callGoogle(input, info.apiKey);
    default:
      return { enabled: true, error: `Provider desconocido: ${info.provider}` };
  }
}

// ─── OpenAI GPT ─────────────────────────────────────────────────────────
async function callOpenAI(input, apiKey) {
  const requestBody = {
    model: 'gpt-4o-2024-11-20',
    max_completion_tokens: 1024,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'halo_verdict',
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Evalúa este input para mostrar en el HALO:\n\n<input>${input}</input>`,
      },
    ],
  };

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    return { enabled: true, error: `Network error reaching OpenAI: ${err?.message ?? err}` };
  }

  if (!response.ok) {
    let detail;
    try { detail = await response.json(); } catch { detail = await response.text().catch(() => null); }
    return { enabled: true, error: `OpenAI HTTP ${response.status}`, detail };
  }

  let payload;
  try { payload = await response.json(); }
  catch { return { enabled: true, error: 'OpenAI devolvió respuesta no-JSON' }; }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) {
    return { enabled: true, error: 'OpenAI sin contenido en la respuesta', raw: payload };
  }

  let parsed;
  try { parsed = JSON.parse(text); }
  catch {
    return {
      enabled: true,
      error: 'OpenAI devolvió JSON inválido',
      raw: text,
    };
  }

  return {
    enabled: true,
    ...parsed,
    model: payload.model,
    usage: {
      input_tokens: payload.usage?.prompt_tokens ?? 0,
      output_tokens: payload.usage?.completion_tokens ?? 0,
    },
  };
}

// ─── Google Gemini (AI Studio) ──────────────────────────────────────────
async function callGoogle(input, apiKey) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `gemini-2.5-pro:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [{
          text: `Evalúa este input para mostrar en el HALO:\n\n<input>${input}</input>`,
        }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    return { enabled: true, error: `Network error reaching Google: ${err?.message ?? err}` };
  }

  if (!response.ok) {
    let detail;
    try { detail = await response.json(); } catch { detail = await response.text().catch(() => null); }
    return { enabled: true, error: `Google HTTP ${response.status}`, detail };
  }

  let payload;
  try { payload = await response.json(); }
  catch { return { enabled: true, error: 'Google devolvió respuesta no-JSON' }; }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return { enabled: true, error: 'Google sin texto en la respuesta', raw: payload };
  }

  let parsed;
  try { parsed = JSON.parse(text); }
  catch {
    // Algunos despliegues envuelven en ```json ... ```
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    try { parsed = JSON.parse(cleaned); }
    catch {
      return {
        enabled: true,
        error: 'Google devolvió JSON inválido',
        raw: text,
      };
    }
  }

  return {
    enabled: true,
    ...parsed,
    model: 'gemini-2.5-pro',
    usage: {
      input_tokens: payload.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: payload.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

async function callAnthropic(input, apiKey) {
  const requestBody = {
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
    },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral', ttl: '1h' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Evalúa este input para mostrar en el HALO:\n\n<input>${input}</input>`,
      },
    ],
  };

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    return {
      enabled: true,
      error: `Network error reaching Anthropic: ${err?.message ?? err}`,
    };
  }

  if (!response.ok) {
    let detail;
    try { detail = await response.json(); } catch { detail = await response.text().catch(() => null); }
    return {
      enabled: true,
      error: `Anthropic HTTP ${response.status}`,
      detail,
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { enabled: true, error: 'Anthropic devolvió respuesta no-JSON' };
  }

  const textBlock = payload?.content?.find?.((b) => b.type === 'text');
  if (!textBlock) {
    return { enabled: true, error: 'Sin bloque de texto en la respuesta de Anthropic' };
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return {
      enabled: true,
      error: 'Modelo devolvió JSON inválido',
      raw: textBlock.text,
    };
  }

  return {
    enabled: true,
    ...parsed,
    usage: {
      input_tokens: payload.usage?.input_tokens ?? 0,
      output_tokens: payload.usage?.output_tokens ?? 0,
      cache_read_input_tokens: payload.usage?.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens: payload.usage?.cache_creation_input_tokens ?? 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXTRACCIÓN DE DOCUMENTOS DE IDENTIDAD vía Claude Vision
// ═══════════════════════════════════════════════════════════════════════════
//
// Resuelve el problema real: Tesseract.js es lento (15-30s) y poco preciso
// (~60-75%) en condiciones reales. Claude Vision lo hace en 3-6s con ~97%
// de precisión y multi-idioma nativo.
//
// Modelo: Claude Sonnet 4.6 (mejor relación precio/calidad que Opus 4.7
// para extracción estructurada — confirmado por benchmarks 2024-2025).
// Coste estimado: ~$0.005 por imagen (1.500-2.000 input tokens + 200-400
// output tokens).
//
// Recibe: { image: <base64>, mediaType: 'image/jpeg' | 'image/png' }
// Devuelve: JSON estructurado con datos extraídos + autenticidad.

const SCAN_SYSTEM_PROMPT = `Eres un extractor de datos de documentos identificativos para un sistema de
acceso al HALO del Santiago Bernabéu. Recibes UNA imagen y debes extraer
los datos en JSON estricto.

DOCUMENTOS QUE PUEDES VER:
  ▸ DNI español (frontal con labels o dorso con MRZ)
  ▸ NIE / TIE español (Tarjeta de Identificación de Extranjero)
  ▸ Pasaporte de cualquier país (página de datos con MRZ ICAO 9303)
  ▸ Carnet de conducir (UE armonizado con campos numerados, USA, UK, otros)
  ▸ Permiso de residencia / Aufenthaltstitel / Permis de séjour
  ▸ Otros documentos identificativos oficiales

CAMPOS A EXTRAER (todos opcionales — si no se ven, déjalos vacíos/null):
  ▸ documentType: 'DNI' | 'NIE' | 'TIE' | 'PASSPORT' | 'DRIVING_LICENSE'
                  | 'RESIDENCE_PERMIT' | 'OTHER'
  ▸ issuingCountry: ISO 3166-1 alpha-3 (ESP, FRA, USA, GBR, ITA, DEU…)
  ▸ givenNames: el/los nombre(s) tal como aparecen en el documento
  ▸ surnames: apellido(s) en formato natural ("García López")
  ▸ fullName: nombre completo en orden NATURAL para hispanohablantes
              (NOMBRE APELLIDO1 APELLIDO2). Ejemplo: "Juan García López".
  ▸ documentNumber: número del documento tal como aparece
  ▸ birthDate: ISO 8601 YYYY-MM-DD
  ▸ expiryDate: ISO 8601 YYYY-MM-DD
  ▸ issueDate: ISO 8601 YYYY-MM-DD
  ▸ sex: 'M' | 'F' | null
  ▸ nationality: ISO 3166-1 alpha-3
  ▸ mrz: si hay MRZ visible, devuelve { line1, line2, line3 } tal cual

EVALUACIÓN DE AUTENTICIDAD:
  ▸ authenticity.score: 0-100 (basado en lo que VES en la imagen)
  ▸ authenticity.suspectedFake: boolean
  ▸ authenticity.observations: lista corta con observaciones útiles
    (alineación de tipografía, perspectiva, glare, signos de manipulación,
     fotocopia en blanco/negro, desgaste, etc.)

CALIDAD DE LA IMAGEN:
  ▸ imageQuality: 'good' | 'fair' | 'poor'
  ▸ imageHints: array de problemas si los hay
    ("foto borrosa", "glare cubre el texto", "documento parcialmente fuera
     de cuadro", "fotografía de pantalla con moiré"…)

REGLAS:
  ▸ NUNCA inventes datos. Si no se ve un campo claramente, devuelve null
    para ese campo (excepto givenNames/surnames/fullName, que pueden ser
    cadena vacía si no hay rastro de nombre legible).
  ▸ Devuelve los nombres tal como están en el documento (mayúsculas si así
    salen). El front normaliza después.
  ▸ Si la imagen NO ES un documento de identidad, devuelve documentType
    'OTHER' y el resto null o vacío. NO completes campos por inferencia.
  ▸ Si sólo se ve PARTE del documento (esquina cortada, glare cubre la
    mitad), extrae sólo lo legible y deja el resto en null.
  ▸ Responde SÓLO con JSON ajustándote al esquema. Sin texto extra.
  ▸ Considera que el ángulo, la iluminación o el fondo pueden ser malos.
    Aun así, intenta extraer lo que puedas y refleja la dificultad en
    imageQuality / imageHints.`;

// Tipo string-o-null reutilizable. Crítico para evitar fabricación: el
// modelo prefiere null antes que inventar un valor para satisfacer el schema.
const STR_OR_NULL = { type: ['string', 'null'] };

const SCAN_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    documentType: {
      type: 'string',
      enum: ['DNI', 'NIE', 'TIE', 'PASSPORT', 'DRIVING_LICENSE', 'RESIDENCE_PERMIT', 'OTHER'],
    },
    issuingCountry: STR_OR_NULL,
    givenNames: { type: 'string' },   // '' si no se ve
    surnames: { type: 'string' },     // '' si no se ve
    fullName: { type: 'string' },     // '' si no se ve
    documentNumber: STR_OR_NULL,
    birthDate: STR_OR_NULL,
    expiryDate: STR_OR_NULL,
    issueDate: STR_OR_NULL,
    sex: { type: ['string', 'null'], enum: ['M', 'F', '', null] },
    nationality: STR_OR_NULL,
    mrz: {
      // null cuando NO hay MRZ visible — evita fabricar líneas plausibles
      // con checksums incorrectos que el frontend tomaría como reales.
      type: ['object', 'null'],
      properties: {
        line1: STR_OR_NULL,
        line2: STR_OR_NULL,
        line3: STR_OR_NULL,
      },
      additionalProperties: false,
    },
    authenticity: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 100 },
        suspectedFake: { type: 'boolean' },
        observations: { type: 'array', items: { type: 'string' } },
      },
      required: ['score', 'suspectedFake', 'observations'],
      additionalProperties: false,
    },
    imageQuality: { type: 'string', enum: ['good', 'fair', 'poor'] },
    imageHints: { type: 'array', items: { type: 'string' } },
  },
  // Sólo los campos que el modelo SIEMPRE puede determinar: el tipo de
  // documento (incluso si es 'OTHER'), nombres (al menos cadena vacía),
  // y el bloque autenticidad/calidad. El resto admite null para que el
  // modelo pueda decir honestamente "no se ve" sin fabricar.
  required: [
    'documentType', 'givenNames', 'surnames', 'fullName',
    'authenticity', 'imageQuality', 'imageHints',
  ],
  additionalProperties: false,
};

async function scanDocument(request, env, cors) {
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse(
      { ok: false, reason: 'ANTHROPIC_API_KEY no configurada en el Worker' },
      500,
      cors,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'JSON inválido' }, 400, cors);
  }

  const image = body?.image;
  const mediaType = body?.mediaType || 'image/jpeg';
  if (typeof image !== 'string' || image.length < 100) {
    return jsonResponse(
      { ok: false, error: 'Campo "image" (base64) requerido' },
      400,
      cors,
    );
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mediaType)) {
    return jsonResponse(
      { ok: false, error: 'mediaType no soportado' },
      400,
      cors,
    );
  }

  // Tope de tamaño defensivo: imágenes >5MB se rechazan (nadie debería
  // enviar 4K crudo). El frontend redimensiona antes.
  const approxSize = (image.length * 3) / 4;
  if (approxSize > 5 * 1024 * 1024) {
    return jsonResponse(
      { ok: false, error: 'Imagen demasiado grande (>5MB). Reduce calidad antes de enviar.' },
      413,
      cors,
    );
  }

  const requestBody = {
    // Sonnet 4.6 es el sweet spot precio/calidad para esta tarea
    // (~$0.005 por imagen vs Opus 4.7 ~$0.015-0.025).
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    output_config: {
      effort: 'low',  // tarea estructurada, no necesita pensamiento profundo
      format: { type: 'json_schema', schema: SCAN_RESPONSE_SCHEMA },
    },
    system: [
      {
        type: 'text',
        text: SCAN_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral', ttl: '1h' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: image },
          },
          {
            type: 'text',
            text: 'Extrae los datos de este documento como JSON.',
          },
        ],
      },
    ],
  };

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: `Network error: ${err?.message ?? err}` },
      502,
      cors,
    );
  }

  if (!response.ok) {
    let detail;
    try { detail = await response.json(); } catch { detail = await response.text().catch(() => null); }
    return jsonResponse(
      { ok: false, error: `Anthropic HTTP ${response.status}`, detail },
      502,
      cors,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return jsonResponse(
      { ok: false, error: 'Anthropic devolvió respuesta no-JSON' },
      502,
      cors,
    );
  }

  const textBlock = payload?.content?.find?.((b) => b.type === 'text');
  if (!textBlock) {
    return jsonResponse(
      { ok: false, error: 'Sin bloque de texto en la respuesta' },
      502,
      cors,
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return jsonResponse(
      { ok: false, error: 'Modelo devolvió JSON inválido', raw: textBlock.text },
      502,
      cors,
    );
  }

  return jsonResponse(
    {
      ok: true,
      mode: 'claude-vision',
      ...parsed,
      usage: {
        input_tokens: payload.usage?.input_tokens ?? 0,
        output_tokens: payload.usage?.output_tokens ?? 0,
      },
    },
    200,
    cors,
  );
}
