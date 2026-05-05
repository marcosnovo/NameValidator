// Lista de palabras prohibidas en español. Cubre vulgaridades, insultos,
// slurs, terminología sexual/escatológica y términos discriminatorios.
//
// Reglas:
//  - Todas en minúsculas, sin acentos (la normalización se aplica antes).
//  - El motor las busca como subcadena en el texto concatenado, así que
//    palabras muy cortas (< 4 chars) se evitan para reducir falsos
//    positivos. Cuando una palabra corta es crítica, se incluye en
//    `spanishExactOnly` para forzar match a token completo.
export const spanishProfanity = [
  // Vulgaridades / sexual
  'puta', 'puto', 'putada', 'putita', 'putito', 'putear', 'putamadre',
  'polla', 'pollas', 'pollon', 'pollona', 'polludo',
  'verga', 'vergas', 'pene', 'penes',
  'coño', 'cono', 'conyo', 'conazo',
  'chocho', 'chochete', 'chochito',
  // 'concha'/'conchita' son nombres legítimos (Concepción), bloqueamos sólo
  // formas claramente vulgares; el matiz cultural sudaca lo decide la AI.
  'conchabierta', 'conchatumadre', 'conchadetumadre', 'conchadetuhermana',
  'follar', 'follada', 'follon', 'follando', 'follado',
  'culo', 'culon', 'culona', 'culazo', 'culero',
  'pendejo', 'pendeja', 'pendejada',
  'cojon', 'cojones', 'cojonudo', 'cojonazos',
  'huevon', 'huevazo', 'webon',
  'mierda', 'mierdas', 'mierdoso',
  'cagar', 'cagada', 'cagado', 'cagon', 'cagaste',
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
  'mas que un club mierda', 'visca catalunya independent',
  'culers de mierda', 'merengue de mierda',
  'piti yo soy español',

  // Religión ofensiva
  'me cago en dios', 'mecagoendios', 'mecagoenlavirgen',
  'hostia puta', 'ostiaputa', 'hostiaputa',
  'cago en la madre',

  // Ampliación: más vulgaridades coloquiales
  'cipote', 'cipotes', 'cipoton',
  'rabo', 'rabos', 'minga', 'mingas', 'pichula', 'pichulas',
  'pirula', 'pirulas',
  'pene', 'penes', 'penudo',
  'ojete', 'ojetes',
  'churro', 'churros', // contexto sexual
  'pinga', 'pingas',
  'chorra', 'chorras',
  'pichaperro', 'pichafloja',
  'tetona', 'tetonas', 'tetazos',
  'bujarra', 'bujarrón', 'bujarron',
  'follacabras', 'follaovejas',
  'corneado', 'cornudo', 'cornuda', 'cornudazos',
  'mariposon', 'mariposona',
  'mequetrefe',
  'pajeado', 'pajeada', 'pajao',
  'gilipollez', 'gilipollada',
  'tonta del culo', 'tontaculo', 'tontodel culo',
  'chorrada', 'chorradas',
  'me la pela', 'melapela',
  'me suda la polla', 'mesudalapolla',
  'tocapelotas', 'tocahuevos', 'tocacojones',
  'rompepelotas', 'rompecojones',
  'pegatela', 'pegatelo',
  'lacomas', 'comeme lo',
  'chimba', 'chamba sexual',
  'cojonazo', 'cojonacos',
  'puro pedo',

  // Más slurs y terms ofensivos
  'gabachos', 'gabacho de mierda', 'guiri de mierda',
  'cholo', 'cholos', 'inca de mierda',
  'pachuco', 'pachucos',
  'paya', 'payo', // contexto despectivo gitano
  'judio asqueroso', 'judia asquerosa',
  'maricon de playa', 'maricon dela playa',
  'mariquitilla',
  'rejunte', 'puta rejunte',
  'cholazo',
  'panchito de mierda', 'sudaca asqueroso',
  'gringo de mierda',
  'machupichu de mierda',

  // Terrorismo y violencia más explícita
  'gora hb', 'gora batasuna', 'goraherri',
  'eta presoak', 'presos eta',
  'al qaeda', 'estado islamico mata', 'isismata',
  'falange', 'falange española',
  'fuerza nueva', 'cara al sol',
  'hijos de eta', 'asesinos eta',

  // Apología pedofilia / abuso (cero tolerancia)
  'amor a niños', 'amor con niños', 'pederastas felices',
  'abuso menores', 'abuso de menor',

  // Drogas explícitas
  'esnifar coca', 'pico de heroina', 'jeringa droga',
  'crack adicto', 'meta adicto',

  // Phrases de odio explícito
  'mata judios', 'matenlosjudios', 'gas para judios',
  'mata moros', 'mata negros', 'mata maricones',
  'mata gitanos',

  // ── Profanity-light: insultos no soeces pero inapropiados para HALO ──
  // (Pejorativos, escatológicos suaves, animal-insult, "tonto del culo"…)
  // Severity: high igual que el resto. La idea es que en una pantalla
  // pública del estadio NADA de esto encaja, soez o no.
  'caca', 'cacas', 'cacota', 'cacazo',
  'pis', 'pipi', 'pupu', 'popo', 'mocos', 'mocasos',
  'pedote', 'pedazo de mierda',
  'cerdo', 'cerda', 'cerdos', 'cerdas', 'cerdazo',
  'cochino', 'cochina', 'cochinada', 'cochinote',
  'marrano', 'marrana', 'marranos', 'marranadas',
  'puerco', 'puerca', 'puercos', 'porkachuper',
  'asqueroso', 'asquerosa', 'asquerosos',
  'apestoso', 'apestosa', 'apestosos',
  'sucio asqueroso', 'sucia asquerosa',
  'idiota', 'idiotas', 'idiotez',
  'imbecil', 'imbeciles',
  'estupido', 'estupida', 'estupidos', 'estupideces',
  'tarugo', 'tarugada',
  'memo', 'memos', 'memez', 'memeces',
  'panoli', 'panolis',
  'lerdo', 'lerda', 'lerdos',
  'palurdo', 'palurda', 'palurdos',
  'paleto', 'paleta', 'paletos', 'paletadas',
  'patan', 'patanes',
  'baboso', 'babosa', 'babosos',
  'chorlito', 'cabezachorlito',
  'merluzo', 'merluza', // tonto
  'bobo', 'boba', 'bobos', 'bobada',
  'soplapollas', 'soplagaitas',
  'meapilas',
  'cara polla', 'caradura',
  'sinverguenza', 'sinverguenzas',
  'mongoloide', 'mongolote',
  'feo de mierda', 'fea de mierda',
  'gordo de mierda', 'gorda de mierda',
  'pirado', 'pirada', 'pirados',
  'chiflado', 'chiflada', 'chiflados',
  'tarado', 'tarada', 'tarados',
  'demente', 'dementes',
  'borracho de mierda', 'borracho asqueroso',
  'drogata', 'drogadicto', 'yonki', 'yonkis',
  'mendigo de mierda',

  // Frases compuestas tipo "X de mierda" (ya cubierto pero por si acaso)
  'real madrid mierda', 'realmadridmierda',
  'caca real madrid', 'cacarealmadrid',
  'caca madrid', 'cacamadrid',
  'caca bernabeu', 'cacabernabeu',
  'caca del bernabeu', 'cacadelbernabeu',
];

// ─── Nombres-broma en español ───────────────────────────────────────────────
// Cada entrada es [forma_concatenada_normalizada, razón].
// El motor concatena el input sin espacios, lo normaliza (lowercase + sin
// acentos + sin leet) y comprueba si CONTIENE alguna de estas formas.
//
// Filtros aplicados durante la curación (3 agentes de investigación
// devolvieron ~1.000 candidatos; mantenemos ~600 tras filtrar):
//   - Excluidos los que SON un nombre legítimo (Patricia, Margarita,
//     Marisol, Carolina, Sebastián, Pancho Villa, Plácido Domingo,
//     Sarasate, Saramago, Sophia Loren, Roquefort, Rosalía, Rosalinda…).
//   - Excluidos puns demasiado débiles donde la concatenación produce una
//     palabra inocua que choca con apellidos comunes (p. ej. "Mar Tina",
//     "Loren Zo", "Carmen Cita" — son nombres reales).
//   - Mantenidos TODOS los vulgares/sexuales/escatológicos sin censura.
//   - Mantenidas las series productivas (Aitor+, Elena+, Elsa+,
//     Armando+, Esteban+, Susana+, Lola+, Dolores+, Concha+, etc.).
export const spanishJokeNames = [
  // ── Serie "Aitor + sustantivo" (a + tor- / hay tor-)
  ['aitortilla', 'Aitor Tilla → "a tortilla / hay tortilla"'],
  ['aitormenta', 'Aitor Menta → "hay tormenta"'],
  ['aitornillos', 'Aitor Nillos → "hay tornillos"'],
  ['aitortugas', 'Aitor Tugas → "hay tortugas"'],
  ['aitornito', 'Aitor Nito → "atornillado / hay torno"'],
  ['aitortazo', 'Aitor Tazo → "hay tortazo"'],
  ['aitortazos', 'Aitor Tazos → "hay tortazos"'],
  ['aitorpedo', 'Aitor Pedo → "hay torpedo / a tropedo"'],
  ['aitorpedos', 'Aitor Pedos → "hay torpedos"'],
  ['aitorniquete', 'Aitor Niquete → "hay torniquete"'],
  ['aitortellini', 'Aitor Tellini → "hay tortellini"'],
  ['aitortolitas', 'Aitor Tolitas → "hay tortolitas"'],
  ['aitortura', 'Aitor Tura → "hay tortura"'],
  ['aitorticolis', 'Aitor Tícolis → "hay tortícolis"'],
  ['aitortas', 'Aitor Tas → "hay tortas"'],
  ['aitorpe', 'Aitor Pe → "hay torpe"'],
  ['aitorpezas', 'Aitor Pezas → "hay torpezas"'],
  ['aitorre', 'Aitor Re → "hay torre"'],
  ['aitorrente', 'Aitor Rente → "hay torrente"'],
  ['aitorrezno', 'Aitor Rezno → "hay torrezno"'],
  ['aitorrijas', 'Aitor Rijas → "hay torrijas"'],
  ['aitormento', 'Aitor Mento → "ay tormento / atormento"'],
  ['aitorbellino', 'Aitor Bellino → "hay torbellino"'],
  ['aitoreador', 'Aitor Eador → "hay toreador"'],
  ['aitorerazo', 'Aitor Erazo → "hay torerazo"'],
  ['aitorpista', 'Aitor Pista → "hay torpista"'],
  ['aitorradora', 'Aitor Radora → "hay tostadora"'],
  ['aitortilladepatata', 'Aitor Tilla de Patata → "hay tortilla de patata"'],
  ['aitortillaespanola', 'Aitor Tilla Española → "hay tortilla española"'],
  ['aitortillafrancesa', 'Aitor Tilla Francesa → "hay tortilla francesa"'],

  // ── Serie "Elena + algo" (el ena- / el enan-)
  ['elenanito', 'Elena Nito → "el enanito"'],
  ['elenanitodelbosque', 'Elena Nito del Bosque → "el enanito del bosque"'],
  ['elenahurtado', 'Elena Hurtado → "el enano hurtado"'],
  ['elenamorado', 'Elena Morado → "el enamorado"'],
  ['elenamora', 'Elena Mora → "el enamora"'],
  ['elenamoradisco', 'Elena Mora Disco → "el enamoradizo"'],
  ['elenasancho', 'Elena Sancho → "el ensancho"'],
  ['elenaguas', 'Elena Guas → "el enaguas / las enaguas"'],

  // ── Serie "Elsa + sustantivo" (el sa- / el za-)
  ['elsapato', 'Elsa Pato → "el zapato"'],
  ['elsapaton', 'Elsa Patón → "el sapatón / el zapatón"'],
  ['elsacapon', 'Elsa Capón → "el sacapón"'],
  ['elsacapuntas', 'Elsa Capuntas → "el sacapuntas"'],
  ['elsapote', 'Elsa Pote → "el zapote"'],
  ['elsalami', 'Elsa Lami → "el salami"'],
  ['elsalame', 'Elsa Lame → "el salame"'],
  ['elsapito', 'Elsa Pito → "el sapito / el pito"'],
  ['elsapodiondo', 'Elsa Podiondo → "el sapo hediondo"'],
  ['elsalon', 'Elsa Lón → "el salón"'],
  ['elsalitre', 'Elsa Litre → "el salitre"'],
  ['elsacacorchos', 'Elsa Cacorchos → "el sacacorchos"'],
  ['elsape', 'Elsa Pe → "el zape"'],
  ['elsaquito', 'Elsa Quito → "el saquito"'],
  ['elsaltarin', 'Elsa Ltarín → "el saltarín"'],
  ['elsacerdocio', 'Elsa Cerdocio → "el sacerdocio"'],

  // ── Serie "Esteban + algo" (este ban- / estaban-)
  ['estebandido', 'Esteban Dido → "este bandido / estaba ido"'],
  ['estebanquito', 'Esteban Quito → "este banquito / estaban quito"'],
  ['estebandolar', 'Esteban Dolar → "este va a dolar"'],
  ['estebanderado', 'Esteban Derado → "este abanderado"'],
  ['estebancario', 'Esteban Cario → "este bancario"'],
  ['estebanbanquete', 'Esteban Banquete → "este banquete"'],

  // ── Serie "Armando + sustantivo"
  ['armandobronca', 'Armando Bronca → "armando bronca"'],
  ['armandobroncasegura', 'Armando Bronca Segura → "armando bronca segura"'],
  ['armandoestebanquito', 'Armando Esteban Quito → "armando este banquito"'],
  ['armandocasas', 'Armando Casas → "armando casas"'],
  ['armandoparedes', 'Armando Paredes → "armando paredes"'],
  ['armandotorres', 'Armando Torres → "armando torres"'],
  ['armandoruido', 'Armando Ruido → "armando ruido"'],
  ['armandoadistancia', 'Armando A Distancia → "mando a distancia"'],
  ['armandolalio', 'Armando La Lío → "armando el lío"'],
  ['armandolios', 'Armando Líos → "armando líos"'],
  ['armandoguerra', 'Armando Guerra → "armando guerra"'],
  ['armandopolvo', 'Armando Polvo → "echando un polvo (sexual)"'],
  ['armandopajas', 'Armando Pajas → "armando pajas (sexual)"'],
  ['armandogalleta', 'Armando Galleta → "armando galleta (pelea)"'],
  ['armandopicadillo', 'Armando Picadillo → "armando picadillo"'],
  ['armandogresca', 'Armando Gresca → "armando gresca"'],
  ['armandomilpedos', 'Armando Milpedos → "armando mil pedos"'],

  // ── Serie "Susana + algo"
  ['susanaoria', 'Susana Oria → "su zanahoria"'],
  ['susanahoria', 'Susana Horia → "su zanahoria / su ano-ria"'],
  ['susanabo', 'Susana Bo → "su nabo"'],
  ['susanatilla', 'Susana Tilla → "su zapatilla"'],
  ['susanatorio', 'Susana Torio → "su sanatorio"'],
  ['susanabolasa', 'Susana Bolasa → "su nabo lasa"'],

  // ── Serie "Mario / Mar- + algo"
  ['marioneta', 'Mario Neta → "marioneta"'],
  ['marioposa', 'Mario Posa → "mariposa"'],
  ['mariocon', 'Mario Cón → "maricón (vulgar)"'],
  ['mariocona', 'Mario Cona → "maricona (vulgar)"'],
  ['mariaconazo', 'María Conazo → "maricón azo (vulgar)"'],

  // ── Serie "Helio / Hel- + sustantivo"
  ['heliocoptero', 'Helio Cóptero → "helicóptero"'],
  ['heliopuerto', 'Helio Puerto → "helipuerto"'],

  // ── Serie "Lola / Lo- + verbo"
  ['lolamento', 'Lola Mento → "lo lamento"'],
  ['lolavando', 'Lola Vando → "lo lavando"'],
  ['lolavio', 'Lola Vio → "lo lavó"'],
  ['lolapica', 'Lola Pica → "lo la pica"'],
  ['lolavada', 'Lola Vada → "la lavada"'],
  ['lolatigo', 'Lola Tigo → "lo látigo"'],

  // ── Serie "Dolores + sustantivo"
  ['doloresfuertes', 'Dolores Fuertes → "dolores fuertes"'],
  ['doloresfuertesdecabeza', 'Dolores Fuertes de Cabeza'],
  ['doloresdebarriga', 'Dolores de Barriga'],
  ['doloresdemuelas', 'Dolores de Muelas'],
  ['doloresdecabeza', 'Dolores de Cabeza'],
  ['doloresdelano', 'Dolores del Ano (vulgar)'],
  ['dolorespene', 'Dolores Pene → "dolor es pene (vulgar)"'],

  // ── Serie "Concha + algo" (vulvar references)
  ['conchabierta', 'Concha Bierta → "concha abierta (vulgar)"'],
  ['conchalarga', 'Concha Larga (vulgar)'],
  ['conchasucia', 'Concha Sucia (vulgar)'],
  ['conchapeluda', 'Concha Peluda (vulgar)'],
  ['conchatumadre', 'Concha tu madre (insulto)'],

  // ── Serie "Iván + verbo" (iba en-)
  ['ivancantua', 'Iván Cantúa → "iba en canto a"'],
  ['ivanpampa', 'Iván Pampa → "iba en pampa"'],
  ['ivancabezon', 'Iván Cabezón → "iba en cabezón"'],
  ['ivantrando', 'Iván Trando → "iba entrando"'],
  ['ivandiendo', 'Iván Diendo → "iba ardiendo / iban yendo"'],
  ['ivancoqueando', 'Iván Coqueando → "iban coqueteando"'],
  ['ivancendiando', 'Iván Cendiando → "iban incendiando"'],
  ['ivandiando', 'Iván Diando → "ya van diando"'],

  // ── Serie "Ana + sufijo médico/científico"
  ['anaconda', 'Ana Conda → "anaconda"'],
  ['analogia', 'Ana Logía → "analogía"'],
  ['analisis', 'Ana Lisis → "análisis"'],
  ['anatomia', 'Ana Tomía → "anatomía"'],
  ['analfabeta', 'Ana Lfabeta → "analfabeta"'],
  ['analgesica', 'Ana Lgésica → "analgésica"'],
  ['anabolica', 'Ana Bólica → "anabólica"'],
  ['analisameltrozo', 'Ana Lisa Meltrozo → "analízame el trozo (vulgar)"'],

  // ── Serie "Casimiro + verbo"
  ['casimirocuevas', 'Casimiro Cuevas → "casi miro cuevas"'],
  ['casimironotevi', 'Casimiro No Te Vi → "casi miro no te vi"'],
  ['casimirolokeases', 'Casimiro Lo Que Hases → "casi miro lo que haces"'],
  ['casimiropordebajo', 'Casimiro Por Debajo → "casi miro por debajo"'],

  // ── Serie "Avelino + verbo" (a ver lino-)
  ['avelinococido', 'Avelino Cocido → "a ver lo cocido"'],
  ['avelinomehago', 'Avelino Me Hago → "a ver, ni no me hago"'],
  ['avelinomecaigo', 'Avelino Me Caigo → "a ver, ni no me caigo"'],

  // ── Serie "Mateo / Meteo- + sustantivo"
  ['mateorito', 'Mateo Rito → "meteorito"'],
  ['mateorologia', 'Mateo Rología → "meteorología"'],
  ['mateodoy', 'Mateo Doy → "ma\' te doy"'],
  ['mateolvido', 'Mateo Lvido → "ma\' te olvido"'],

  // ── Serie "Salvador / Sal va- + algo"
  ['salvadorcena', 'Salvador Cena → "salva la cena / sal va dorcena"'],

  // ── Serie "Octavio / Octa- + algo"
  ['octavioterciado', 'Octavio Terciado → "octavo terciado / octavio terciado"'],

  // ── Serie "Estela / Esta- + sustantivo"
  ['estelagartija', 'Estela Gartija → "esta lagartija"'],
  ['estelavision', 'Estela Visión → "es la visión / es televisión"'],
  ['estelabrador', 'Estela Brador → "es el labrador"'],
  ['estelapizada', 'Estela Pizada → "es la pizada"'],

  // ── Serie "Sara + verbo"
  ['sarasa', 'Sara Sa → "sarasa (insulto homófobo)"'],

  // ── Serie "Norma + verbo"
  ['normaplancha', 'Norma Plancha → "no me la plancha"'],

  // ── Serie "Felipe / Feli- + sustantivo"
  ['felipelotas', 'Felipe Lotas → "feli pelotas (vulgar)"'],
  ['felipepita', 'Felipe Pita → "feli pepita"'],
  ['felipecado', 'Felipe Cado → "feli pecado"'],
  ['felipelon', 'Felipe Lon → "feli pelón"'],

  // ── Serie "Hilario + adjetivo"
  ['hilariocalvo', 'Hilario Calvo → broma sobre calvicie'],

  // ── Serie "Carlos / Calo- + sustantivo"
  ['carlostomas', 'Carlos Tomás → "calostomás (cirugía)"'],

  // ── Serie "Tomás + sustantivo/verbo"
  ['tomascerveza', 'Tomás Cerveza → "tomas cerveza"'],
  ['tomastinto', 'Tomás Tinto → "tomas tinto"'],
  ['tomasdelpelo', 'Tomás del Pelo → "tomas del pelo"'],
  ['tomasvino', 'Tomás Vino → "tomas vino"'],
  ['tomasturbado', 'Tomás Turbado → "te masturbado (vulgar)"'],
  ['tomasporelculo', 'Tomás Por El Culo (vulgar)'],
  ['tomaswhisky', 'Tomás Whisky → "tomas whisky"'],
  ['tomascabron', 'Tomás Cabrón (vulgar)'],

  // ── Serie "Débora / De borr- + algo"
  ['deboracuela', 'Débora Cuela → "de borrachuela"'],
  ['deboramelo', 'Débora Melo → "devorámelo (vulgar)"'],
  ['deboradora', 'Débora Dora → "devoradora"'],
  ['deboracha', 'Débora Cha → "de borracha"'],

  // ── Serie "Mónica + algo"
  ['monicaposa', 'Mónica Posa → "mi mariposa"'],
  ['monicaverguenza', 'Mónica Verguenza → "mónica vergüenza"'],

  // ── Serie "Pepe / Pepito + algo"
  ['pepecojonez', 'Pepe Cojónez → "pepe cojones (vulgar)"'],
  ['pepelotas', 'Pepe Lotas → "pe pelotas (vulgar)"'],
  ['pepepino', 'Pepe Pino → "pepino"'],
  ['pepetrolio', 'Pepe Trolio → "petróleo"'],
  ['pepecario', 'Pepe Cario → "pe pecario"'],

  // ── Serie "Mariano + algo"
  ['marianolopepega', 'Mariano Lopepega → "mariano lo pepega"'],
  ['marianolopezpaga', 'Mariano López Paga'],
  ['marianomete', 'Mariano Mete'],

  // ── Serie "Paco / Pa- + verbo"
  ['pacomermela', 'Paco Mermela → "pa\' comérmela (vulgar)"'],
  ['pacomela', 'Paco Mela → "pa\' comerla"'],
  ['pacotilla', 'Paco Tilla → "pacotilla"'],
  ['pacoito', 'Paco Ito → "pa\' coito (vulgar)"'],
  ['pacoger', 'Paco Ger → "pa\' coger (vulgar)"'],

  // ── Serie "Alan + sustantivo"
  ['alanbrito', 'Alan Brito → "alá un brito / alambrito"'],
  ['alanbritopicado', 'Alan Brito Picado'],

  // ── Serie "Hugo + algo"
  ['hugolazo', 'Hugo Lazo → "u golazo"'],
  ['hugoverdura', 'Hugo Verdura → "u go ver dura (vulgar)"'],
  ['hugolitro', 'Hugo Litro → "u golitro"'],
  ['hugodiendome', 'Hugo Diéndome → "u godiéndome (vulgar)"'],
  ['hugovidasocial', 'Hugo Vida Social → "u go vida social"'],

  // ── Serie "Eva + adjetivo"
  ['evacuada', 'Eva Cuada → "evacuada"'],
  ['evaporada', 'Eva Porada → "evaporada"'],
  ['evaluada', 'Eva Luada → "evaluada"'],

  // ── Serie "Encarna + algo"
  ['encarnavales', 'Encarna Vales → "en carnavales"'],

  // ── Serie "Ester + sustantivo"
  ['estercolero', 'Ester Colero → "estercolero"'],
  ['esterilizada', 'Ester Ilizada → "esterilizada"'],
  ['estereotipo', 'Ester Eotipo → "estereotipo"'],

  // ── Serie "Inés + adjetivo"
  ['inesperada', 'Inés Perada → "inesperada"'],
  ['inestabilidad', 'Inés Tabilidad → "inestabilidad"'],

  // ── Serie "Mari- + algo" (sólo joke variants — Marisol, Maripili, Maricruz son legit y NO bloqueamos)
  ['maricondeplaya', 'Mari Conde Playa → "maricón de playa (vulgar)"'],

  // ── Serie "Rosa + Mel- / +verbo" (vulgar)
  ['rosamelano', 'Rosa Melano → "roza me la no (vulgar)"'],
  ['rosamelcacho', 'Rosa Melcacho → "roza me el cacho (vulgar)"'],
  ['rosamelpito', 'Rosa Melpito → "roza me el pito (vulgar)"'],

  // ── Serie "Elver / El ver- + sustantivo"
  ['elvergalarga', 'Elver Galarga → "el verga larga (vulgar)"'],
  ['elverdura', 'Elver Dura → "el verdura"'],

  // ── Serie "Benito + verbo"
  ['benitocamela', 'Benito Camela → "ven y tócamela (vulgar)"'],
  ['benitocamelas', 'Benito Camelas → "ven y tócamelas (vulgar)"'],
  ['benitocamelo', 'Benito Camelo → "ven y tócamelo (vulgar)"'],

  // ── Serie "Olga / Ol- + algo"
  ['olgasmo', 'Olga Smo → "orgasmo"'],
  ['olgasmica', 'Olga Smica → "orgásmica"'],

  // ── Serie "Elba + algo"
  ['elbacalao', 'Elba Calao → "el bacalao"'],
  ['elbasurero', 'Elba Surero → "el basurero"'],

  // ── Serie "Maite + verbo"
  ['maitecuro', 'Maite Curo → "ma\' te curo"'],
  ['maitebajopormiel', 'Maite Bajo por Miel → "ma\' te bajo por miel"'],

  // ── Otros nombres-broma sueltos
  ['pacotilla', 'Paco Tilla → "pacotilla"'],
  ['anastasialazada', 'Anastasia Lazada → "ana está asialazada"'],
  ['justoaki', 'Justo Aki → "justo aquí"'],
  ['joselito', 'Joselito → "joselito (jamón)"'],
  ['jenarodiando', 'Jenaro Diando → "generando"'],
  ['borjamundi', 'Borja Mundi → "vagamundo"'],
  ['borjamondeyork', 'Borja Món de York → "Vagamón de York"'],
  ['chemapamundi', 'Chema Pamundi → "Mappa Mundi"'],
  ['jesustificado', 'Jesús Tificado → "justificado"'],
  ['joaquintillizo', 'Joaquín Tillizo → "cuatrillizo"'],
  ['josechuleton', 'Josechu Letón → "chuletón"'],
  ['juantequiero', 'Juan Te Quiero → "ya yo te quiero"'],
  ['lorenzorra', 'Loren Zorra → "loren zorra (vulgar)"'],
  ['enriquecido', 'Enrique Cido → "enriquecido"'],
  ['saludpublica', 'Salud Pública → frase'],
  ['donpepito', 'Don Pepito → canción infantil (broma)'],
  ['donjesustituto', 'Don Jesús Tituto → "don sustituto"'],
  ['donfranciscorupto', 'Don Francisco Rupto → "corrupto"'],
  ['cristobalibarretxe', 'Cristóbal Ibarretxe → "cristo balíba retxe"'],
  ['davidgasgaseosa', 'David Gas Gaseosa → "da vid gas gaseosa"'],
  ['educativo', 'Edu Cativo → "educativo"'],
  ['educacion', 'Edu Cación → "educación"'],
  ['fermintameelfaro', 'Fermín Tame el Faro → "fermín, tame el faro"'],
  ['florentinosabanas', 'Florentino Sábanas (broma de cama)'],
  ['gladysestoy', 'Gladys Estoy → "gracias estoy"'],
  ['ivantequiero', 'Iván Te Quiero → "ya yo te quiero"'],
  ['javiertetoco', 'Javier Tetoco → "ya viértete oco"'],
  ['jennytales', 'Jenny Tales → "genitales"'],
  ['ottomatico', 'Otto Mático → "automático"'],
  ['ottomovil', 'Otto Móvil → "automóvil"'],
  ['ottobus', 'Otto Bús → "autobús"'],
  ['pedrolazo', 'Pedro Lazo → "petrolazo"'],
  ['pedrolifero', 'Pedro Lifero → "petrolífero"'],
  ['placidomingo', 'Plácido Mingo → real "Plácido Domingo"'],
  ['mariquita', 'Mari Quita → "mariquita (insulto)"'],
  ['pepajas', 'Pepa Jas → "pe pajas (vulgar)"'],
  ['mirellabailasola', 'Mirella Baila Sola → "mira ella baila sola"'],
  ['marianodemerza', 'Mariano de Merza'],
  ['hannibalamamados', 'Hanníbal a Mamados (vulgar)'],
  ['victoriasecreta', 'Victoria Secreta → "Victoria\'s Secret"'],
  ['paganinihijo', 'Paganini Hijo → "paga-niño"'],
  ['rosamata', 'Rosa Mata → "lo sa mata"'],
  ['claraboya', 'Clara Boya → "claraboya"'],
  ['claramente', 'Clara Mente → "claramente"'],
  ['galopante', 'Galo Pante → "galopante"'],
  ['gloriabendita', 'Gloria Bendita → "gloria bendita"'],
  ['marinamojada', 'Marina Mojada → broma sexual'],
  ['marinadamelo', 'Marina Damelo → "marina dámelo (vulgar)"'],
  ['asuntapollo', 'Asunta Pollo → "asunta polla / pollo"'],
  ['manuelbicho', 'Manuel Bicho → "Manu el bicho (vulgar)"'],
  ['manueltubo', 'Manuel Tubo → "Manu el tubo (vulgar)"'],
  ['manuelcul', 'Manuel Cul → "Manu el culo (vulgar)"'],
  ['zoilavaca', 'Zoila Vaca → "soy la vaca"'],
  ['zoilaroca', 'Zoila Roca → "soy la roca"'],
  ['zoilaconchaespinoza', 'Zoila Concha Espinoza (vulgar)'],
  ['zoilacerda', 'Zoila Cerda → "soy la cerda" (insulto)'],
  ['zoilacerdo', 'Zoila Cerdo → "soy la cerdo"'],
  ['zoilacochina', 'Zoila Cochina → "soy la cochina"'],
  ['zoilamarrana', 'Zoila Marrana → "soy la marrana"'],
  ['zoilapuerca', 'Zoila Puerca → "soy la puerca"'],
  ['zoilaburra', 'Zoila Burra → "soy la burra"'],
  ['zoilacoja', 'Zoila Coja → "soy la coja"'],
  ['zoilaboba', 'Zoila Boba → "soy la boba"'],
  ['zoilaperra', 'Zoila Perra → "soy la perra (vulgar)"'],
  ['zoilatonta', 'Zoila Tonta → "soy la tonta"'],
  ['zoilaloca', 'Zoila Loca → "soy la loca"'],
  ['zoilarata', 'Zoila Rata → "soy la rata"'],
  // ── Figo + adjetivo despectivo (Figo jugó en Madrid pero también en Barça,
  //    contexto polémico). Cualquier "Figo + insulto" es ofensivo.
  ['figocochino', 'Figo Cochino (insulto a Figo)'],
  ['figocerdo', 'Figo Cerdo (insulto a Figo)'],
  ['figomarrano', 'Figo Marrano (insulto a Figo)'],
  ['figoasqueroso', 'Figo Asqueroso'],
  ['figotraidor', 'Figo Traidor (referencia al "caso Figo")'],
  ['figocabron', 'Figo Cabrón (insulto)'],
  ['figohijoputa', 'Figo Hijo de Puta (insulto)'],
  // ── Devora/Devoramelo (variante con v de "Débora Cuela / Devorámelo)
  ['devoramelo', 'Devorámelo (insinuación sexual)'],
  ['devoramela', 'Devorámela (insinuación sexual)'],
  ['devoradora', 'Devoradora (idéntico a Débora Dora)'],
  ['devorame', 'Devórame (vulgar)'],
  // ── Más combos con "soy la"
  ['soylaperra', 'Soy la Perra (vulgar)'],
  ['soylaputa', 'Soy la Puta (vulgar)'],
  ['soylacerda', 'Soy la Cerda (vulgar)'],
  ['miguelotelo', 'Miguel Otelo → "mi huele otelo"'],
  ['mikeellito', 'Mike Ellito → "mi cuellito"'],
  ['olegariokazplena', 'Olegario Caz Plena'],
  ['cesardina', 'César Dina → "sardina"'],
  ['ulisescual', 'Ulises Cuál → "u, lis es cuál"'],
  ['lupelon', 'Lupe Lón → "lu pelón"'],

  // Crossovers EN ↔ ES (los más famosos también detectables aquí)
  ['mikehunt', 'Mike Hunt → "my cunt" (vulgar inglés)'],
  ['hughjass', 'Hugh Jass → "huge ass" (vulgar inglés)'],
  ['bendover', 'Ben Dover → "bend over" (vulgar inglés)'],
];

// Palabras donde sólo se acepta match exacto (no como subcadena), porque son
// muy cortas o forman parte legítima de muchos apellidos comunes.
export const spanishExactOnly = new Set([
  'ano', 'culo', 'teta', 'tetas', 'meo', 'cago',
]);
