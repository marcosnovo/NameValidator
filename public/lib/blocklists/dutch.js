// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en holandés (NL)
// ──────────────────────────────────────────────────────────────────────────
//
// Holandés (Países Bajos + Bélgica/Flandes). Vocabulario vulgar muy
// extendido — los holandeses tienen mucha tradición de blasfemias
// basadas en enfermedades (kanker, tyfus) que son específicas y muy
// ofensivas.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `nl.txt`

export const dutchProfanity = [
  // ── Núcleo vulgar holandés (basado en enfermedades — muy específico)
  'kanker', 'kankerlijder', 'kankerhond',           // cáncer como insulto — extremo
  'kankerhoer', 'kankermongool', 'kankerwijf',
  'kankerkop', 'kankerkind', 'kankerhomo',
  'tering', 'teringlijder', 'teringhond',           // tuberculosis como insulto
  'teringwijf', 'teringkop',
  'tyfus', 'tyfuslijder', 'tyfushond', 'tyfuswijf', // tifus como insulto
  'tyfuskop',
  'klere', 'klerelijer', 'kleretering',             // cólera como insulto
  'pleuris', 'pleuristering',                       // pleuritis como insulto
  'pokken', 'pokkelaars',                           // viruela como insulto
  'godverdomme', 'godverdorie',                     // blasfemia común
  'godver', 'godsamme', 'godsa',
  'jezuschristus',                                  // blasfemia
  'jeetje', 'jezus',                                // mild
  'krijgdetering',                                  // "ojalá te dé tuberculosis"
  'krijgdekanker',
  'krijgdetyfus',

  // ── Vulgar tradicional
  'kut', 'kutkop', 'kutwijf', 'kutkind', 'kutmoeder',// vagina vulgar
  'kuttenkop',
  'lul', 'lullig', 'lulhannes', 'lullo',            // pene vulgar
  'lulhannes', 'lulkoekje', 'lulpaul',
  'pik', 'pikkie', 'pikgolf',                       // pene
  'klootzak', 'klote', 'kloothommel', 'klootviool', // huevos / "putada"
  'eikel', 'eikels',                                // bellota — pero peyorativo
  'hoer', 'hoerenkind', 'hoeren', 'hoerenzoon',     // puta
  'hoerenmoer',
  'slet', 'sletje', 'sletten',                      // puta
  'snol', 'snollen',                                // puta antiguo
  'mongool', 'mongolen', 'mongolenkop',             // capacitista
  'mongoloïde', 'mongoloide',
  'flikker', 'flikkers', 'flikkertje',              // slur homófobo
  'homo',                                           // ambiguo — gentilicio legítimo, usar contexto
  'nicht',                                          // ambiguo (también significa "prima")
  // 'pot' (peyorativo lésbico) eliminado — demasiado ambiguo,
  // colisiona con "Pol Pot", "potter", "potion", apellido "Pot", etc.
  'debiel', 'debielen',                             // capacitista
  'achterlijk', 'achterlijke',                      // capacitista
  'mafkees', 'mafkezen',                            // loco peyorativo
  'imbeciel',
  'kak', 'kakker',                                  // mierda
  'schijt', 'schijterd', 'schijtkop',               // mierda
  'stront', 'strontvent',                           // mierda
  'kontneuker',                                     // slur homófobo grave
  'kontlikker',                                     // peyorativo grave
  'reet', 'reetneuker', 'reetlikker',               // culo / vulgar
  'fucker', 'mof',                                  // mof = peyorativo anti-alemán
  'moffen',                                         // plural de mof
  'kouwe-kak',                                      // peyorativo socioeconómico
  'sukkel', 'sukkels',                              // tonto vulgar
  'lulpiet',                                        // peyorativo
  'opgeneukt',                                      // vulgar
  'opgerot',                                        // "vete a la mierda" mild
  'opgerotemoeder',                                 // vulgar
  'tyfusvent',
  'kankerwijf',
  'pleuriswijf',
  'lulnozem',
  'shitwijf',
  'rotzak', 'rotzakje',                             // peyorativo

  // ── Slurs étnicos
  'mocro',                                          // peyorativo (marroquíes)
  'kankerturk', 'kankermarokkaan',
  'kanakker',                                       // peyorativo
  'pinda',                                          // peyorativo (asiáticos)
  'kankerjood',                                     // antisemita
  'kafir',
  'spleetoog', 'spleetogen',                        // slur racial anti-asiático
  'roetmop',                                        // slur racial
  'neger',                                          // slur racial
  'zwartzaad',                                      // peyorativo

  // ── Apología nazi colaboracionismo (NSB)
  'nsbfan',
  'mussertfan',                                     // pro-Anton Mussert (líder NSB nazi colaboracionista)
  'rauterfan',                                      // pro-Hanns Rauter (criminal de guerra NL)
  'sieg-heil', 'siegheil',
  'wakkerwordnederland',                            // chant ultra-derecha
];

export const dutchJokeNames = [
  ['godverdomme',       'blasfemia holandesa fuerte'],
  ['kankerhoer',        'insulto vulgar holandés con enfermedad'],
  ['kankerhond',        'insulto vulgar con enfermedad'],
  ['klootzakvolledig',  'insulto holandés compuesto'],
  ['mussertfan',        'apología nazi colaboracionista NL'],
  ['krijgdekanker',     'maldición vulgar con enfermedad'],
  ['kontneuker',        'slur homófobo grave'],
  ['rauterfan',         'apología criminal de guerra NL'],
  ['kankermarokkaan',   'insulto vulgar racista combinado'],
  ['siegheil',          'saludo nazi'],
];

export const dutchExactOnly = new Set([
  'kut',    // muy corto, demasiados FP
  'lul',    // muy corto
  'pik',    // muy corto, también apellido (Pik)
  'kak',    // muy corto
  'homo',   // gentilicio
  'klote',
  'eikel',
  'mocro',  // gentilicio
  'pinda',  // alimento legítimo
  'mof',    // muy corto
  'reet',   // ambiguo (también significa "fila")
  'nicht',  // ambiguo (también significa "prima")
  'neger',  // sólo solo (también apellido raro y palabra históricamente neutral)
  'kafir',
  'snol',   // muy corto y arcaico
  'imbeciel', // común en contextos no peyorativos
  'rotzak', // muy común también como expresión light
]);
