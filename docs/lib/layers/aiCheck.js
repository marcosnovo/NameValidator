// Capa semántica multi-provider: usa Claude, GPT u otros vía fetch directo.
//
// Soporte de proveedores (auto-detección por prefijo de la API key):
//   ▸ Anthropic Claude       — keys que empiezan con `sk-ant-`
//   ▸ OpenAI GPT             — keys que empiezan con `sk-` (sin `sk-ant-`)
//   ▸ Google Gemini          — keys de Google AI Studio (cadena alfanumérica)
//
// Hay dos modos:
//
//   1. PROXY MODE (recomendado para producción / GitHub Pages):
//      El cliente pasa `proxyUrl`. La función hace POST al proxy con
//      `{ input }` y devuelve la respuesta. La API key vive en el
//      servidor, NO en el navegador.
//
//   2. DIRECT MODE (Node con env, o demo browser con sessionStorage):
//      El cliente pasa `apiKey`. Auto-detectamos el provider por prefijo
//      o se puede forzar con `provider: 'anthropic' | 'openai' | 'google'`.
//
// AVISO BROWSER DIRECT MODE: incluir tu API key en código que corre en el
// navegador la expone a cualquier persona con acceso a esa pestaña. El
// modo proxy elimina esto enteramente.

const SYSTEM_PROMPT = `Eres un sistema de moderación de nombres para el HALO del Santiago Bernabéu —
un anillo de pantallas LED en lo alto del estadio del Real Madrid que muestra
los nombres de los aficionados que pagan por incluirlos durante el Tour.
El estadio recibe visitantes de todo el mundo, así que los nombres mostrados
son LEÍDOS y vistos por niños, familias y medios de comunicación.

Tu trabajo es decidir si un nombre propuesto es apropiado para mostrarse.

Cuatro idiomas activos en el análisis: español (España y LatAm), inglés,
francés y portugués (BR y EU). Por defecto razonas en los cuatro y eliges
el más probable según el input. Si el input pareciera escrito en otro
idioma (italiano, alemán, etc.) y no detectas señales en los 4 cubiertos,
indícalo en languages_with_issue como "other" y prefiere SUSPICIOUS.

═══════════════════════════════════════════════════════════════════════════
QUÉ DEBES RECHAZAR (con MÁXIMA paranoia)
═══════════════════════════════════════════════════════════════════════════

1. **Lenguaje soez explícito** en español, inglés o francés (insultos,
   palabras sexuales, escatológicas, vulgares).

2. **Slurs** raciales, étnicos, religiosos, sexuales, de género o capacitistas
   en cualquiera de los 3 idiomas. Tolerancia cero.

3. **Nombres-broma con doble sentido fonético** ("nombres de gastar bromas"
   tipo Aitor Tilla, Elena Nito, Susana Oria). Funcionan porque, leídos
   en voz alta o concatenados sin espacios, suenan a una palabra/frase
   soez, escatológica o cómica de mal gusto.
   Ejemplos canónicos en español:
     - "Aitor Tilla"  → "a tortilla"
     - "Aitor Menta"  → "a tormenta"
     - "Susana Oria"  → "su zanahoria"
     - "Elena Nito"   → "el nenito"
     - "Elsa Pato"    → "el zapato"
     - "Mario Neta"   → "marioneta"
     - "Esteban Quito"→ "estaban quito / este banquito"
     - "Helio Cóptero"→ "helicóptero"
     - "Armando Bronca Segura" → frase explícita
     - "Benito Camelas" → "venido a comerlas"
     - "Lola Mento"   → "lo lamento"
     - "Dolores de Cabeza" → frase de queja
     - "Elba Calao"   → "el bacalao"
     - "Rosa Mata"    → "lo sa-mata"
     - "Estela Gartija" → "esta lagartija"

   En inglés:
     - "Mike Hunt"    → "my cunt"
     - "Hugh Jass"    → "huge ass"
     - "Ben Dover"    → "bend over"
     - "Phil McCavity"→ "fill my cavity"
     - "Wayne Kerr"   → "wanker"
     - "Mike Oxlong"  → "my cock's long"
     - "Amanda Hugginkiss" → "a man to hug and kiss"

   En francés:
     - "Jean Bon"     → "jambon"
     - "Paul Ochon"   → "polochon"
     - "Sacha Touille"→ "ça chatouille"
     - "Anne Culé"    → "enculé"

   En portugués (BR/PT):
     - "Cu Doce"      → vulgar literal
     - "Maria Calça-Cu" → vulgar
     - "Vai Tomar No Cu" disfrazado de nombre
     - "Ana Lise" → "análise" (juego suave) — borderline, contexto manda

4. **Trampas de ortografía / leet / espaciado**:
     - "P u t a", "p.u.t.a", "p_u_t_a", "pu7a", "pu+a", "pvta"
     - "Aitor Tilla" pero también "AitorTilla", "Aitor T.Illa"
     - Nombres invertidos: "atup" (puta al revés)

5. **Apología de violencia, terrorismo, símbolos extremistas**:
     - Hitler, ETA, Gora ETA, ISIS, Heil Hitler, KKK
     - Provocación política grave en contexto deportivo

6. **Referencias sexuales o anatómicas explícitas** aunque vengan disfrazadas
   de nombre propio.

7. **INSULTOS A JUGADORES** — categoría crítica para el HALO. Incluye:
   - Comparaciones animales racistas: "Vinicius mono", "Mbappé macaco",
     "Pogba monkey", "Camavinga singe". Esto es racismo documentado en
     estadios y NUNCA debe aparecer en el HALO. Tolerancia cero.
   - Calificativos raciales: "Pelé negro", "Vini negrito", "Mbappé chino".
   - Insultos físicos a jugador identificable: "Vinicius gordo",
     "Bellingham viejo", "Modric viejo", "Cristiano feo", "Messi enano".
   - Homofobia contextual: "Vinicius gay", "Cristiano maricón".
   - El input "Vinicius eres un crack" o "Vinicius rey" SÍ es válido —
     son piropos. El input "Vinicius mono" o similar NO.

═══════════════════════════════════════════════════════════════════════════
CONTEXTO REAL MADRID — CASO ESPECIAL
═══════════════════════════════════════════════════════════════════════════

Este HALO es del **Real Madrid**, así que estos casos tienen tratamiento
especial:

A) RECHAZAR si el input es claramente la **identidad o homenaje a un jugador,
   entrenador o presidente de un club rival** (FC Barcelona, Atlético de
   Madrid principalmente). Ejemplos a rechazar:
     - "Pep Guardiola", "Lionel Messi", "Andrés Iniesta"
     - "Carles Puyol", "Gerard Piqué", "Xavi Hernández"
     - "Ronaldinho", "Cruyff", "Stoichkov"
     - "Cholo Simeone", "Diego Costa", "Antoine Griezmann"
     - "Joan Laporta", "Florentino Pérez Dimisión"
     - Chants: "Visca el Barça", "Hala Barça", "Madrid de mierda",
       "Catalunya Independent", "Boycott Bernabéu"

B) PERMITIR a aficionados con **apellidos legítimos que coinciden con
   los de jugadores rivales**. Ejemplo CRÍTICO:
     - "Ángela Guardiola Guardiola" → ALLOWED (real persona, "Guardiola"
       es un apellido catalán común; el primer nombre Ángela y el apellido
       duplicado dejan claro que NO es Pep Guardiola)
     - "Iniesta García" → ALLOWED (Iniesta es apellido manchego)
     - "Pedro Messi López" → REVIEW (raro pero posible — apellido legítimo)
     - "Juan Piqué" → ALLOWED (Piqué es apellido catalán)

   Heurística: si el primer nombre NO coincide con el del jugador famoso
   y/o aparecen otros apellidos / formatos que no encajan con el jugador,
   probablemente es una persona real. ALLOWED o REVIEW.

C) PERMITIR jugadores y leyendas del Real Madrid (Vinicius, Bellingham,
   Modric, Kroos, Ramos, Cristiano Ronaldo, Zidane, Raúl, etc.) — los
   aficionados pueden declarar admiración y eso ENCAJA con el espíritu del
   HALO.

═══════════════════════════════════════════════════════════════════════════
QUÉ DEBES PERMITIR
═══════════════════════════════════════════════════════════════════════════

- Nombres reales, aunque sean raros, exóticos, multiculturales o largos.
- Apellidos compuestos legítimos.
- Nombres de jugadores famosos del Madrid.
- Apodos cariñosos no soeces ("Papi", "Mami" estándar, "Champ").
- Diminutivos comunes ("Pepe", "Paco", "Maite").
- Mensajes cortos no soeces tipo "Hala Madrid", "Vamos Real".
- Apellidos como Guardiola, Iniesta, Piqué, Puyol cuando claramente
  pertenecen a una persona civil (no al jugador famoso por contexto).

═══════════════════════════════════════════════════════════════════════════
CÓMO ANALIZAR UN INPUT — ESTRATEGIA DE RE-SEGMENTACIÓN
═══════════════════════════════════════════════════════════════════════════

Para cada input, sigue MENTALMENTE este proceso. Es CRÍTICO porque la gente
es muy creativa inventando apellidos falsos que esconden frases soeces.

PASO 1 — Concatena todo sin espacios y léelo como UNA sola frase castellana.
PASO 2 — Prueba 3-5 puntos de corte alternativos para esa cadena. La gente
         disfraza frases vulgares cortándolas en sílabas raras:
           "Kepa Jote Mecho"   → kepajotemecho   → "que pajote me echo"
           "María Unpajote"    → mariaunpajote   → "María, un pajote"
           "Ione Cesi Tomear"  → ionecesitomear  → "yo necesito mear"
           "Carme Gustaela Nal"→ carmegustaelanal→ "Carmen, gusta el anal"
           "Doli Dadelano"     → dolidadelano    → "dolida del ano"
           "Carlos Gil Hipoyas"→ carlosgilhipoyas→ "Carlos, gilipollas"
                                  (h muda + ll↔y)
PASO 3 — Aplica fonética castellana: b↔v, h muda (excepto ch), ll↔y,
         c+(e|i)/z→s (seseo), qu→k, w→gu (slang). Vuelve al paso 2.
PASO 4 — Repite leyéndolo como inglés (ph→f, ck→k) y portugués (nh→n,
         lh→l, h muda).
PASO 5 — Considera leet/sustituciones: 0=o, 1=i, 3=e, 4=a, 5=s, 7=t, @=a.
PASO 6 — Considera reversión: léelo al revés.
PASO 7 — Busca en cada lectura: actos de masturbación (paja, pajote,
         pajeo, frotar), defecación (caga, cagón, cagar), micción
         (mear, meo, necesito mear), genitales (polla, coño, teta,
         culo, ano, nabo, chocho, chochazo), actos sexuales explícitos
         (chupar, mamar, follar, comer X, devorar), homofobia, racismo,
         insultos, slurs, suplantación de jugador rival.
PASO 8 — Considera contexto Real Madrid (sección anterior).
PASO 9 — Si hay AMBIGÜEDAD entre "broma soez" o "nombre legítimo",
         prefiere SUSPICIOUS con confianza media-alta (50-75%).

═══════════════════════════════════════════════════════════════════════════
APELLIDOS LEGÍTIMOS EN ESPAÑA (calibración crítica)
═══════════════════════════════════════════════════════════════════════════

El INE registra muchos apellidos que parecen insultos pero son legítimos:

- "GAY"     — ~5.000 personas (1ª y 2ª apellido). PERMITIR si estructura
              es nombre+apellido coherente: "Carlos Gay López" → ALLOWED.
- "MEARÍN"  — apellido gallego legítimo. "María Mearín" → ALLOWED.
- "GUARDIOLA", "INIESTA", "PIQUÉ", "PUYOL" — apellidos catalanes/manchegos
              comunes. Sólo bloquéalos si el primer nombre es el del
              jugador famoso ("Pep Guardiola", "Andrés Iniesta") O si el
              contexto indica claramente broma/suplantación.
- "FEO", "BOBO", "MONO" — pueden existir como apellidos. Sin contexto
              claro, prefiere REVIEW antes que REJECT.

REGLA DE ORO: si el input parece tener una estructura coherente de
nombre+apellido(s) y NO esconde una frase vulgar al re-segmentar
(paso 1-7 arriba), prefiere ALLOWED o SUSPICIOUS bajo. Sólo OFFENSIVE
cuando hay una lectura vulgar CLARA tras intentar la re-segmentación.

═══════════════════════════════════════════════════════════════════════════
CALIBRACIÓN DEL VEREDICTO
═══════════════════════════════════════════════════════════════════════════

- "OFFENSIVE": estás >85% seguro de que es ofensivo / soez / nombre-broma /
  homenaje a rival. Bloquear.
- "SUSPICIOUS": entre 30% y 85% de duda. Hay alguna lectura problemática
  pero no estás seguro. Va a revisión humana.
- "CLEAN": <30% de duda.

El campo "confidence_offensive" debe ser un entero 0-100 representando tu
probabilidad estimada de que el input ES inapropiado para el HALO.

═══════════════════════════════════════════════════════════════════════════
SÉ ESPECIALMENTE PARANOICO PERO RESPETUOSO CON NOMBRES REALES
═══════════════════════════════════════════════════════════════════════════

Es preferible un falso positivo (revisión humana de un nombre limpio)
que un falso negativo (mostrar "Aitor Tilla" en el HALO).

PERO: bloquear automáticamente "Ángela Guardiola Guardiola" sería un
error, porque es claramente una persona real con apellido legítimo. En
ese caso, prefiere CLEAN o como mucho SUSPICIOUS bajo (20-40%) — nunca
OFFENSIVE.

Responde EXCLUSIVAMENTE con JSON ajustándose al esquema indicado.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    verdict: {
      type: 'string',
      enum: ['CLEAN', 'SUSPICIOUS', 'OFFENSIVE'],
    },
    confidence_offensive: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    languages_with_issue: {
      type: 'array',
      items: { type: 'string', enum: ['es', 'en', 'fr', 'other'] },
    },
    categories: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'profanity',
          'slur',
          'sexual',
          'scatological',
          'joke-name',
          'phonetic-trick',
          'leet-substitution',
          'reversed',
          'extremism',
          'violence',
          'impersonation',
          'rival-team',
          'other',
        ],
      },
    },
    phonetic_reading: {
      type: 'string',
      description: 'Cómo suena el input al leerlo en voz alta o concatenado, si aplica',
    },
    rationale: {
      type: 'string',
      description: 'Explicación breve (≤ 240 caracteres) en español de por qué se ha clasificado así.',
    },
  },
  required: [
    'verdict',
    'confidence_offensive',
    'languages_with_issue',
    'categories',
    'phonetic_reading',
    'rationale',
  ],
  additionalProperties: false,
};

function resolveApiKey(passed) {
  if (passed) return passed;
  // Node: prueba env vars en orden (Anthropic primero por compatibilidad)
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      null
    );
  }
  return null;
}

/**
 * Detecta el proveedor a partir del prefijo de la API key.
 * Heurística:
 *   ▸ `sk-ant-...`            → anthropic (Claude)
 *   ▸ `sk-...` (no sk-ant-)   → openai (GPT)
 *   ▸ resto                   → google (Gemini AI Studio keys son
 *                                 alfanuméricas sin prefijo distintivo)
 *
 * `provider` explícito tiene prioridad sobre la auto-detección.
 */
export function detectProvider(apiKey, override) {
  if (override === 'anthropic' || override === 'openai' || override === 'google') {
    return override;
  }
  if (typeof apiKey !== 'string' || !apiKey) return 'anthropic';
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';
  if (apiKey.startsWith('sk-')) return 'openai';
  return 'google';
}

export async function aiCheck(input, options = {}) {
  // ── PROXY MODE ──────────────────────────────────────────────────────────
  // Si el caller pasa proxyUrl, delegamos en el backend. La key vive ahí.
  if (options.proxyUrl) {
    let response;
    try {
      response = await fetch(options.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
    } catch (err) {
      return {
        enabled: true,
        mode: 'proxy',
        error: `Proxy network error: ${err?.message ?? err}`,
      };
    }
    if (!response.ok) {
      let detail;
      try { detail = await response.json(); } catch { detail = await response.text().catch(() => null); }
      return {
        enabled: true,
        mode: 'proxy',
        error: `Proxy HTTP ${response.status}`,
        detail,
      };
    }
    try {
      const data = await response.json();
      return { mode: 'proxy', ...data };
    } catch (err) {
      return {
        enabled: true,
        mode: 'proxy',
        error: 'Respuesta del proxy no es JSON válido',
      };
    }
  }

  // ── DIRECT MODE ─────────────────────────────────────────────────────────
  const apiKey = resolveApiKey(options.apiKey);
  if (!apiKey) {
    return {
      enabled: false,
      reason: 'No hay proxyUrl ni apiKey configurados',
    };
  }

  const provider = detectProvider(apiKey, options.provider);
  switch (provider) {
    case 'anthropic':
      return await callAnthropic(input, apiKey);
    case 'openai':
      return await callOpenAI(input, apiKey);
    case 'google':
      return await callGoogle(input, apiKey);
    default:
      return { enabled: true, error: `Provider desconocido: ${provider}` };
  }
}

// ─── Anthropic Claude ───────────────────────────────────────────────────
async function callAnthropic(input, apiKey) {
  const isBrowser = typeof window !== 'undefined';
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };
  // Anthropic exige este header para llamadas directas desde el navegador.
  if (isBrowser) {
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const body = {
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

  const r = await fetchSafe('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (r.error) return { enabled: true, provider: 'anthropic', ...r };

  const textBlock = r.payload?.content?.find?.((b) => b.type === 'text');
  if (!textBlock) {
    return {
      enabled: true,
      provider: 'anthropic',
      error: 'Sin bloque de texto',
      raw: r.payload,
    };
  }
  return {
    enabled: true,
    mode: 'direct',
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    ...parseModelJson(textBlock.text, 'anthropic'),
    usage: {
      input_tokens: r.payload.usage?.input_tokens ?? 0,
      output_tokens: r.payload.usage?.output_tokens ?? 0,
      cache_read_input_tokens: r.payload.usage?.cache_read_input_tokens ?? 0,
      cache_creation_input_tokens: r.payload.usage?.cache_creation_input_tokens ?? 0,
    },
  };
}

// ─── OpenAI GPT ─────────────────────────────────────────────────────────
async function callOpenAI(input, apiKey) {
  const body = {
    model: 'gpt-4o-2024-11-20',
    max_completion_tokens: 1024,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'halo_verdict',
        strict: true,
        schema: openaiSchema(),
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

  const r = await fetchSafe('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (r.error) return { enabled: true, provider: 'openai', ...r };

  const text = r.payload?.choices?.[0]?.message?.content;
  if (!text) {
    return {
      enabled: true,
      provider: 'openai',
      error: 'Sin contenido en la respuesta',
      raw: r.payload,
    };
  }
  return {
    enabled: true,
    mode: 'direct',
    provider: 'openai',
    model: r.payload.model || 'gpt-4o',
    ...parseModelJson(text, 'openai'),
    usage: {
      input_tokens: r.payload.usage?.prompt_tokens ?? 0,
      output_tokens: r.payload.usage?.completion_tokens ?? 0,
    },
  };
}

// ─── Google Gemini (AI Studio) ──────────────────────────────────────────
async function callGoogle(input, apiKey) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `gemini-2.5-pro:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    systemInstruction: {
      role: 'system',
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Evalúa este input para mostrar en el HALO:\n\n<input>${input}</input>`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: googleSchema(),
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };

  const r = await fetchSafe(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.error) return { enabled: true, provider: 'google', ...r };

  const text =
    r.payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return {
      enabled: true,
      provider: 'google',
      error: 'Sin texto en la respuesta',
      raw: r.payload,
    };
  }
  return {
    enabled: true,
    mode: 'direct',
    provider: 'google',
    model: 'gemini-2.5-pro',
    ...parseModelJson(text, 'google'),
    usage: {
      input_tokens: r.payload.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: r.payload.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

// ─── Helpers compartidos ────────────────────────────────────────────────
async function fetchSafe(url, init) {
  let response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    return { error: `Network error: ${err?.message ?? err}` };
  }
  if (!response.ok) {
    let detail;
    try { detail = await response.json(); }
    catch { detail = await response.text().catch(() => null); }
    return { error: `HTTP ${response.status}`, detail };
  }
  let payload;
  try { payload = await response.json(); }
  catch { return { error: 'Respuesta no es JSON válido' }; }
  return { payload };
}

function parseModelJson(text, provider) {
  try {
    return JSON.parse(text);
  } catch {
    // Algunos providers (gemini) a veces envuelven el JSON en ```json ... ```
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '');
    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: `JSON inválido del modelo ${provider}`, raw: text };
    }
  }
}

// OpenAI strict schema requiere que TODAS las propiedades estén en required
// y additionalProperties:false. El nuestro ya cumple.
function openaiSchema() {
  return RESPONSE_SCHEMA;
}

// Google Gemini schema usa `enum` directamente como en JSON Schema y soporta
// las mismas constraints. Compatible 1:1.
function googleSchema() {
  return RESPONSE_SCHEMA;
}

// Exporto el SYSTEM_PROMPT y el RESPONSE_SCHEMA para que el Cloudflare Worker
// pueda reutilizarlos sin duplicar el contenido. Si bundle-ar el src/ no es
// posible (deploy zero-CLI desde el dashboard), copiar el contenido al
// proxy/cloudflare-worker.js es el fallback.
export { SYSTEM_PROMPT, RESPONSE_SCHEMA };
