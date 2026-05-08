// Lista de palabras prohibidas en portugués (BR + EU). Mismas convenciones
// que las demás listas: minúsculas, sin acentos. La capa de matching aplica
// `phoneticPt` al cargar (nh→n, lh→l, h muda, ç→s).
//
// PT-BR y PT-EU comparten la mayoría de los términos. Donde divergen
// (puta vs. punheta, etc.) incluimos ambas formas.

export const portugueseProfanity = [
  // ── Vulgaridades / sexual
  'foda', 'fodase', 'fodasse', 'foder', 'fodendo', 'fodido', 'fodida',
  'foderse', 'fodemse', 'fodase', 'fdp',
  'caralho', 'carago', 'carai', 'caralhao', 'caralhinho',
  'porra', 'porras', 'porraloka', 'porraloca', 'porraninguem',
  'puta', 'putas', 'putana', 'putaria', 'putada', 'putaque',
  'putamerda', 'putoque', 'putaqueopariu', 'paqp',
  'putamadre', 'putamae',
  'cu', 'cuzao', 'cuzudo', 'cuzudos', 'cuzinho', 'cuzao',
  'cudoboi', 'cudegalinha', 'cuduro',
  'buceta', 'bucetuda', 'bucetinha', 'bucetona',
  'cona', 'conas', // EU
  'pica', 'picas', 'pirilau', 'pirilao', 'pinto', 'pintinho',
  'pau', 'pauzudo', 'pauzao', // contexto sexual
  'rola', 'rolas', 'rolao', 'rolinhas', // sexual
  'mijo', 'mijada', 'mijar', 'mijada',
  'merda', 'merdas', 'merdoso', 'merdosos',
  'cagar', 'cagada', 'cagao', 'cagona', 'cagacao',
  'peido', 'peidos', 'peidao',
  'punheta', 'punheteiro', 'punheta tristes',
  'gozar', 'gozada', 'gozado', 'gozao',
  'tarado', 'tarada', 'tarados',
  'arrombado', 'arrombada', 'arrombados',
  'safado', 'safada', 'safadinha',

  // ── Insultos compuestos
  'filhodaputa', 'filhadaputa', 'filhosdaputa',
  'filho da puta', 'filha da puta',
  'filho da mae', 'filhodumacadela',
  'corno', 'corna', 'cornudo', 'cornoso', 'cornaco',
  'desgracado', 'desgracada',
  'imbecil', 'imbecis',
  'idiota', 'idiotas',
  'otario', 'otaria', 'otarios',
  'panaca', 'panacas',
  'mongoloide', 'mongol',
  'retardado', 'retardada', 'retardados',
  'energumeno', 'energumenos',
  'babaca', 'babacas',
  'cuzao de merda', 'cuzaodemerda',
  'foda-se a tua mae', 'fodaseatuamae',
  'vai tomar no cu', 'vaitomarnocu', 'vtnc',
  'vai se foder', 'vaisefoder', 'vsf',
  'porra louca', 'porraloka',

  // ── Slurs / discriminatorios (cero tolerancia)
  'macaco', 'macaca', 'macacos', // contexto racial despectivo
  'crioulo', 'crioula', // peyorativo en BR
  'preto fedido', 'pretofedido',
  'negao de merda',
  'judeu de merda', 'judiaria',
  'bicha', 'bichas', 'bichinha',
  'viado', 'viados', 'veado', 'veados',
  'baitola', 'baitolas',
  'sapatao', 'sapatona', 'sapatonas',
  'travesti de merda',
  'gay de merda', 'gaydemerda',
  'aborto', 'abortao', // peyorativo
  'lixo humano',
  'jeca', 'jecas',
  'caipira de merda',
  'nordestino de merda',
  'cachorro', 'cachorra', // contexto despectivo
  'vagabundo', 'vagabunda', 'vagabundos',

  // ── Drogas (referencias explícitas)
  'maconha', 'maconheiro', 'maconheira',
  // 'crack' suelto NO va aquí — en castellano significa "fenómeno" (piropo
  // a un buen jugador). Sólo bloqueamos sus variantes inequívocamente
  // ligadas a la droga: 'crackhead', 'crack adicto', 'crackudo'.
  'cocaina', 'cocaina pura', 'crackudo', 'cracker de droga',
  'lança', 'lanca-perfume',
  'mdma', 'extase', 'lsd',
  'usuario de drogas',

  // ── Violencia
  'matar', 'mate-se', 'mate se', 'matese',
  'estuprar', 'estupro', 'estuprador',
  'pedofilo', 'pedofila', 'pedofilia',
  'pornografia infantil', 'porno infantil',

  // ── Apología nazi/extremismo
  'heil hitler', 'sieg heil', 'nazista', 'nazismo',
  'integralismo',
  'kkk', 'kukluxklan',

  // ── Anti-Real Madrid en PT (aficionados brasileños/portugueses del Barça)
  'merengue de merda', 'merenguedemerda',
  'visca el barca', 'viva o barca', 'vivaobarca',
  'foda-se o madrid', 'fodaseomadrid',
  'morte ao madrid', 'morteaomadrid',
  'porto sempre', 'fcporto', // contexto rival si fan Madrid
  'benfica de merda', 'benficamierda',
];

// ─── Nombres-broma en portugués ────────────────────────────────────────────
// Con menos profundidad que ES/EN/FR — la capa AI cubre el hueco. Incluimos
// los más conocidos del cancionero de "telefonemas brincalhão" / piadas
// brasileñas y portuguesas.
export const portugueseJokeNames = [
  // ── Vulgares explícitos disfrazados
  ['cudoce', 'Cu Doce → "ano dulce" (vulgar)'],
  ['cudegalinha', 'Cu de Galinha → vulgar'],
  ['cudeboi', 'Cu de Boi → vulgar'],
  ['cuduro', 'Cu Duro → vulgar'],
  ['cusado', 'Cu Sado → "cusado / cuzudo" (vulgar)'],

  // ── Joke names PT-BR canónicos
  ['joaogosta', 'João Gosta'],
  ['joaobobo', 'João Bobo (mote)'],
  ['joaoninguém', 'João Ninguém'],
  ['joaoninguem', 'João Ninguém'],
  ['joaodeumcravo', 'João de um Cravo'],
  ['mariaduarte', 'Maria Duarte (común; aquí en contexto)'],
  ['mariacalcacu', 'Maria Calça-Cu (vulgar)'],
  ['mariacalcucu', 'Maria Calçucu (vulgar)'],
  ['mariaesfregona', 'Maria Esfregona (despectivo)'],
  ['mariadagraça', 'Maria da Graça'],
  ['mariadagraca', 'Maria da Graça'],
  ['mariarapadinho', 'Maria Rapadinho (vulgar BR)'],
  ['mariadocu', 'Maria do Cu (vulgar)'],
  ['mariamijada', 'Maria Mijada (vulgar)'],
  ['mariadocaralho', 'Maria do Caralho (vulgar)'],

  // Familia "Vai tomar no cu" disfrazada como nombre
  ['vaitomarnocu', '"Vai tomar no cu" (vulgar)'],
  ['vaisefoder', '"Vai se foder" (vulgar)'],
  ['filhodaputa', 'Filho da Puta (insulto)'],

  // Calembours portugueses tipo "Senhor e Senhora ... têm um filho"
  ['paulopau', 'Paulo Pau → vulgar'],
  ['joaopau', 'João Pau → vulgar'],
  ['pedropau', 'Pedro Pau → vulgar'],
  ['analfa', 'Ana Lfa → "analfa(beta)"'],
  ['analiseanal', 'Ana Lise Anal (vulgar)'],
  ['anaclise', 'Ana Clise → "análise"'],
  ['analaranjada', 'Ana Laranjada → "anaranjada"'],

  // ── Equipos rivales como joke (BR/PT)
  ['flamenguistademerda', 'Flamenguista de merda (anti-Flamengo)'],
  ['corinthiansdemerda', 'Corinthians de merda'],
  ['palmeirinha', 'Palmeirinha (despectivo)'],

  // ── Slurs disfrazados
  ['negaodecu', 'Negão de Cu (slur)'],
  ['preotfedido', 'Preto Fedido (slur)'],

  // ── Joke "soy la X" en PT: "Eu sou ..."
  ['eusouputa', 'Eu Sou Puta'],
  ['eusouporra', 'Eu Sou Porra'],
  ['eusoucorno', 'Eu Sou Corno'],
];

// Palabras donde sólo aceptamos match exacto a token (cortas o demasiado
// genéricas como subcadena).
export const portugueseExactOnly = new Set([
  'cu',  // PT/BR vulgar para "ano", muy corta
  'pau', // contexto sexual / construcción, muy corta
  'pica', // sexual / pinchazo, contexto ambiguo
  'fdp',
  'vtnc',
  'vsf',
]);
