// Capa semántica: usa Claude Opus 4.7 vía fetch directo (universal — funciona
// en Node 18+ y en navegadores modernos, sin SDK de por medio).
//
// Optimizaciones:
//  - Prompt caching: el system prompt es enorme y estable, así que se cachea
//    con cache_control: ephemeral TTL 1h. La 2ª request paga ~10% del coste
//    de input.
//  - Adaptive thinking + effort:high para razonamiento fonético en 3 idiomas.
//  - Output estructurado vía json_schema.
//  - apiKey se pasa por parámetro: en Node viene de process.env, en browser
//    el operador la introduce en un campo y la guardamos en sessionStorage.
//
// AVISO BROWSER: incluir tu API key en código que corre en el navegador la
// expone a cualquier persona con acceso a esa pestaña. Para producción usa
// un proxy backend; este modo browser es para PRUEBAS Y DEMOS.

const SYSTEM_PROMPT = `Eres un sistema de moderación de nombres para el HALO del Santiago Bernabéu —
un anillo de pantallas LED en lo alto del estadio del Real Madrid que muestra
los nombres de los aficionados que pagan por incluirlos durante el Tour.
El estadio recibe visitantes de todo el mundo, así que los nombres mostrados
son LEÍDOS y vistos por niños, familias y medios de comunicación.

Tu trabajo es decidir si un nombre propuesto es apropiado para mostrarse.

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

4. **Trampas de ortografía / leet / espaciado**:
     - "P u t a", "p.u.t.a", "p_u_t_a", "pu7a", "pu+a", "pvta"
     - "Aitor Tilla" pero también "AitorTilla", "Aitor T.Illa"
     - Nombres invertidos: "atup" (puta al revés)

5. **Apología de violencia, terrorismo, símbolos extremistas**:
     - Hitler, ETA, Gora ETA, ISIS, Heil Hitler, KKK
     - Provocación política grave en contexto deportivo

6. **Referencias sexuales o anatómicas explícitas** aunque vengan disfrazadas
   de nombre propio.

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
CÓMO ANALIZAR UN INPUT
═══════════════════════════════════════════════════════════════════════════

Para cada input, sigue MENTALMENTE:

1. Lee el input tal cual.
2. Léelo EN VOZ ALTA mentalmente (en español, inglés y francés).
3. Concaténalo sin espacios. ¿Esa cadena contiene alguna palabra vulgar?
4. Re-segmenta deslizando los espacios. ¿Aparece alguna palabra/frase soez?
5. Considera homófonos: en español "b/v", "ll/y", "h muda", "c/z/s".
6. Considera leet/sustituciones: 0=o, 1=i, 3=e, 4=a, 5=s, 7=t, @=a.
7. Considera reversión: léelo al revés.
8. Considera contexto Real Madrid (sección anterior).
9. Si hay AMBIGÜEDAD entre "es jugador rival" o "es persona real con
   ese apellido", prefiere SUSPICIOUS y deja decidir al humano.

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
  // Node: process.env.ANTHROPIC_API_KEY
  if (typeof process !== 'undefined' && process.env?.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  return null;
}

export async function aiCheck(input, options = {}) {
  const apiKey = resolveApiKey(options.apiKey);
  if (!apiKey) {
    return {
      enabled: false,
      reason: 'API key no configurada',
    };
  }

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
      format: {
        type: 'json_schema',
        schema: RESPONSE_SCHEMA,
      },
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
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      enabled: true,
      error: `Network error: ${err?.message ?? err}`,
    };
  }

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    return {
      enabled: true,
      error: `HTTP ${response.status}`,
      detail: errorBody,
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    return {
      enabled: true,
      error: 'Respuesta no es JSON válido',
    };
  }

  const textBlock = payload?.content?.find?.((b) => b.type === 'text');
  if (!textBlock) {
    return {
      enabled: true,
      error: 'Sin bloque de texto en la respuesta',
      raw: payload,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return {
      enabled: true,
      error: 'JSON inválido del modelo',
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
