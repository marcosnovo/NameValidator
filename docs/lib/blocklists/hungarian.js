// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en húngaro (HU)
// ──────────────────────────────────────────────────────────────────────────
//
// Húngaro usa alfabeto latino con diacríticos especiales (ő, ű, á, é, í,
// ó, ö, ü). Tras stripDiacritics quedan en latín simple.
// El húngaro tiene un vocabulario muy rico de "káromkodás" (palabrotas).
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `hu.txt`
//   ▸ Curación manual — el húngaro carece de un repo MIT serio

export const hungarianProfanity = [
  // ── Núcleo vulgar húngaro
  'bassza', 'bassz', 'baszdmeg', 'baszdmegabasszátok', // baszni (follar)
  'baszott', 'baszki', 'baszás', 'baszas',
  'megbaszom', 'megbaszott', 'megbaszná',
  'baszdmegegot', 'baszdmegafapadot',
  'kurva', 'kurvák', 'kurvaisten', 'kurvaanyad',       // kurva (puta) — pivote del húngaro vulgar
  'kurvaanyat', 'kurvaanyádat', 'kurvaeletet',
  'kurvanagy', 'kurvajo', 'kurvasok',                  // intensificador vulgar
  'kurvaisten', 'kurvazene',
  'fasz', 'faszom', 'faszodat',                        // pene vulgar
  'faszfej', 'faszkalap', 'faszverő',                  // "cara/sombrero de pene"
  'faszszopo', 'faszszopó', 'faszbafingó',
  'faszer', 'faszul',
  'pina', 'picsa', 'picsába',                          // vagina vulgar
  'picsazsak', 'picsának', 'picsaszopo',
  'segg', 'seggfej', 'seggfeju', 'seggfejmagad',       // culo
  'segglyuk', 'seggdugó', 'seggszopo',
  'szar', 'szarházi', 'szaros', 'szarjon',             // mierda
  'szarcsimbok', 'szarbarom',
  'rohadt', 'rohadtul', 'rohadek', 'rohadékfia',       // "podrido" — vulgar
  'rohadjmeg',
  'idióta', 'idioto', 'idiotak',                       // idiota
  'hülye', 'hulye', 'hulyegyerek', 'hulyenyi',         // tonto/imbécil
  'gyokerei', 'gyökér',                                // peyorativo (lit. "raíz")
  'köcsög', 'kocsog', 'kocsogfasz', 'kocsogfej',       // slur homófobo
  'buzi', 'buzifaszhoz',                               // slur homófobo grave
  'leszbi-ribanc',                                     // peyorativo lésbico
  'ribanc', 'ribancok',                                // puta (ofensivo)
  'cigány', 'cigany', 'ciganygyerek',                  // gentilicio — sólo solo en contexto peyorativo
  'cigánybűnözés',                                     // peyorativo político
  'mocsok', 'mocskos',                                 // sucio (insulto)
  'szemét', 'szemet', 'szemétember',                   // basura (insulto)
  'pofakapot',
  'pofa', 'pofazni',                                   // peyorativo "cara"
  'fogdmagad',
  'menjafenebe',                                       // "vete a la mierda"
  'menjapicsába',
  'tököm', 'tökömkivan',                               // huevos vulgar
  'gecisrucik', 'geci', 'gecigyerek',                  // semen vulgar / insulto
  'fasszopó', 'fasszopo',
  'lófaszt',                                           // "una mierda" vulgar
  'cseszdmeg',                                         // versión light de baszd meg
  'francbamarcell',
  'kurvaisten', 'baszomanyat',                         // muy vulgares
  'sicc',                                              // peyorativo
  'felazistenit',
  'cikis', 'ciki',                                     // peyorativo / vergonzoso
  'parazsfasz',
  'putrigyerek',                                       // peyorativo socioeconómico
  'csocsogej',
  'tetves',                                            // peyorativo "piojo"
  'patkany', 'patkány',                                // "rata" como insulto
  'féregtelenseg', 'fereg',                            // "alimaña"

  // ── Apología extremista (Arrow Cross / Nyilas, Horthy fans)
  'nyilasista',                                        // pro-Cruz Flechada (fascista)
  'horthyfan',                                         // pro-régimen Horthy
  'szalasifan',                                        // pro-Ferenc Szálasi (líder fascista)
  'turul-rajongo',                                     // referencia ultra-nacionalista
  'mihaszna-hazafi',
  'nemzeti-radikalis',
  'nincs-zsido',                                       // referencia antisemita
  'cigany-mentes',                                     // referencia anti-romaní
];

export const hungarianJokeNames = [
  ['baszdmeg',         'expresión vulgar húngara muy común'],
  ['kurvaanyad',       '"tu puta madre" en húngaro'],
  ['faszkalap',        'insulto vulgar húngaro'],
  ['kocsogfasz',       'slur homófobo grave'],
  ['nyilasista',       'apología cruz flechada (fascista)'],
  ['szalasifan',       'apología líder fascista húngaro'],
  ['rohadekfia',       'insulto húngaro grave'],
  ['gecigyerek',       'insulto vulgar húngaro'],
  ['ciganymentes',     'referencia política anti-romaní'],
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
  'pofa',       // ambiguo
  'geci',       // muy corto
  'ciki',       // ambiguo (también significa "vergonzoso" suave)
  'cikis',
  'sicc',
  'tököm',
  'gyökér', 'gyokerei',
  'patkany', 'patkány',
  'fereg',
  'tetves',
  'mocsok',     // ambiguo
]);
