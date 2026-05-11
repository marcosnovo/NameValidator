// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en alemán (DE)
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre vulgaridades, insultos, slurs, terminología sexual/escatológica,
// términos discriminatorios y referencias a apología nazi.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos (la normalización se aplica antes).
//  - ä/ö/ü ya están convertidos a a/o/u por stripDiacritics; añadimos
//    también las variantes "ae"/"oe"/"ue" porque algunos usuarios las
//    teclean directamente.
//  - ß ya viene convertida a "ss" por la fase phoneticDe / stripDiacritics.
//  - Palabras < 4 chars van a `germanExactOnly` (match a token completo).

export const germanProfanity = [
  // ── Vulgaridades / sexo
  'scheisse', 'scheise', 'scheissdreck', 'scheissegal', 'scheisskerl',
  'scheissdrauf',
  'arschloch', 'arschlocher', 'arschgesicht', 'arschkriecher',
  'arsch', 'arschig', 'arschvoll',
  'fotze', 'fotzen', 'fotzengesicht',
  'mosen', 'mose',  // jergas vulgares
  'schwanz', 'schwanze', 'schwanzlutscher', 'schwanzgesicht',
  'pimmel', 'pimmelchen', 'pimmellecker',
  'titten', 'titte', 'tittchen',
  'muschi', 'muschis',  // diminutivo vulgar
  'wichser', 'wichserin', 'wichsen', 'gewichst',
  'wichsfresse', 'wichsgesicht',
  'sackgesicht', 'sacklecker', 'eiersack',
  'eier', 'eierloser', 'eierlecker',
  'spasti', 'spastikus',  // discriminación capacitista
  'idiot', 'idioten', 'volltrottel', 'trottel',
  'depp', 'deppen', 'volldepp',
  'huren', 'huren', 'hurensohn', 'hurensohnchen', 'hurenkind',
  'nutte', 'nutten', 'nuttensohn', 'strassennutte',
  'schlampe', 'schlampen', 'minischlampe',
  'flittchen',
  'schwein', 'schweine', 'drecksschwein', 'schweinehund', 'sauerei',
  'dreckschwein',
  'bastard', 'bastarde', 'mistkerl',
  'arschficker', 'arschgeficke',
  'ficker', 'fick', 'ficken', 'gefickt', 'fickfresse', 'fickgesicht',
  'fickdich', 'fickdeinemutter',
  'verfickt', 'verfickte', 'verfickter',
  'verdammt', 'verdammter', 'verdammte', 'verdammtescheisse',
  'mistvieh', 'misthaufen', 'mistkerl', 'mist',
  'kotzbrocken', 'kotze', 'kotzkrampf',
  'pisser', 'pissen', 'gepisst', 'pissfresse',
  'piss', 'pissdich', 'pissoff',

  // ── Slurs étnicos / raciales / religiosos / homófobos
  'neger', 'negerin',  // slur racial — tabú absoluto
  'kanake', 'kanaken',  // slur xenófobo
  'judenpack', 'judenpig', 'judenhund', 'judensau',
  'zigeuner',  // peyorativo (gitanos)
  'kanackesau',
  'schwuchtel', 'schwuchteln',  // slur homófobo
  'tunte', 'tunten',
  'lesbensau',
  'mongo', 'mongos', 'mongoloid',  // discapacidad
  'krueppel', 'kruppel', 'krüppel',
  'spasti', 'spastiker',  // capacitista

  // ── Apología nazi y extremismo
  'heilhitler', 'siegheil', 'sieg heil',
  'judenraus', 'auslaenderraus', 'auslanderraus', 'auslander raus',
  'eintausch', 'einreich',
  'ssfan', 'wehrmachtfan',
  'hakenkreuz',  // esvástica
  '88',  // código neonazi (HH = Heil Hitler) — pero es número, va al exact
  'hh88', '14words', '1488',
  'whitepower', 'whitepride',
  'arianer', 'reinrassig',
  'volksverraeter', 'volksverrater',  // término del lenguaje de extrema derecha
  'lugenpresse', 'luegenpresse',
  'umvolkung',
  'reichsbuerger', 'reichsburger',  // movimiento extremista

  // ── Insultos genéricos compuestos
  'drecksau', 'drecksack', 'drecksvieh',
  'arschmade', 'arschwischer',
  'kackbratze',  'kackdreck', 'kacke',
  'pissnelke',
  'fettsack', 'fettarsch',
  'doofkopf', 'dummkopf', 'dummschwatzer',
  'sauhund',
  'leckmicham', 'leckmicharsch',
  'halsmaul', 'halsdiefresse', 'haltdiefresse',

  // ── Frases ofensivas concatenadas (no aparecen en apellidos legítimos)
  'fickdeinemutter',
  'leckmichamarsch',
  'duarschloch', 'duwichser', 'duficker',
  'duhurensohn',
];

// Frases-trampa o nombres-broma con doble sentido alemán.
// Cada entrada es [forma_concatenada, motivo]. Igual que spanishJokeNames.
export const germanJokeNames = [
  ['arschmichlecker', '"lámeme el culo" en alemán'],
  ['fickdiemutter',   '"folla a tu madre" — insulto sexual concatenado'],
  ['fickdeinemutter', '"folla a tu madre" — insulto sexual concatenado'],
  ['leckmeineier',    'vulgar sexual alemán'],
  ['leckmichdoch',    '"lámeme" — insulto'],
  ['duarschmade',     'insulto vulgar alemán'],
  ['volltrottel',     'insulto capacitista alemán'],
  ['kackbirne',       'insulto escatológico alemán'],
  ['kackgesicht',     'insulto escatológico alemán'],
  ['titansack',       'insulto vulgar alemán'],
  ['eierlecker',      'insulto vulgar sexual alemán'],
  ['sackgesicht',     'insulto vulgar alemán'],
  // ── Apología nazi y extrema derecha
  ['auslaenderraus',  '"extranjeros fuera" — apología xenófoba'],
  ['auslanderraus',   '"extranjeros fuera" — apología xenófoba'],
  ['judenraus',       '"judíos fuera" — apología antisemita nazi'],
  ['heilhitler',      'saludo nazi prohibido'],
  ['sieghail',        '"Sieg Heil" — saludo nazi'],
  ['sieghagil',       'variante de saludo nazi'],
  ['ehrenwortheilhitler', 'apología nazi'],

  // ── Apellido-broma: nombre alemán + vulgaridad concatenada
  ['klauspferdsohn',       '"Klaus, Pferd-Sohn" — "hijo de caballo" insulto compuesto'],
  ['kurthurensohn',        '"Kurt Hurensohn" → hijo de puta disfrazado'],
  ['horstficker',          '"Horst Ficker" → "follador" como apellido'],
  ['ottoschwanzlutscher',  '"Otto Schwanzlutscher" → chupapollas'],
  ['dietermuschilecker',   '"Dieter Muschilecker" → lamevulvas'],
  ['udopisser',            '"Udo Pisser" → meón como apellido'],
  ['hansdummkopf',         '"Hans Dummkopf" → cabezahueca / tonto'],
  ['gerhardkackbirne',     '"Gerhard Kackbirne" → cabeza-de-mierda'],
  ['wolfgangwichser',      '"Wolfgang Wichser" → pajillero'],
  ['rainerarschgesicht',   '"Rainer Arschgesicht" → caraculo'],
  ['fritzfickfresse',      '"Fritz Fickfresse" → jeta-de-follar'],
  ['helmutkotzbrocken',    '"Helmut Kotzbrocken" → asqueroso'],
  ['jurgenscheissdreck',   '"Jürgen Scheissdreck" → mierda-podrida'],
  ['ralfeierlutscher',     '"Ralf Eierlutscher" → chupahuevos'],
  ['manfredarschloch',     '"Manfred Arschloch" → ojete'],
  ['berndsacklecker',      '"Bernd Sacklecker" → lameescroto'],
  ['siegfriedfotzenkopf',  '"Siegfried Fotzenkopf" → cabeza-de-coño'],
  ['rudolfdrecksau',       '"Rudolf Drecksau" → cerda asquerosa'],
  ['axelhurensohnchen',    '"Axel Hurensohnchen" → hijito de puta'],
  ['kainpissnelke',        '"Kain Pissnelke" → clavel-meón'],
  ['ingoflittchen',        '"Ingo Flittchen" → zorra/golfa'],
  ['lutzfettarsch',        '"Lutz Fettarsch" → culogordo'],
  ['gunterschweinehund',   '"Günter Schweinehund" → perro-cerdo insulto'],
  ['detlefkackgesicht',    '"Detlef Kackgesicht" → cara-de-mierda'],
  ['hartmutmistkerl',      '"Hartmut Mistkerl" → tipejo-mierdoso'],
  ['volkermosenlecker',    '"Volker Mosenlecker" → lameconchas'],
];

// Tokens cortos / ambiguos que SÓLO bloquean cuando aparecen como palabra
// completa, nunca como subcadena (e.g., "fick" dentro de "Frederick" no
// debería disparar).
export const germanExactOnly = new Set([
  'arsch', 'eier', 'fick', 'piss', 'kacke', 'mist',
  'dumm', 'doof',
  '88',           // sólo si va solo (código neonazi)
  '1488',
  'hh',           // "Heil Hitler" cifrado — sólo solo
  'mosche',
  'titten', 'titte',
  'fotze', 'fotzen',
  'sau',          // "Sau" (vulgar) — pero como apellido alemán existe
  'schwein',      // existe como apellido alemán
  'dreck',
  'nutte',
  'mongo',
  'spasti',
  'tunte',
]);
