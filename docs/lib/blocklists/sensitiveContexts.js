// ──────────────────────────────────────────────────────────────────────────
//  Detector de contexto: insultos a jugadores
// ──────────────────────────────────────────────────────────────────────────
//
// Algunos términos son AMBIGUOS en aislamiento pero se convierten en
// **insultos racistas o discriminatorios** cuando se combinan con el
// nombre/apellido de un jugador.
//
// Ejemplo crítico: "Vinicius mono"
//   - "mono" en aislamiento = animal o adjetivo "cute" en castellano
//   - "Vinicius" es jugador del Real Madrid de origen brasileño
//   - "Vinicius + mono" = insulto racista documentado en estadios
//
// Funcionamiento:
//   1. Detectamos si el input contiene algún TOKEN de jugador conocido
//   2. Si además contiene un TÉRMINO SENSIBLE en cualquier idioma,
//      escalamos a severity:high (REJECTED) con categoría 'racism-context'
//
// Esto cubre cuatro tipos de insulto-a-jugador:
//   ▸ Comparaciones animales racistas (mono, monkey, macaco, singe, simio…)
//   ▸ Calificativos raciales (negro, black, noir, preto + variantes)
//   ▸ Insultos físicos (gordo, viejo, feo, enano…)
//   ▸ Insultos homófobos contextuales (gay como insulto en contexto)

// Tokens normalizados (lowercase, sin acentos) de jugadores famosos cuyo
// nombre solo o apellido solo es DISTINTIVO (no se confunde con nombres
// civiles comunes).
//
// Hemos quitado algunos apellidos comunes que causarían demasiados falsos
// positivos (Ramos, Sergio, Carlos, etc.) — para esos basta el matching
// por nombre+apellido completo del realMadrid.js.
export const playerNameTokens = new Set([
  // ── Real Madrid actual y leyendas — más targeted en contexto racista
  'vinicius', 'vini', 'viniciusjr',
  'mbappe', 'mbappé', 'kylian',
  'rudiger', 'antoniorudiger',
  'camavinga', 'eduardo',
  'tchouameni', 'tchouameni',
  'rodrygo',
  'militao', 'edermilitao', 'eder',
  'mendy', 'ferlandmendy', 'ferland',
  'bellingham', 'jude',
  'modric', 'luka',
  'kroos', 'toni',
  'cristiano', 'ronaldo', 'cr7',
  'zidane',
  'casillas', 'iker',
  'raul',
  'benzema', 'karim',
  'asensio',
  'valverde', 'fede',
  'ceballos', 'dani',
  'arda', 'guler',
  'endrick',
  'huijsen',

  // ── Rivales habituales del Real Madrid
  'messi', 'leo', 'lio', 'lionel',
  'ronaldinho',
  'neymar',
  'iniesta',
  'guardiola', 'pep',
  'puyol',
  'pique',
  'xavi',
  'busquets',
  'dembele', 'ousmane',
  'lewandowski', 'levandovski',
  'griezmann', 'antoine',
  'simeone', 'cholo', 'diego',
  'koke',
  'oblak',

  // ── Estrellas globales (también pueden recibir insultos en HALO)
  'pogba', 'paul',
  'lukaku', 'romelu',
  'sterling', 'raheem',
  'rashford', 'marcus',
  'salah', 'mohamed',
  'mane', 'sadio',
  'haaland', 'erling',
  'kane', 'harry',
  'pele', 'pelé',
  'maradona',
  'eto', 'samueleto',
  'drogba',
  'adebayor',
]);

// Términos sensibles por idioma. Cada uno es ambiguo en aislamiento pero
// pasa a ser ofensivo cuando va junto a un nombre de jugador.
//
// El matching se hace SOBRE TOKENS (palabras separadas por espacios), así
// que "monos" sólo cuenta como "mono" si se escribió "monos" como token.
export const contextSensitiveSlurs = {
  es: new Set([
    // ── Comparaciones animales (racismo en fútbol)
    'mono', 'monos', 'monito', 'monitos', 'monete', 'monetes',
    'simio', 'simios', 'simiote',
    'macaco', 'macacos', 'macaca',
    'gorila', 'gorilas',
    'chimpance', 'chimpanze', 'chimpances',
    'orangutan', 'orangutanes',
    'bestia', 'bestias',
    // ── Raciales / origen
    'negro', 'negros', 'negra', 'negras',
    'negrito', 'negritos', 'negrita',
    'moreno', 'morenos', 'morena', 'morenas',
    'oscuro', 'oscuros', 'oscurito',
    'mulato', 'mulatos',
    'sudaca', 'sudacas',
    'panchito', 'panchitos',
    'indio', 'indios', 'india',
    'gitano', 'gitanos', 'gitana',
    'moro', 'moros', 'mora', 'moras',
    'paki', 'pakis',
    'judio', 'judia', 'judios', 'judias',
    'chino', 'chinos', 'china', 'chinitos',
    // ── Físicos
    'gordo', 'gorda', 'gordos', 'gordas', 'gordito', 'gordita',
    'viejo', 'vieja', 'viejos', 'viejas', 'viejito',
    'feo', 'fea', 'feos', 'feas', 'feucho',
    'enano', 'enana', 'enanos', 'enanas', 'enanote',
    'inutil', 'inutiles',
    'lento', 'lenta', 'lentos',
    'pringao', 'pringada', 'pringado', 'paquete',
    'flaco', 'flaca', 'flacos', 'flacucho',
    'calvo', 'calva', 'calvos',
    // ── Sexualidad usada como insulto en contexto deportivo
    // OJO: 'gay'/'gays' QUITADOS — el INE registra "Gay" como apellido
    // legítimo en España (~5000 personas). Bloquearlo causaría falsos
    // positivos en personas con ese apellido. La AI detectará intención
    // homofóbica por contexto (estructura nombre+apellido vs broma).
    'maricon', 'maricona', 'mariquita',
    'bicha',
    'puto', 'puta',
  ]),
  en: new Set([
    'monkey', 'monkeys',
    'ape', 'apes',
    'gorilla', 'gorillas',
    'chimp', 'chimpanzee', 'chimps',
    'baboon', 'baboons',
    'black', 'darkie', 'darkies',
    'paki', 'pakis',
    'fat', 'fatty', 'fatso',
    'old', 'oldie',
    'ugly',
    'dwarf', 'midget',
    // 'gay' quitado — coincide con apellido Gay de España (legítimo INE)
    'fag', 'queer',
    'jewish', 'jew',
  ]),
  fr: new Set([
    'singe', 'singes',
    'macaque', 'macaques',
    'gorille', 'gorilles',
    'chimpanze', 'chimpanzes',
    'noir', 'noirs', 'noire', 'noires',
    'arabe', 'arabes',
    'gros', 'grosse',
    'vieux', 'vieille', 'vieilles',
    'moche', 'moches',
    'nain', 'naine',
    // 'gay' quitado — coincide con apellido Gay (legítimo INE España)
    'pédé', 'pede', 'tapette',
    'juif', 'juive',
  ]),
  pt: new Set([
    'macaco', 'macacos', 'macaca', 'macacas',
    'simio', 'simios',
    'gorila', 'gorilas',
    'chimpanze', 'chimpanzes',
    'preto', 'pretos', 'preta', 'pretas',
    'negao', 'negra', 'negros',
    'crioulo', 'crioula',
    'gordo', 'gordos', 'gorda',
    'velho', 'velha', 'velhos',
    'feio', 'feia', 'feios',
    // 'gay' quitado — coincide con apellido Gay (legítimo INE España)
    'viado', 'bicha',
    'judeu', 'judia',
  ]),
};
