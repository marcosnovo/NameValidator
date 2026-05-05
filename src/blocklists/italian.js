// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en italiano (IT)
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre vulgaridades, insultos, slurs, terminología sexual, blasfemias y
// términos ofensivos italianos. Italiano tiene un sistema de blasfemia
// ("bestemmie") muy específico — referencias a Dios + adjetivo o animal —
// que decidimos NO bloquear como subcadena (los nombres como "Dio", "Madre"
// son legítimos) sino como secuencias completas.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos.
//  - El motor las busca como subcadena en concatNoSpaces.
//  - Palabras < 4 chars o ambiguas → `italianExactOnly`.

export const italianProfanity = [
  // ── Vulgaridades / sexo
  'cazzo', 'cazzi', 'cazzone', 'cazzata', 'cazzate', 'cazzaro',
  'incazzato', 'incazzata', 'incazzarsi',
  'minchia', 'minchie', 'minchione', 'minchiata',
  'fica', 'figa', 'fighe', 'fighetta', 'fighetto',
  'topa', 'tope', 'topetta',  // jerga vulgar para vagina
  'patacca', 'patacche',
  'pisello', 'piselli', 'pisellone',  // diminutivo común vulgar
  'bocchino', 'bocchini', 'bocchinara',  // mamada
  'pompino', 'pompini', 'pompinara',     // mamada
  'troia', 'troie', 'troione', 'troiaio', 'troione',
  'puttana', 'puttane', 'puttanata', 'putanesca', 'puttaniere',
  'figliodiputtana', 'figliadiputtana',
  'mignotta', 'mignotte',
  'zoccola', 'zoccole',
  'baldracca', 'baldracche',
  'sgualdrina',
  'merda', 'merde', 'merdaiolo', 'merdoso', 'merdaccia',
  'stronzo', 'stronza', 'stronzate', 'stronzata',
  'culo', 'culone', 'culona', 'culatone', 'culattone',  // últimos dos = slur homófobo
  'inculato', 'inculata', 'inculare',
  'sborra', 'sborrata', 'sborrare',
  'sega', 'seghe', 'segaiolo', 'segona',  // masturbación
  'cesso', 'cessi',  // jerga "feo"
  'pirla', 'pirlone',  // "imbécil" en lombardo
  'coglione', 'coglioni', 'coglionata',
  'fottuto', 'fottuta', 'fottiti', 'fottere', 'fanculo',
  'vaffanculo', 'vaffanculo', 'vacca', 'vacca boia',
  'porco', 'porca', 'porcata', 'porcheria',
  'porco dio', 'porcodio', 'porcoddio', 'portroia',
  'mannaggia', 'maledetto', 'maledetta',
  'cretino', 'cretina', 'cretinone',
  'imbecille', 'imbecilli',
  'bastardo', 'bastarda', 'bastardi',
  'rincoglionito',
  'mortacci',  // expresión vulgar romana ("morto a tuoi cari")
  'tuasorella', 'tuamadre',
  'pezzodimerda', 'pezzo di merda',
  'bastonata', 'bastonati',

  // ── Bestemmie (blasfemia italiana — secuencias completas)
  'porcomadonna', 'porcamadonna', 'porcaputtana', 'porcoddio',
  'dioporco', 'diocane', 'diomerda', 'dioboia',
  'madonnaputtana', 'madonnaladra', 'madonnatroia',
  'cristomerda', 'gesumerda',
  'sangueddio', 'sanguedellamadonna',
  'mortodiodio', 'mortacciuoi', 'mortaccituoi',

  // ── Slurs étnicos / homófobos / racistas
  'negro', 'negri', 'negraccio', 'negretto',  // slur racial italiano
  'mulatto', 'mulatti',  // peyorativo
  'terrone', 'terroni',   // slur antimeridionalista
  'polentone', 'polentoni', // slur antinordista (menos grave)
  'crucco', 'crucchi',    // peyorativo alemán
  'frocio', 'froci', 'frocia', 'froce',  // slur homófobo grave
  'ricchione', 'ricchioni',  // slur homófobo
  'culattone', 'culattoni',  // slur homófobo
  'finocchio', 'finocchi',   // slur homófobo (mismo de hinojo, ambiguo)
  'lella', 'lellona',
  'zingaro', 'zingari',  // peyorativo (gitanos)
  'ebreaccio',
  'mongolo', 'mongoloide', 'mongoloidi',  // capacitista

  // ── Apología fascista / nazi italiana
  'vivailduce', 'evvivailduce',
  'eiailduce', 'forzaduce',

  // ── Insultos compuestos típicos italianos
  'mortodifame', 'mortodifame',
  'rottoinculo', 'rottinculo',
  'figliodiputtana',
  'pezzodimerda', 'pezzodicarogna',
  'mannaggiaaltua', 'mannaggia alla tua',
];

// Frases-trampa italianas (re-segmentación fonética). Tuplas [forma, motivo].
export const italianJokeNames = [
  ['ungrancazzo',          'frase vulgar italiana'],
  ['tuamadrelaputtana',    'insulto sexual italiano'],
  ['figliodiputtana',      '"hijo de puta" en italiano'],
  ['unvaffanculo',         'expresión muy vulgar italiana'],
  ['tisborro',             'sexual vulgar italiano'],
  ['tichiavo',             'sexual vulgar italiano'],
  ['rottinculo',           'insulto homófobo / sexual'],
  ['mortodifame',          'insulto italiano'],
  ['porcomadonna',         'bestemmia italiana'],
  ['porcoddio',            'bestemmia italiana'],
  ['porcadellamadonna',    'bestemmia italiana'],
  ['mortaccituoi',         'insulto vulgar romano'],
  ['vivailduce',           'apología fascista italiana'],
  ['evvivailduce',         'apología fascista italiana'],
];

// Tokens cortos / ambiguos — sólo bloquean como token completo.
export const italianExactOnly = new Set([
  'fica', 'figa',          // como apellido raro existe
  'topa',                  // animal/jerga vulgar
  'sega',                  // "sierra" + masturbación (Sega Genesis…)
  'culo',                  // común en compuestos legítimos en español, en italiano vulgar
  'cesso',                 // "baño" + insulto
  'pirla',
  'troia',                 // "Troya" / "puta" — colisión con la ciudad
  'duce',                  // sólo solo es apología fascista
  'cazzo',                 // ya está en la lista, va por substring
]);
