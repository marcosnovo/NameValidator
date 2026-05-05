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

// ─── Worker entrypoint ─────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const cors = buildCorsHeaders(env.CORS_ORIGINS, request.headers.get('Origin'));

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // Health-check (útil para "Probar conexión" desde el frontend)
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return jsonResponse(
        {
          ok: true,
          ai_layer: !!env.ANTHROPIC_API_KEY,
          model: 'claude-opus-4-7',
          mode: 'cloudflare-worker',
        },
        200,
        cors,
      );
    }

    if (request.method !== 'POST' || url.pathname !== '/api/ai-check') {
      return jsonResponse(
        { error: 'Use POST /api/ai-check' },
        405,
        cors,
      );
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse(
        {
          enabled: false,
          reason:
            'ANTHROPIC_API_KEY no configurada en este Worker. Añádela en ' +
            'Settings → Variables and Secrets como Secret.',
        },
        500,
        cors,
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'JSON inválido' }, 400, cors);
    }

    const input = body?.input;
    if (typeof input !== 'string' || !input.trim()) {
      return jsonResponse({ error: 'Campo "input" (string) requerido' }, 400, cors);
    }

    const result = await callAnthropic(input, env.ANTHROPIC_API_KEY);
    return jsonResponse(result, 200, cors);
  },
};

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
