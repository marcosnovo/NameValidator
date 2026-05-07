// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en húngaro (HU)
// ──────────────────────────────────────────────────────────────────────────
//
// Húngaro usa alfabeto latino con diacríticos especiales (ő, ű, á, é, í,
// ó, ö, ü). Tras stripDiacritics quedan en latín simple.
// El húngaro tiene un vocabulario muy rico de "káromkodás" (palabrotas).

export const hungarianProfanity = [
  // ── Núcleo vulgar húngaro
  'bassza', 'bassz', 'baszdmeg', 'baszdmegabasszátok',  // baszni (follar)
  'baszott', 'baszki',
  'kurva', 'kurvák', 'kurvaisten', 'kurvaanyad',         // kurva (puta) — pivote del húngaro vulgar
  'kurvaanyat',
  'fasz', 'faszom', 'faszodat',                          // pene vulgar
  'faszfej', 'faszkalap',                                 // "cara/sombrero de pene"
  'pina', 'picsa', 'picsába',                             // vagina vulgar
  'segg', 'seggfej', 'seggfeju',                          // culo
  'szar', 'szarházi', 'szaros',                           // mierda
  'rohadt', 'rohadtul',                                   // "podrido" — vulgar
  'idióta', 'idioto',                                     // idiota
  'hülye', 'hulye', 'hulyegyerek',                        // tonto/imbécil
  'köcsög', 'kocsog', 'kocsogfasz',                       // slur homófobo
  'buzi',                                                 // slur homófobo grave
  'cigány', 'cigany',                                     // gentilicio — sólo solo en contexto peyorativo
  'rohadékfia',
  'mocsok', 'mocskos',                                    // sucio (insulto)
  'szemét', 'szemet', 'szemétember',                      // basura (insulto)
  'pofakapot',

  // ── Apología extremista (Arrow Cross / Nyilas, Horthy fans)
  'nyilasista',                                           // pro-Cruz Flechada (fascista)
  'horthyfan',                                            // pro-régimen Horthy
];

export const hungarianJokeNames = [
  ['baszdmeg',         'expresión vulgar húngara muy común'],
  ['kurvaanyad',       '"tu puta madre" en húngaro'],
  ['faszkalap',        'insulto vulgar húngaro'],
  ['kocsogfasz',       'slur homófobo grave'],
  ['nyilasista',       'apología cruz flechada (fascista)'],
];

export const hungarianExactOnly = new Set([
  'fasz',       // muy corto, demasiados FP
  'segg',
  'szar',
  'pina',       // ambiguo
  'buzi',       // muy corto
  'hülye',
  'hulye',
  'cigany',     // gentilicio
  'idiot',      // demasiado común
]);
