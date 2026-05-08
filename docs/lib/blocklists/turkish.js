// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en turco (TR)
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "küfür" (palabrotas) turcas más comunes y slurs. Importante:
//   ▸ Turquía envía bastantes turistas al Bernabéu (~3-5% del Tour).
//   ▸ El turco usa alfabeto latino con diacríticos (ş, ç, ı, ö, ü, ğ).
//     Tras stripDiacritics quedan en latino simple, pero los usuarios a
//     veces los escriben sin acentos directamente.
//   ▸ Tenemos vocabulario muy específico de "ana avrat" (insultos a la
//     madre/familia) que no aparecen en otros idiomas.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos.
//  - Bloqueamos como subcadena en concatNoSpaces.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/ooguz/turkce-kufur-karaliste (CC BY-SA 4.0 — atribución
//     en CREDITS.md)
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `tr.txt`

export const turkishProfanity = [
  // ── Núcleo vulgar turco
  'amina', 'amini', 'amine', 'aminda', 'aminakoyduğum',  // "vagina"
  'amınakoyim', 'aminakoy', 'aminakoyduklarim',
  'amcik', 'amcigi', 'amcuk',                            // diminutivo vulgar
  'amk', 'amka', 'amkoyim', 'amkoyiyim',                 // "amına koyim" abreviado
  'amckafali', 'amciksuratli',
  'sikim', 'sikimi', 'sikme', 'sikmek', 'sikis',         // sik (pene/follar)
  'sikerim', 'sikiyim', 'sikiyom', 'sikilmis',
  'sikko', 'siktimini',
  'siktir', 'siktirgit', 'siktirlanetli',                // siktir (vete a la mierda)
  'siktirol', 'siktirolgit',
  'goet', 'gotu', 'gote', 'goetveren',                   // göt (culo) → gotveren = slur homófobo
  'gotlek', 'gotveren', 'gotcu', 'gotvermek',
  'gotdelik', 'goturum',
  'orospucocugu', 'orospu', 'orospunun',                 // "puta"
  'orospudur', 'orospuevladi', 'orospunun-evladi',
  'kahpeçocuğu', 'kahpe', 'kahpenin',                    // kahpe (puta)
  'kahpefendi', 'kaltakkahpe',
  'kaltak', 'kaltaklar',                                 // puta
  'piç', 'pic', 'piçkurusu', 'pickurusu',                // bastardo
  'piçherif', 'picleri',
  'yarrak', 'yarragim', 'yarrakkafa',                    // pene vulgar
  'yarrak-kafali', 'yarakcocugu',
  'taşak', 'tasak', 'tasakkafa', 'tasakli',              // testículo
  'bok', 'boktan', 'bokyemis', 'bokyiyici',              // mierda
  'boklumussekkulu', 'boksuratlim',
  'aptalsin', 'aptal',                                   // tonto
  'salak', 'salaksin', 'salakca',                        // estúpido
  'manyak', 'manyaksin',                                 // "loco" como insulto
  'ibne', 'ibnelik', 'ibneoğlanı', 'ibneoglanlar',       // slur homófobo
  'puşt', 'pust', 'puştluk', 'puştboğas',                // slur homófobo
  'sürtük', 'surtuk', 'surtuklerin',                     // puta
  'yavşak', 'yavsak', 'yavşakherif',                     // sinvergüenza
  'şerefsiz', 'serefsiz', 'serefsiz-herif',              // "sin honor"
  'allahbelaniversinitin', 'allahbelaniversin',
  'kıçında', 'kicinda', 'kicinakoyim',
  'inekkafa', 'eseksefil',
  'soysuz', 'soysuzlar',                                 // "sin linaje" (insulto)
  'cocukcatlatic',                                       // peyorativo
  'huysuz', 'huysuzlar',                                 // peyorativo (más mild)
  'sapkin', 'sapık',                                     // pervertido
  'gerizekali', 'geri-zekali',                           // capacitista
  'mongoloid', 'moron',
  'salakkafa', 'eşeklikedi',
  'köpoğlu', 'kopoglu',                                  // "hijo de perro"
  'köpekçocuk', 'kopekcocuk',
  'edepsiz', 'haysiyetsiz',                              // sin vergüenza
  'ahlaksiz', 'ahlaksızlar',                             // inmoral (insulto)
  'firsatci',                                            // peyorativo
  'iblishak', 'iblishakal',                              // "diablo" como insulto
  'cangaz',
  'tukurmek-istiyorum',
  'şıllık', 'sillik',                                    // peyorativo misógino
  'serserisin', 'serseri',                               // peyorativo
  'rezilcocuk', 'rezilkadin',
  'tilkikafali',
  'cocukpuzzulli',

  // ── Insultos a la familia
  'ananisikem', 'ananisikim', 'ananisikiyim',            // ana (madre) — muy ofensivo
  'anasiniavradini', 'anasiavradini',
  'avradini', 'avratini', 'avradinasiktigim',
  'sikteanan', 'sikiteanan', 'sikteyimanan',
  'ananaminacigi',
  'ananiavradini',
  'analay-avradini', 'avradinin-amini',
  'sülaleni', 'sulaleni',                                // "tu linaje" usado vulgarmente
  'soyunusikim',
  'aileniavradini',

  // ── Slurs étnicos
  'kürt',                                                // ambiguo — gentilicio legítimo, sólo solo en contexto vulgar
  'ermeni',                                              // gentilicio, sólo en contexto peyorativo
  'cingen', 'cingene', 'cingenler',                      // slur (gitanos)
  'rumlar', 'rum',                                       // ambiguo (griegos)
  'gavur', 'gavurlar',                                   // peyorativo (no-musulmán)
  'arabsiy', 'arap',                                     // ambiguo
  'pomak',                                               // peyorativo
  'fellah',                                              // peyorativo

  // ── Apología extremista (terrorismo, conflictos)
  'pkk', 'pkkfan', 'pkkterör',                           // organización terrorista
  'pkkdestekçi',
  'isidlider', 'iidlider', 'isisfan',                    // ISIS variantes
  'mustafakemaldushman',                                 // anti-Atatürk extremista
  'fetö', 'feto', 'fetöfan',                             // referencia política controvertida
  'darbe-fan',                                           // pro-golpe militar
  'soykirim-yalan',                                      // negacionismo Genocidio Armenio
  'srebrenica-yalan',                                    // negacionismo Srebrenica
  'enver-pasa-fan',                                      // pro-figura controvertida
  'talat-pasa-fan',                                      // pro-figura controvertida
];

export const turkishJokeNames = [
  ['siktirgit',        'expresión vulgar turca'],
  ['amkoyim',          'insulto sexual turco a la madre'],
  ['orospucocugu',     '"hijo de puta" en turco'],
  ['ananisikem',       'insulto sexual a la madre'],
  ['siktirlanetli',    'expresión vulgar'],
  ['gotveren',         'slur homófobo turco'],
  ['serefsiz',         'insulto fuerte turco'],
  ['kopoglu',          '"hijo de perro" en turco'],
  ['fetöfan',          'referencia política turca controvertida'],
  ['enverpasafan',     'apología figura histórica controvertida'],
  ['soykirimyalan',    'negacionismo Genocidio Armenio'],
];

export const turkishExactOnly = new Set([
  'amk',         // muy corto
  'pic',         // existe como apellido raro
  'bok',         // demasiado corto
  'kürt',        // gentilicio legítimo
  'ermeni',      // gentilicio
  'rum',         // gentilicio
  'kurd',
  'pkk',         // sólo solo
  'arap',        // gentilicio
  'pomak',       // gentilicio
  'fellah',
  'mongoloid',   // capacitista usado como sustantivo — sólo solo
  'moron',       // común en inglés
  'fetö', 'feto',// sólo solo
  'sapik',       // común también como apellido raro
  'sapkin',
  'soysuz',
  'huysuz',
  'serseri',
  'tasak',
  'manyak',      // muy común en árabe también
  'gavur',
  'goet',
  'salak',
]);
