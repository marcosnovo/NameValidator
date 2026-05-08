// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en checo (CZ)
// ──────────────────────────────────────────────────────────────────────────
//
// Checo usa alfabeto latino con diacríticos (á, č, ď, é, ě, í, ň, ó, ř,
// š, ť, ú, ů, ý, ž). Tras stripDiacritics quedan en latín simple. La
// variante eslovaca es muy similar — esta lista cubre ambos.
//
// Importante: muchos visitantes checos al Bernabéu son pareja de un
// español o aficionado del Madrid (significativa comunidad).

export const czechProfanity = [
  // ── Núcleo vulgar checo
  'kurva', 'kurevsko', 'kurevskej', 'kurvanama',          // puta (tomado del polaco)
  'piča', 'pica', 'picus', 'picovina',                     // vagina vulgar
  'čurák', 'curak', 'curacek',                             // pene vulgar
  'čůrak', 'curat',                                        // variantes
  'vůl', 'vul', 'volové', 'volove',                        // "buey" → idiota
  'debil', 'debilní', 'debilni',                           // capacitista (compartido con RO)
  'pitomec', 'pitomče', 'pitomec',                         // imbécil
  'idiot', 'idiotský', 'idiotsky',
  'magor',                                                  // loco/idiota
  'sráč', 'srac', 'sracka',                                // mierda
  'hovno', 'hovenka', 'hovínko',                           // mierda (suave)
  'prdel', 'prdele', 'prdelka', 'doprdele',                // culo
  'kokot', 'kokotek', 'kokotina',                          // imbécil/pene
  'mrdat', 'mrdka', 'mrdoch',                              // follar
  'jebat', 'jebnutí', 'jebnuti', 'zjebanej',               // verbo vulgar
  'sakra', 'krucinál',                                     // exclamaciones (ambiguas)
  'parchant', 'parchanta',                                  // bastardo
  'svině', 'svine',                                        // cerdo (insulto)
  'zmrd', 'zmrdi', 'zmrde',                                // insulto fuerte
  'buzerant', 'buzna',                                      // slur homófobo
  'cigán', 'cigan', 'cikán', 'cikan',                      // gentilicio peyorativo (gitanos)
  'huba',                                                   // boca (vulgar)
  'kreten',                                                 // cretino

  // ── Apología fascista (Vlajka, Sudetos) y comunista (KSČ)
  'gajda',                                                  // figura colaboracionista
  'koniasstvi',
  'sudetynas',                                              // pro-anexión nazi
  'svobodnyzapad',
];

export const czechJokeNames = [
  ['doprdele',         'expresión vulgar checa muy común'],
  ['jebnutej',         'insulto fuerte checo'],
  ['kokotek',          'insulto vulgar checo'],
  ['hovnozzraty',      'insulto escatológico checo'],
  ['svinackazjebana',  'expresión vulgar compuesta'],
];

export const czechExactOnly = new Set([
  'vůl', 'vul',         // común y ambiguo (también nombre de animal)
  'huba',               // muy corto
  'pica',               // ambiguo
  'sakra',              // demasiado suave/común
  'idiot',              // común en otros idiomas
  'debil',              // común en otros idiomas
  'magor',              // muy corto
  'kreten',             // ambiguo
  'cigan',              // gentilicio
]);
