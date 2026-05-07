// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en hebreo (HE) — transliterado
// ──────────────────────────────────────────────────────────────────────────
//
// Hebreo en transliteración latina. Los visitantes israelíes/judíos al
// Bernabéu usan habitualmente esta forma en formularios occidentales.
// El paso unconfuse y stripDiacritics ya neutralizan otros formatos.
//
// IMPORTANTE: NO bloqueamos nombres religiosos hebreos legítimos
// (David, Daniel, Sara, Miriam, Yosef…) ni palabras como "shalom" /
// "todah". Sólo profanidad clara.

export const hebrewProfanity = [
  // ── Vulgar (no muy extendido en hebreo, hay menos vocabulario obsceno
  //    nativo; gran parte del slang viene de yiddish y árabe)
  'kus', 'koos', 'kuss',          // כוס (vulgar para vagina, transliterado)
  'zayin',                         // זין (pene vulgar)
  'tachat',                        // תחת (culo, vulgar en algunos contextos)
  'manyak', 'manyaq',              // del árabe — "imbécil" / "loco"
  'nudnik',                        // del yiddish — pesado
  'shmuck', 'shmok',               // del yiddish — idiota / pene
  'putz', 'putzim',                // del yiddish — idiota / pene
  'momzer',                        // bastardo (yiddish)
  'gornisht',                      // "nada" peyorativo
  'shvitzer',                      // mentiroso/farolero
  'goy', 'goyim',                  // ambiguo en contexto antisemita inverso
  'shiksa', 'shiksas',              // peyorativo (no-judía)
  'kapo',                          // colaboracionista — uso muy ofensivo

  // ── Slurs / apología
  'kahanist',                      // referencia a Meir Kahane (extremismo)
  'lehibatla',
  'antisemit',                     // ambiguo, depende del uso
];

export const hebrewJokeNames = [
  ['kusachoteh',       'expresión vulgar hebrea'],
  ['benzona',          '"hijo de puta" en hebreo (literalmente "hijo de prostituta")'],
  ['kapostia',         'término muy ofensivo (colaboracionista nazi)'],
];

export const hebrewExactOnly = new Set([
  'kus',       // muy corto, también puede ser apellido/nombre raro
  'zayin',
  'goy',
  'goyim',
  'shiksa',
  'putz',      // muy común en jerga inglesa-yiddish
  'shmuck',
]);
