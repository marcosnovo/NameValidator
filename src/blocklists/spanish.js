// Lista de palabras prohibidas en español. Cubre vulgaridades, insultos,
// slurs, terminología sexual/escatológica y términos discriminatorios.
//
// Reglas:
//  - Todas en minúsculas, sin acentos (la normalización se aplica antes).
//  - El motor las busca como subcadena en el texto concatenado, así que
//    palabras muy cortas (< 4 chars) se evitan para reducir falsos
//    positivos (p. ej. "ano" matchearía "Ana no"). Cuando una palabra corta
//    es crítica, la incluimos como exacta en `exactMatchOnly`.
export const spanishProfanity = [
  // Vulgaridades / sexual
  'puta', 'puto', 'putada', 'putita', 'putito', 'putear', 'putamadre',
  'polla', 'pollas', 'pollon', 'pollona', 'polludo',
  'verga', 'vergas', 'pene', 'penes',
  'coño', 'cono', 'conyo', 'conazo',
  'chocho', 'chochete', 'chochito',
  // 'concha'/'conchita' son nombres legítimos en España (Concepción), por
  // eso sólo bloqueamos formas claramente vulgares; el matiz cultural
  // sudaca lo decide la capa AI.
  'conchabierta', 'conchatumadre', 'conchadetumadre', 'conchadetuhermana',
  'follar', 'follada', 'follon', 'follando', 'follado',
  'culo', 'culon', 'culona', 'culazo', 'culero',
  'pendejo', 'pendeja', 'pendejada',
  'cojon', 'cojones', 'cojonudo', 'cojonazos',
  'huevon', 'huevazo', 'webon',
  'mierda', 'mierdas', 'mierdoso',
  'cagar', 'cagada', 'cagado', 'cagon', 'cagada', 'cagaste',
  'meada', 'meado', 'mearse',
  'pedo', 'pedos', 'pedorro',
  'pajero', 'pajera', 'pajearse', 'pajaso',
  'paja', 'pajilla', 'pajillero',
  'puton', 'putona', 'zorra', 'zorron',
  'guarra', 'guarro', 'guarrada', 'guarradas',
  'ramera', 'rameras',

  // Insultos compuestos
  'hijoputa', 'hijaputa', 'hijodeputa', 'hijadeputa', 'hijosdeputa',
  'cabron', 'cabrona', 'cabronazo', 'cabronazos', 'cabronada',
  'gilipollas', 'gilipuertas', 'gilipichas',
  'tontolculo', 'tontodelculo', 'comemierda', 'comepollas',
  'chupapollas', 'chupapolla', 'lameculos', 'lamehuevos',
  'mierdaseca', 'mierdecilla',
  'capullo', 'capullada',
  'pringao', 'pringada',
  'mamon', 'mamona', 'mamones',
  'mamadas', 'mamada', 'mamando', 'mamame',
  'follaperros', 'follacabras',

  // Slurs / discriminatorios
  'maricon', 'maricona', 'mariconada', 'mariconazo', 'maricones',
  'marica', 'maricas', 'mariquita',
  'travelo', 'travesti',
  'bollera', 'bolleras', 'tortillera', 'tortilleras',
  'sudaca', 'sudacas',
  'panchito', 'panchita', 'panchitos',
  'moromierda', 'moroputa',
  'gitano de mierda', 'gitanada',
  'negrata', 'negratas',
  'subnormal', 'subnormales', 'mongolo', 'mongola', 'mongolico',
  'retrasado', 'retrasada', 'tarado', 'tarada',
  'autista de mierda', 'down de mierda',
  'judiada',

  // Drogas / actos delictivos
  'cocaina', 'cocaine', 'heroina', 'cristal meth', 'porro de',
  'matar', 'matame', 'mataros', 'asesinar', 'violar', 'violador',
  'pederasta', 'pedofilo', 'pedofila',

  // Política/religión ofensiva (banderas rojas en un estadio)
  'franco viva', 'viva franco', 'arriba españa cara al sol',
  'heil hitler', 'sieg heil', 'hitler', 'nazismo', 'gaseanos',
  'eta hb', 'gora eta', 'goraeta',
  'isis', 'al qaeda', 'al kaeda',
  'allah akbar matar',

  // Genitales / actos
  'masturbar', 'masturbacion', 'masturbarse', 'masturba',
  'orgasmo', 'orgasmos', 'eyacular', 'eyaculacion',
  'felacion', 'felaciones', 'cunnilingus',
  'sexo anal', 'sexo oral', 'sexo grupal',
  'incesto', 'zoofilia', 'bestialismo',

  // Contexto Real Madrid / odio futbolístico explícito
  'puto madrid', 'putos blancos', 'puto barça', 'puto barca',
  'mas que un club mierda', 'visca catalunya independent', // contexto político en HALO
  'culers de mierda', 'merengue de mierda',
  'piti yo soy español', // referencia famosa, evita hooliganismo

  // Religión ofensiva
  'me cago en dios', 'mecagoendios', 'mecagoenlavirgen',
  'hostia puta', 'ostiaputa', 'hostiaputa',
  'cago en la madre',
];

// Nombres-broma clásicos en español. Estos son los que se transforman
// foneticamente al concatenarse. Los listamos como pares "input → razón".
//
// El motor concatena el input sin espacios, los normaliza, y comprueba si
// CONTIENE alguna de estas formas concatenadas. También se cubren con la
// capa AI por si se nos escapa alguno.
export const spanishJokeNames = [
  // [forma concatenada (sin espacios, normalizada), explicación]
  ['aitortilla', 'Aitor Tilla → "a tortilla"'],
  ['aitormenta', 'Aitor Menta → "a tormenta"'],
  ['aitornito', 'Aitor Nito → "atornillado / a tornillo"'],
  ['aitorpedo', 'Aitor Pedo → "a torpedo / a tropezón"'],
  ['aitorpedero', 'Aitor Pedero → "a torpedero"'],
  ['alanbrito', 'Alan Brito → "alambrito"'],
  ['alanbrado', 'Alan Brado → "alambrado"'],
  ['almudenacid', 'Almudena Cid → ok pero "Almudena Cid Erronado" no'],
  ['almudenaciderronado', 'Almudena Ciderronado → "almuerzo erróneo"'],
  ['armandobronca', 'Armando Bronca → "armando bronca"'],
  ['armandobroncasegura', 'Armando Bronca Segura → "armando bronca segura"'],
  ['armandoestebanquito', 'Armando Esteban Quito → "armando este banquito"'],
  ['armandolapaella', 'Armando La Paella → "armando la paella"'],
  ['armandomilpedos', 'Armando Milpedos → "armando mil pedos"'],
  ['auroraboreal', 'Aurora Boreal → "aurora boreal" (broma)'],
  ['avelinococido', 'Avelino Cocido → "a ver lo cocido"'],
  ['benitocamelas', 'Benito Camelas → "venido a comerlas"'],
  ['benitorevuelto', 'Benito Revuelto → "venido a revolver"'],
  ['carlostomas', 'Carlos Tomás → "calostomás"'],
  ['casimirocuevas', 'Casimiro Cuevas → "casi miro cuevas"'],
  ['concepcionsotomayor', 'Concepción Sotomayor → broma anatómica'],
  ['dolorescabeza', 'Dolores Cabeza → "dolores de cabeza"'],
  ['dolorescheves', 'Dolores de Pies', 'Dolores Fuertes de Cabeza'],
  ['doloresfuertesdecabeza', 'Dolores Fuertes de Cabeza'],
  ['elbacalao', 'Elba Calao → "el bacalao"'],
  ['elenanitodelbosque', 'Elena Nito del Bosque → "el nenito del bosque"'],
  ['elenanito', 'Elena Nito → "el nenito"'],
  ['elenahurtado', 'Elena Hurtado → "el enano hurtado"'],
  ['eligante', 'Eli Gante → "elegante"'],
  ['elsapato', 'Elsa Pato → "el zapato"'],
  ['elsapaton', 'Elsa Patón → "el sapatón"'],
  ['elsacapon', 'Elsa Capón → "el sapón / el sacapón"'],
  ['elvistesoamarillo', 'Elvis Teso Amarillo → "el viste eso amarillo"'],
  ['elvisteso', 'Elvis Teso → "el visteso"'],
  ['estebandido', 'Esteban Dido → "estaban dido / estaba ido"'],
  ['estebanquito', 'Esteban Quito → "estaban quito / este banquito"'],
  ['estelagartija', 'Estela Gartija → "esta lagartija"'],
  ['felipelotas', 'Felipe Lotas → "fe-lipe-lotas"'],
  ['heliocoptero', 'Helio Cóptero → "helicóptero"'],
  ['hilariocalvo', 'Hilario Calvo → broma de calvicie'],
  ['ivancantua', 'Iván Cantúa → "iba en canto a"'],
  ['ivanpasada', 'Iván Pasada → "iba en pasada"'],
  ['lolamento', 'Lola Mento → "lo lamento"'],
  ['marianolopepega', 'Mariano Lopepega → "mari-anolopepega" doble sentido'],
  ['marioneta', 'Mario Neta → "marioneta"'],
  ['mateorito', 'Mateo Rito → "mate-orito / meteorito"'],
  ['matiasquemates', 'Matías Quemates → "más mates que mates"'],
  ['miguelitorocuajado', 'Miguelito Rocuajado → "me quedo rocuajado"'],
  ['monicaposa', 'Mónica Posa → "moni caposa / mi caposa"'],
  ['normaplancha', 'Norma Plancha → "no me la planches"'],
  ['octavioterciado', 'Octavio Terciado → "ocho-vio-terciado"'],
  ['oligario', 'Oli Gario → "oligario"'],
  ['paco lapaca', 'Paco la Paca → "pa colapaca"'],
  ['palomacojida', 'Paloma Cojida → broma sexual'],
  ['paolacometido', 'Paola Cometido → "para lo cometido"'],
  ['pepecojonez', 'Pepe Cojónez → "pepe cojones"'],
  ['pepegrillo', 'Pepito Grillo → personaje pero contexto burla'],
  ['pepitogrillo', 'Pepito Grillo'],
  ['rosamata', 'Rosa Mata → "lo sa mata / rosa mata"'],
  ['rosamelero', 'Rosa Melero → "lo sa melero / rozamiento"'],
  ['salvadorcena', 'Salvador Cena → "salvador de cena / sal va dorcena"'],
  ['sarasate', 'Sara Sate → "lo sa-rasa-te / sárrate"'],
  ['serafinrespetable', 'Serafín Respetable → "sera fin respetable"'],
  ['sergiopio', 'Sergio Pio → "ser gio pío"'],
  ['susanaoria', 'Susana Oria → "su zanahoria"'],
  ['susanasoria', 'Susana Soria → "sus anas oria"'],
  ['tomascerveza', 'Tomás Cerveza → "tomás cerveza / toma scerveza"'],
  ['vitorino', 'Vito Rino → "vitor ino"'],

  // Variantes con apellido compuesto / nombres compuestos clásicos
  ['debora cuela', 'Débora Cuela → "de boracuela"'],
  ['deboracuela', 'Débora Cuela'],
  ['ramonchaperdida', 'Ramón Chaperdida → "ramón chaperdida"'],
  ['victoriasecreta', 'Victoria Secreta → "Victoria\'s Secret"'],
  ['paganinihijo', 'Paganini Hijo → "paga-niño"'],
  ['hugovidasocial', 'Hugo Vida Social → "u-go-vida social"'],

  // Castizos / chorras conocidos en bares y blogs
  ['jhonbrito', 'Jhon Brito → "alambrito alternativo"'],
  ['mannolitogafotas', 'Manolito Gafotas → personaje, contexto humor'],
  ['hannibalamamados', 'Hanníbal a Mamados → vulgar'],
];

// Palabras donde sólo se acepta match exacto (no como subcadena), porque son
// muy cortas o forman parte legítima de muchos apellidos comunes.
export const spanishExactOnly = new Set([
  'ano', 'culo', 'teta', 'tetas', 'meo', 'cago',
]);
