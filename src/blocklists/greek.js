// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en griego (EL) — transliteradas
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "βρισιές" (insultos) griegas más comunes, slurs y expresiones
// de doble sentido. Crítico porque:
//   ▸ Bernabéu Tour recibe miles de visitantes griegos anualmente.
//   ▸ Los visitantes griegos suelen rellenar el formulario con caracteres
//     LATINOS (transliterado), no con el alfabeto griego nativo. Cubrimos
//     ambas vías:
//       - El paso `unconfuse` del normalize convierte glifos confusables
//         (α griega → a latina, ε griega → e latina) automáticamente.
//       - Esta lista en transliteración latina pilla los formularios donde
//         el visitante directamente escribió en latino.
//   ▸ Los griegos tienen "βλάκας" (vlakas), "μαλάκας" (malakas) muy
//     extendidos como insultos genéricos.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos (ya quitados por NFD).
//  - Bloqueamos como subcadena en concatNoSpaces.
//  - Tokens muy cortos / ambiguos en `greekExactOnly`.

export const greekProfanity = [
  // ── Núcleo vulgar griego (transliteración común)
  'malakas', 'malaka', 'malakes', 'malakies',           // μαλάκας
  'vlakas', 'vlakes', 'vlakeia', 'vlakos',              // βλάκας (idiota)
  'gamoto', 'gamisou', 'gamiseta',                       // γαμώτο/γαμήσου
  'gamisi', 'gamisia', 'gamiete',
  'archidi', 'arxidi', 'archidia', 'arxidia',           // αρχίδι (cojón)
  'puthana', 'putana', 'poutana', 'poutanes',           // πουτάνα
  'gaidouri', 'gaidouria',                               // γαϊδούρι (burro/bestia)
  'kerato', 'keratomanos', 'keratos',                    // κέρατο (cuerno/cornudo)
  'mounis', 'mouni', 'mounaki',                          // vagina vulgar
  'pousthros', 'pousti', 'poustis', 'pousties',          // πούστης (slur homófobo)
  'aderfos', // (ambiguo — sólo en contexto homofóbico)
  'aderfismos',
  'tsoula', 'tsoules',                                   // τσούλα
  'vromiari', 'vromiaria',                               // βρωμιάρης
  'kareklas',                                            // jerga vulgar
  'gamao', 'gamame', 'gameno',                           // γαμώ
  'skata', 'skatosa',                                    // σκατά (mierda)
  'kolarakis', 'kolaraki',
  'kolos', 'kolokoutsoura',                              // κώλος (culo)
  'gomena',                                              // jerga vulgar (mujer)

  // ── Slurs étnico-religiosos
  'tsigganos', 'tsigganoi',                              // slur (gitanos)
  'arvanitos', 'arvanitisas',                            // peyorativo
  'mavros', 'mavri',                                     // ambiguo: literal "negro"
  'kineisaras', 'kinezos',                               // peyorativo (chinos)
  'tourkos', 'tourkoi',                                  // ambiguo, depende del contexto
  'ovrios', 'ovrioi',                                    // peyorativo (judíos)
  'bouligaroi',                                          // peyorativo
  'fasistas',                                            // ambiguo

  // ── Apología extremista (nacionalismo extremo, Junta de los coroneles)
  'xrysiavgi', 'chrysiavgi', 'chrysi-avgi',              // Aurora Dorada (neonazi)
  'xa', 'thaerthi', 'thaerthi-xa',                       // chants neonazi
  'ellineixrysi',
  'antartis',                                            // ambiguo

  // ── Frases compuestas / dobles sentidos
  'kafromounis',
  'pordi',                                               // πέρδω (pedo)
  'archidofatsa', 'arxidofatsa',                         // "cara de cojón"
];

export const greekJokeNames = [
  ['malakasiagas',     'expresión vulgar griega muy ofensiva'],
  ['gamiseta',         'expresión sexual vulgar'],
  ['gamoto',           'expresión vulgar genérica'],
  ['poutanasou',       '"tu puta madre" en griego'],
  ['xrysiavgi',        'apología neonazi (Aurora Dorada)'],
  ['kavlonaikos',      'sexual vulgar griego'],
  ['archidofatsa',     '"cara de cojón" — insulto vulgar'],
];

export const greekExactOnly = new Set([
  'mavros',     // literal "negro" — muy ambiguo en español/inglés
  'tourkos',    // demasiado ambiguo
  'aderfos',    // significa "hermano" — sólo solo en contexto homófobo
  'antartis',   // ambiguo (también guerrilla)
  'fasistas',
  'xa',         // demasiado corto
  'gamao',      // demasiado corto/ambiguo
  'pordi',
  'mouni',
  'kolos',      // existe como apellido raro
]);
