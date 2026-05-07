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

export const turkishProfanity = [
  // ── Núcleo vulgar turco
  'amina', 'amini', 'amine', 'aminda',                   // "vagina"
  'amcik', 'amcigi',                                      // diminutivo vulgar
  'amk', 'amka', 'amkoyim', 'amkoyiyim',                  // "amına koyim" abreviado
  'sikim', 'sikimi', 'sikme', 'sikmek', 'sikis',         // sik (pene/follar)
  'sikerim', 'sikiyim', 'sikiyom',
  'sikko',
  'siktir', 'siktirgit', 'siktirlanetli',                 // siktir (vete a la mierda)
  'goet', 'gotu', 'gote', 'goetveren',                    // göt (culo) → gotveren = slur homófobo
  'orospucocugu', 'orospu', 'orospunun',                  // "puta"
  'kahpeçocuğu', 'kahpe', 'kahpenin',                     // kahpe (puta)
  'piç', 'pic', 'piçkurusu', 'pickurusu',                 // bastardo
  'yarrak', 'yarragim', 'yarrakkafa',                     // pene vulgar
  'taşak', 'tasak', 'tasakkafa',                          // testículo
  'bok', 'boktan', 'bokyemis', 'bokyiyici',               // mierda
  'aptalsin', 'aptal',                                    // tonto
  'salak', 'salaksin', 'salakca',                         // estúpido
  'manyak',                                               // "loco" como insulto
  'ibne', 'ibnelik',                                      // slur homófobo
  'puşt', 'pust',                                         // slur homófobo
  'gotlek',                                               // slur homófobo
  'sürtük', 'surtuk',                                     // puta
  'yavşak', 'yavsak',                                     // sinvergüenza
  'şerefsiz', 'serefsiz',                                 // "sin honor"
  'allahbelaniversinitin', 'allahbelaniversin',
  'kıçında', 'kicinda',
  'inekkafa',

  // ── Insultos a la familia
  'ananisikem', 'ananisikim', 'ananisikiyim',             // ana (madre) — muy ofensivo
  'anasiniavradini',
  'avradini', 'avratini',
  'sikteanan', 'sikiteanan',
  'ananaminacigi',
  'ananiavradini',

  // ── Slurs étnicos
  'kürt', // ambiguo — gentilicio legítimo, sólo solo en contexto vulgar
  'ermeni', // gentilicio, sólo en contexto peyorativo
  'cingen', 'cingene', 'cingenler',                       // slur (gitanos)
  'rumlar', 'rum',                                        // ambiguo (griegos)
  'gavur',                                                // peyorativo (no-musulmán)

  // ── Apología extremista (terrorismo, conflictos)
  'pkk',                                                  // organización terrorista
  'pkkfan',
  'isidlider',                                            // ISIS variantes
  'mustafakemaldushman',                                  // anti-Atatürk extremista
];

export const turkishJokeNames = [
  ['siktirgit',        'expresión vulgar turca'],
  ['amkoyim',          'insulto sexual turco a la madre'],
  ['orospucocugu',     '"hijo de puta" en turco'],
  ['ananisikem',       'insulto sexual a la madre'],
  ['siktirlanetli',    'expresión vulgar'],
  ['gotveren',         'slur homófobo turco'],
  ['serefsiz',         'insulto fuerte turco'],
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
]);
