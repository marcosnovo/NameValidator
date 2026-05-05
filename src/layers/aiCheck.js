// Capa semántica: usa Claude Opus 4.7 para detectar dobles sentidos,
// homófonos, re-segmentaciones fonéticas y nombres-broma novedosos que las
// listas estáticas no pueden cubrir.
//
// Optimizaciones:
//  - Prompt caching: el system prompt es enorme y estable, así que se cachea
//    con TTL 1h. La 2ª request en adelante paga sólo ~10% del coste de input.
//  - Adaptive thinking + effort:high porque la tarea exige razonamiento
//    fonético en 3 idiomas.
//  - Output estructurado vía json_schema para que el server pueda parsear
//    sin riesgo.

import Anthropic from '@anthropic-ai/sdk';

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    client = new Anthropic();
  }
  return client;
}

const SYSTEM_PROMPT = `Eres un sistema de moderación de nombres para el HALO del Santiago Bernabéu —
un anillo de pantallas LED en lo alto del estadio que muestra los nombres de
los aficionados que pagan por incluirlos durante el Tour. El estadio recibe
visitantes de todo el mundo, así que los nombres mostrados son LEÍDOS y vistos
por niños, familias y medios de comunicación. Tu trabajo es decidir si un
nombre propuesto es apropiado para mostrarse en el HALO.

═══════════════════════════════════════════════════════════════════════════
QUÉ DEBES RECHAZAR (con MÁXIMA paranoia)
═══════════════════════════════════════════════════════════════════════════

1. **Lenguaje soez explícito** en español, inglés o francés (insultos,
   palabras sexuales, escatológicas, vulgares).

2. **Slurs** raciales, étnicos, religiosos, sexuales, de género o capacitistas
   en cualquiera de los 3 idiomas. Tolerancia cero.

3. **Nombres-broma con doble sentido fonético** ("nombres de gastar bromas"
   tipo lista de Aitor Tilla, Elena Nito, Susana Oria, etc.). Estos
   funcionan porque, cuando se LEEN EN VOZ ALTA o se concatenan SIN ESPACIOS,
   suenan a una palabra/frase soez, escatológica o cómica de mal gusto.
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

   Ejemplos en inglés:
     - "Mike Hunt"    → "my cunt"
     - "Hugh Jass"    → "huge ass"
     - "Ben Dover"    → "bend over"
     - "Phil McCavity"→ "fill my cavity"
     - "Wayne Kerr"   → "wanker"
     - "I.P. Freely"  → "I pee freely"
     - "Mike Oxlong"  → "my cock's long"
     - "Mike Litoris" → "my clitoris"
     - "Amanda Hugginkiss" → "a man to hug and kiss"

   Ejemplos en francés:
     - "Jean Bon"     → "jambon"
     - "Paul Ochon"   → "polochon"
     - "Sacha Touille"→ "ça chatouille"
     - "Jean Peuplus" → "j'en peux plus"
     - "Guy Mauve"    → "guimauve"

4. **Trampas de ortografía / leet / espaciado**:
     - "P u t a", "p.u.t.a", "p_u_t_a", "pu7a", "pu+a", "pvta"
     - "Aitor Tilla" pero también "AitorTilla", "Aitor T.Illa", "Ait Or Tilla"
     - Nombres invertidos: "atup" (puta al revés)

5. **Apología de violencia, terrorismo, símbolos extremistas**:
     - Hitler, ETA, Gora ETA, ISIS, Heil Hitler, KKK, etc.
     - Provocación política grave en contexto deportivo

6. **Referencias sexuales o anatómicas explícitas** aunque vengan disfrazadas
   de nombre propio.

7. **Suplantación obvia** de personalidades reales para difamarlos
   (p. ej. "Florentino Ladron").

═══════════════════════════════════════════════════════════════════════════
QUÉ DEBES PERMITIR
═══════════════════════════════════════════════════════════════════════════

- Nombres reales, aunque sean raros, exóticos, multiculturales o largos.
- Apellidos compuestos legítimos.
- Nombres de jugadores famosos del Madrid (Vinicius, Jude, Bellingham,
  Mbappé, Modric, Kroos, Ramos, Ronaldo, Zidane, etc.) — aunque sean fans
  declarando admiración.
- Apodos cariñosos no soeces ("Papi", "Mami" estándar, "Champ").
- Diminutivos comunes ("Pepe", "Paco", "Maite").
- Mensajes cortos no soeces tipo "Hala Madrid", "Vamos Real" — el sistema
  decidirá luego si admite frases o sólo nombres, pero tu juicio es sobre
  si son OFENSIVOS, no sobre si son nombres propios estrictos.

═══════════════════════════════════════════════════════════════════════════
CÓMO ANALIZAR UN INPUT
═══════════════════════════════════════════════════════════════════════════

Para cada input, sigue MENTALMENTE estos pasos antes de decidir:

1. Lee el input tal cual, en silencio.
2. Léelo EN VOZ ALTA mentalmente (en español, en inglés y en francés).
3. Concaténalo sin espacios. ¿Esa cadena contiene alguna palabra vulgar?
4. Re-segmenta deslizando los espacios. ¿Aparece alguna palabra/frase soez?
5. Considera homófonos: en español "b/v", "ll/y", "h muda", "c/z/s".
   En francés liaisons. En inglés rimas y sound-alikes.
6. Considera leet/sustituciones: 0=o, 1=i, 3=e, 4=a, 5=s, 7=t, @=a.
7. Considera reversión: léelo al revés.
8. Considera contexto cultural: ¿es un nombre-broma documentado en blogs/
   listas de "nombres ridículos"?
9. Si hay AMBIGÜEDAD, mejor marcarlo como SUSPICIOUS con la duda explicada.

═══════════════════════════════════════════════════════════════════════════
CALIBRACIÓN DEL VEREDICTO
═══════════════════════════════════════════════════════════════════════════

- "OFFENSIVE": estás >85% seguro de que es ofensivo / soez / nombre-broma
  con doble sentido. Bloquear.
- "SUSPICIOUS": entre 30% y 85% de duda. Hay alguna lectura problemática
  pero no estás seguro. El sistema lo enviará a revisión humana.
- "CLEAN": <30% de duda. Razonablemente seguro de que es un nombre legítimo.

El campo "confidence_offensive" debe ser un entero 0-100 representando tu
probabilidad estimada de que el input ES ofensivo.

═══════════════════════════════════════════════════════════════════════════
SÉ ESPECIALMENTE PARANOICO
═══════════════════════════════════════════════════════════════════════════

Es preferible un falso positivo (mandar a revisión humana un nombre limpio)
que un falso negativo (mostrar "Aitor Tilla" en el HALO ante 80.000 personas
y la prensa). Si dudas, eleva la sospecha.

Responde EXCLUSIVAMENTE con JSON ajustándote al esquema indicado.`;

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

export async function aiCheck(input) {
  const c = getClient();
  if (!c) {
    return {
      enabled: false,
      reason: 'ANTHROPIC_API_KEY no configurada',
    };
  }

  try {
    const response = await c.messages.create({
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
    });

    // Extrae el primer bloque de texto del response.
    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) {
      return {
        enabled: true,
        error: 'Sin bloque de texto en la respuesta',
        raw: response.content,
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch (e) {
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
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
      },
    };
  } catch (err) {
    return {
      enabled: true,
      error: err?.message ?? String(err),
      errorType: err?.constructor?.name,
    };
  }
}
