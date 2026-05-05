// ──────────────────────────────────────────────────────────────────────────
//  Tests golden — corpus de validación del HALO Name Validator
// ──────────────────────────────────────────────────────────────────────────
//
// Cada caso es [input, verdict_esperado, comentario_opcional].
// Los tests corren con `node --test` (built-in en Node 20+, sin deps).
// Run: `node --test tests/`
//
// Convención de verdicts:
//   ▸ ALLOWED  — limpio
//   ▸ REVIEW   — revisión humana (medium severity, doubt 50-70)
//   ▸ REJECTED — rechazo automático (high severity, doubt 100)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from '../src/validator.js';

// Skip AI en todos los tests — son deterministas sobre la capa estática
// + format. La capa AI requiere red (Anthropic API o proxy) y se prueba
// por separado.
const OPTS = { skipAI: true };

const CASES = {
  // ════════════════════════════════════════════════════════════════════════
  //  CLEAN — nombres legítimos que NO deben dispararse
  // ════════════════════════════════════════════════════════════════════════
  clean: [
    ['Carlos Andrés Mejía',          'ALLOWED'],
    ['Juan García López',            'ALLOWED'],
    ['María José Pérez Sánchez',     'ALLOWED'],
    ['Ana Martínez',                 'ALLOWED'],
    ['Pedro García Pérez',           'ALLOWED'],
    ['Wolfgang Schmidt',             'ALLOWED', 'alemán limpio'],
    ['Anna Müller',                  'ALLOWED', 'alemán limpio'],
    ['Hans Becker',                  'ALLOWED', 'alemán limpio'],
    ['Mario Rossi',                  'ALLOWED', 'italiano clásico'],
    ['Giuseppe Verdi',               'ALLOWED', 'italiano clásico'],
    ['Giulia Bianchi',               'ALLOWED', 'italiano limpio'],
    ['John Smith',                   'ALLOWED', 'inglés clásico'],
    ['Jean Dupont',                  'ALLOWED', 'francés clásico'],
    ['João Silva',                   'ALLOWED', 'portugués clásico'],
    // Apellidos legítimos que contienen subcadena potencialmente problemática
    ['María Gay Domínguez',          'ALLOWED', 'apellido Gay (~5000 personas INE)'],
    ['Pedro Mearín García',          'ALLOWED', 'apellido gallego'],
    ['Carlos Cumbria López',         'ALLOWED', 'topónimo UK Cumbria'],
    ['María Concepción García',      'ALLOWED'],
    ['Ana Pizarro Hernández',        'ALLOWED', 'Pizarro común — fix Scunthorpe'],
    ['María Escobar García',         'ALLOWED', 'Escobar común — fix reverso "rabo"'],
    ['Pedro Castro Ruiz',            'ALLOWED'],
    ['Andrés Trump',                 'ALLOWED', 'Trump como apellido alemán/EE.UU.'],
    // Nombres legítimos con apellidos coincidentes con jugadores rivales
    ['Ángela Guardiola Guardiola',   'ALLOWED', 'apellido catalán común'],
    ['Marta Iniesta',                'ALLOWED', 'apellido legítimo'],
    ['Pedro Piqué López',            'ALLOWED'],
    ['Juan Puyol',                   'ALLOWED'],
    // Real Madrid actual — nunca rechazar
    ['Vinicius Junior',              'ALLOWED'],
    ['Jude Bellingham',              'ALLOWED'],
    ['Luka Modric',                  'ALLOWED'],
    // Religious mainstream — NO deben rechazarse
    ['Jesús García López',           'ALLOWED', 'Jesús nombre común'],
    ['Mohammed Ali',                 'ALLOWED', 'nombre legítimo común'],
    ['María Buddha',                 'ALLOWED', 'no en blocklist religiosa'],
    ['Pedro Krishna',                'ALLOWED', 'no en blocklist religiosa'],
  ],

  // ════════════════════════════════════════════════════════════════════════
  //  REJECTED — profanidad evidente, debe bloquearse en seco
  // ════════════════════════════════════════════════════════════════════════
  profanity: [
    ['mierda López',                 'REJECTED', 'profanidad ES directa'],
    ['cabrón García',                'REJECTED'],
    ['Susana Oria',                  'REJECTED', 're-segmentación "su zanahoria"'],
    ['Aitor Tilla',                  'REJECTED', '"a tortilla"'],
    ['Mike Hunt',                    'REJECTED', 'EN re-segmentación'],
    ['Jean Bon',                     'REJECTED', 'FR "jambon"'],
    ['Anne Culé',                    'REJECTED', 'FR "enculé"'],
    // Trampa por re-segmentación phonetic
    ['Carlos Gil Hipoyas',           'REJECTED', '"gilipollas"'],
    ['Mar Higuan Arica',             'REJECTED', '"marihuana"'],
    ['Warra López',                  'REJECTED', 'w→gu fonético "guarra"'],
    // Apología fascista / nazi
    ['Heil Hitler',                  'REJECTED'],
    ['Sieg Heil',                    'REJECTED'],
    // Profanidad alemana
    ['Hans Scheisse',                'REJECTED', 'profanidad DE'],
    ['Klaus Arschloch',              'REJECTED', 'insulto DE'],
    ['Heinrich Wichser',             'REJECTED', 'insulto DE'],
    // Profanidad italiana
    ['Mario Cazzone',                'REJECTED', 'profanidad IT'],
    ['Luigi Stronzo',                'REJECTED', 'profanidad IT'],
    ['Antonio Coglione',             'REJECTED', 'profanidad IT'],
    ['Porco Madonna',                'REJECTED', 'bestemmia IT'],
    ['Vaffanculo Pirla',             'REJECTED', 'IT vulgar'],
    // Real Madrid context
    ['Vinicius mono',                'REJECTED', 'racismo contextual'],
    ['Madrid de mierda',             'REJECTED', 'chant anti-Madrid'],
    ['Visca el Barça',               'REJECTED', 'chant rival'],
    ['Pep Guardiola',                'REJECTED', 'identidad jugador rival'],
    // Profanidad inglesa explícita
    ['Mike Cunt',                    'REJECTED'],
    ['Hugh Jass',                    'REJECTED', '"huge ass"'],
  ],

  // ════════════════════════════════════════════════════════════════════════
  //  REVIEW — figuras históricas polémicas (revisión humana)
  // ════════════════════════════════════════════════════════════════════════
  historical: [
    // Dictadores / régimen nazi
    ['Adolf Hitler',                 'REVIEW'],
    ['Francisco Franco',             'REVIEW'],
    ['Francisco Franco García',      'REVIEW', 'persona real posible'],
    ['Iosif Stalin',                 'REVIEW'],
    ['Stalin Iosif',                 'REVIEW', 'orden invertido'],
    ['Joseph Goebbels',              'REVIEW'],
    ['Klaus Barbie',                 'REVIEW'],
    ['Vidkun Quisling',              'REVIEW'],
    // Otros dictadores
    ['Pol Pot',                      'REVIEW'],
    ['Vladimir Putin',               'REVIEW'],
    ['Mao Zedong',                   'REVIEW'],
    ['Mobutu Sese Seko',             'REVIEW'],
    ['Bashar al-Assad',              'REVIEW'],
    // Asesinos en serie
    ['Ted Bundy',                    'REVIEW'],
    ['Jeffrey Dahmer',               'REVIEW'],
    ['Charles Manson',               'REVIEW'],
    ['Pedro Alonso López',           'REVIEW'],
    ['Charles Sobhraj',              'REVIEW'],
    ['Joan Vila',                    'REVIEW'],
    // Tiradores de masas
    ['Adam Lanza',                   'REVIEW'],
    ['Anders Breivik',               'REVIEW'],
    ['Brenton Tarrant',              'REVIEW'],
    ['Andreas Lubitz',               'REVIEW'],
    // Mafia / narcos
    ['Pablo Escobar',                'REVIEW', 'fix Scunthorpe + match histórico'],
    ['Joaquín Guzmán',               'REVIEW'],
    ['Lucky Luciano',                'REVIEW'],
    ['Al Capone',                    'REVIEW'],
    // Sectas / abuso religioso
    ['Jim Jones',                    'REVIEW'],
    ['David Koresh',                 'REVIEW'],
    ['Shoko Asahara',                'REVIEW'],
    ['Marshall Applewhite',          'REVIEW'],
    ['Marcial Maciel',               'REVIEW'],
    ['Theodore McCarrick',           'REVIEW'],
    // Apellidos polémicos raros sueltos
    ['Pedro Hitler',                 'REVIEW', 'apellido extremadamente raro'],
    ['María Goebbels',               'REVIEW'],
    ['Pablo Mussolini',              'REVIEW'],
    ['Pedro Dahmer',                 'REVIEW'],
    ['María Klebold',                'REVIEW'],
    ['Carlos Sobhraj',               'REVIEW'],
    ['María Maciel',                 'REVIEW'],
    ['Pedro Asahara',                'REVIEW'],
  ],

  // ════════════════════════════════════════════════════════════════════════
  //  Tests específicos de re-segmentación fonética
  // ════════════════════════════════════════════════════════════════════════
  phonetic: [
    ['Esther Colero',                'REJECTED', '"esterculero" → escatológico'],
    ['Tu Padre Es Amunike',          'REJECTED', '"un mike" / "mi puta madre"'],
    ['Doli Dadelano',                'REJECTED', '"do lid de la no"'],
    ['Carmen Abo Duro',              'REJECTED', '"Carme nabo duro"'],
    ['Joaquín Chocha Zogrande',      'REJECTED'],
    ['María Unpajote',               'REJECTED', '"un pajote"'],
    ['Ione Cesi Tomear',             'REJECTED', '"ione cesi to mear"'],
    ['Devora Melo',                  'REJECTED'],
    ['Zoila Cerda',                  'REJECTED'],
    ['Eugenio Dela Lampara',         'REJECTED', '"eu genio de la lampara"'],
  ],
};

// ─── Ejecutor de cada batch ─────────────────────────────────────────────
for (const [batchName, cases] of Object.entries(CASES)) {
  test(`golden — ${batchName} (${cases.length} casos)`, async (t) => {
    const fails = [];
    for (const [input, expected, note] of cases) {
      const r = await validateName(input, OPTS);
      if (r.verdict !== expected) {
        fails.push({
          input,
          expected,
          got: r.verdict,
          doubt: r.doubt_percent,
          note,
          reasons: r.reasons.slice(0, 2).map((x) => `[${x.severity}] ${x.message?.slice(0, 80)}`),
        });
      }
    }
    if (fails.length) {
      const summary = fails.map((f) =>
        `  ✗ ${JSON.stringify(f.input)} esperaba ${f.expected} → ${f.got}` +
        (f.note ? `  (${f.note})` : '') +
        '\n    ' + f.reasons.join('\n    ')
      ).join('\n');
      assert.fail(`${fails.length}/${cases.length} fallos en batch "${batchName}":\n${summary}`);
    }
  });
}

// ─── Validaciones estructurales del veredicto ──────────────────────────
test('estructura del veredicto', async () => {
  const r = await validateName('Pablo Escobar', OPTS);
  assert.equal(typeof r.verdict, 'string');
  assert.equal(typeof r.doubt_percent, 'number');
  assert.ok(Array.isArray(r.reasons));
  assert.ok(r.elapsed_ms < 100, 'static-only debe completarse en <100ms');
  assert.equal(r.input, 'Pablo Escobar');
});

test('format check rechaza inputs inválidos', async () => {
  const empty = await validateName('', OPTS);
  assert.notEqual(empty.verdict, 'ALLOWED');

  const tooLong = await validateName('a'.repeat(100), OPTS);
  assert.notEqual(tooLong.verdict, 'ALLOWED');

  const numbers = await validateName('Pedro 123', OPTS);
  assert.notEqual(numbers.verdict, 'ALLOWED', 'caracteres no permitidos');
});
