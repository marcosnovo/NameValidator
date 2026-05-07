// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en holandés (NL)
// ──────────────────────────────────────────────────────────────────────────
//
// Holandés (Países Bajos + Bélgica/Flandes). Vocabulario vulgar muy
// extendido — los holandeses tienen mucha tradición de blasfemias
// basadas en enfermedades (kanker, tyfus) que son específicas y muy
// ofensivas.

export const dutchProfanity = [
  // ── Núcleo vulgar holandés (basado en enfermedades — muy específico)
  'kanker', 'kankerlijder', 'kankerhond',           // cáncer como insulto — extremo
  'kankerhoer', 'kankermongool',
  'tering', 'teringlijder', 'teringhond',           // tuberculosis como insulto
  'tyfus', 'tyfuslijder', 'tyfushond',              // tifus como insulto
  'klere', 'klerelijer',                             // cólera como insulto
  'pleuris', 'pleuristering',                        // pleuritis como insulto
  'pokken', 'pokkelaars',                            // viruela como insulto
  'godverdomme',                                     // blasfemia común
  'godver', 'godsamme', 'godsa',

  // ── Vulgar tradicional
  'kut', 'kutkop', 'kutwijf',                        // vagina vulgar
  'lul', 'lullig', 'lulhannes',                      // pene vulgar
  'pik', 'pikkie',                                   // pene
  'klootzak', 'klote',                               // huevos / "putada"
  'eikel', 'eikels',                                 // bellota — pero peyorativo
  'hoer', 'hoerenkind', 'hoeren',                    // puta
  'slet', 'sletje',                                  // puta
  'mongool', 'mongolen',                             // capacitista
  'mongoloïde', 'mongoloide',
  'flikker', 'flikkers',                             // slur homófobo
  'homo',                                             // ambiguo — gentilicio legítimo, usar contexto
  // 'pot' (peyorativo lésbico) eliminado — demasiado ambiguo,
  // colisiona con "Pol Pot", "potter", "potion", apellido "Pot", etc.
  'debiel', 'debielen',                              // capacitista
  'achterlijk',                                      // capacitista
  'kak', 'kakker',                                   // mierda
  'schijt', 'schijterd',                             // mierda

  // ── Slurs étnicos
  'mocro',                                           // peyorativo (marroquíes)
  'kankerturk',
  'kanakker',                                        // peyorativo
  'pinda',                                           // peyorativo (asiáticos)
  'kankerjood',                                      // antisemita

  // ── Apología nazi colaboracionismo (NSB)
  'nsbfan',
  'mussertfan',                                      // pro-Anton Mussert (líder NSB nazi colaboracionista)
];

export const dutchJokeNames = [
  ['godverdomme',       'blasfemia holandesa fuerte'],
  ['kankerhoer',        'insulto vulgar holandés con enfermedad'],
  ['kankerhond',        'insulto vulgar con enfermedad'],
  ['klootzakvolledig',  'insulto holandés compuesto'],
  ['mussertfan',        'apología nazi colaboracionista NL'],
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
]);
