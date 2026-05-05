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
          model: 'claude-opus-4-7',          // /api/ai-check (validación)
          vision_model: 'claude-sonnet-4-6', // /api/scan-document (OCR)
          endpoints: ['/api/ai-check', '/api/scan-document'],
          mode: 'cloudflare-worker',
        },
        200,
        cors,
      );
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Use POST /api/ai-check o POST /api/scan-document' },
        405,
        cors,
      );
    }

    // ── Endpoint NUEVO: extracción de documentos identificativos vía
    //    Claude Vision. Acepta imagen base64 y devuelve JSON estructurado.
    if (url.pathname === '/api/scan-document') {
      return scanDocument(request, env, cors);
    }

    if (url.pathname !== '/api/ai-check') {
      return jsonResponse(
        { error: 'Use POST /api/ai-check o POST /api/scan-document' },
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
