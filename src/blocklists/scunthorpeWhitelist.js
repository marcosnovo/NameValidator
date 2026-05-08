// ──────────────────────────────────────────────────────────────────────────
//  Whitelist Scunthorpe — palabras legítimas que CONTIENEN subcadenas
//  vulgares pero NO son ofensivas.
// ──────────────────────────────────────────────────────────────────────────
//
// El "Scunthorpe problem" toma su nombre de la ciudad inglesa Scunthorpe,
// que contiene la subcadena "cunt". Los filtros de profanidad ingenuos la
// bloqueaban, frustrando a los habitantes y empresas locales.
//
// Funcionamiento:
//   ▸ Antes de buscar profanidad por subcadena, "perforamos" el texto
//     reemplazando cada palabra-whitelist por marcadores neutros (•••).
//   ▸ Las búsquedas posteriores no pueden encontrar la subcadena vulgar
//     dentro de la palabra protegida.
//   ▸ Si la palabra protegida APARECE TAL CUAL en el input, no se
//     bloquea. Si el atacante intenta usar SÓLO la subcadena vulgar
//     (sin la palabra envolvente completa), sigue cayendo.
//
// Categorías cubiertas:
//   ▸ Topónimos del Reino Unido / mundo (Scunthorpe, Penistone, Cumbria,
//     Cumbernauld, Matsushita, Arsenal…)
//   ▸ Palabras inglesas comunes (assess, classic, glasses, cockpit,
//     analysis, pussycat, niggardly…)
//   ▸ Palabras españolas/castellanas comunes que tienen subcadena
//     potencialmente vulgar (espárrago, esparragal…)
//   ▸ Apellidos/nombres conocidos (Dickens, Fitch, Hitchcock, Gokulapuram…)
//   ▸ Nombres de productos (Matsushita)
//
// La lista se aplica como ENTERO Word — es decir, "assess" no protege
// "shitassess" porque el matcher exacto comprobará que sí está como
// palabra completa.

export const scunthorpeWhitelist = [
  // ── Topónimos UK / Europa
  'scunthorpe',
  'penistone',
  'cumbria', 'cumbernauld', 'cumberland', 'cummington',
  'lightwater',
  'shitterton',     // (sí existe, Dorset, UK)
  'arsenal',
  'sussex',
  'middlesex',
  'wessex',
  'essex',

  // ── Palabras EN comunes con subcadena ofensiva
  'classic', 'classical', 'classics',
  'class', 'classes', 'classroom', 'classmate',
  'assess', 'assessment', 'assessor', 'assessing', 'assessed',
  'pass', 'passing', 'passed', 'passes', 'password',
  'mass', 'masses', 'massive', 'massacre', 'massachussetts',
  'glass', 'glasses', 'glassware', 'fiberglass',
  'compass', 'compasses', 'embassy',
  'cockpit', 'cocktail', 'cockerel', 'cockney',
  'shitake',         // shitake mushroom (variante de shiitake)
  'shiitake',
  'analysis', 'analyses', 'analyst', 'analytical', 'analytics',
  'analog', 'analogy', 'analogous',
  'banal', 'banality',
  'canal', 'canals',
  'pianola',
  'fanatic', 'fanatical',
  'pussycat', 'pussyfoot',
  'niggardly',       // palabra inglesa legítima de origen escandinavo
  'snigger',         // antiguo inglés
  'titmouse', 'titanic', 'titles', 'titration',
  'twatch',          // (raro pero existe)
  'fagus',           // género botánico (haya)
  'faggot',          // ahora ofensivo en EN; en culinaria UK significa albóndiga
                     // — sigue en blocklist pero documentado por completitud
  'aspect', 'aspectos',
  'bass', 'basset', 'bassist', 'bassoon',
  'kumquat',
  'kumar', 'kumara',

  // ── Marcas / nombres propios
  'matsushita',
  'gokulapuram',
  'fitchburg',
  'hitchcock', 'hitchcocks',
  'dickens', 'dickensian',
  'dickinson',
  'cockney',
  'cockburn', 'cockburns',
  'cockerell',
  'fitch',

  // ── Apellidos castellanos y portugueses comunes con substring potencial
  'lopez', 'lopezjr', 'lopes', 'lopezgarcia',
  // ── Apellidos checos/eslovacos comunes que colisionan con profanidad
  //    fonética. "Svoboda" (libertad) es el apellido más común de Chequia;
  //    tras phoneticEs (v→b) "sboboda" contiene "bobo" (idiota español).
  'svoboda', 'svobodova', 'svobodník',
  'novak', 'novák', 'nováková', 'novakova',  // Novák — top apellido CZ/SK
  'dvořák', 'dvorak', 'dvořáková', 'dvorakova',  // Dvořák
  'němec', 'nemec',                              // Němec
  'pekka', 'pekarova',                           // Pekka, Pekařová

  // ── Nombres coreanos comunes con sílaba "jun" / "junho" / "minjun" que
  //    matchean falsamente "injun" (slur en english_profanity). Coreano
  //    Min-jun, Hye-jun, Jun-ho, Jun-seo son nombres extremadamente
  //    extendidos en Corea (millones de personas).
  'minjun', 'minjoon', 'minjune',
  'hyejun', 'hyojun', 'sungjun',
  'junho', 'junseo', 'junsu', 'junyoung', 'junki',
  'jihun', 'jihoon', 'jiwon', 'jisoo',
  'kimjun', 'parkminjun', 'leejun',

  // ── Nombres griegos comunes que contienen "christ" como prefijo (no es
  //    blasfemia: Χριστός es un nombre legítimo extendido en Grecia y la
  //    diáspora ortodoxa). Sin esto el matcher de profanidad francesa
  //    quebequesa los marca como soeces ("christ" / "christ de tabarnak").
  'christos', 'christo', 'christodoulos', 'christodoulou',
  'christou', 'christidis', 'christopoulos',
  'christofidis', 'christoforidis', 'christoforou',
  'christoulakis', 'christophoros',
  // Nombres que contienen "christ" en general
  'christian', 'christiana', 'christiano', 'christianos', 'christianna',
  'christine', 'christina', 'christiane', 'christy', 'christie',
  'christopher', 'cristopher', 'christophe', 'kristoffer',
  'cristian', 'cristiano', 'cristiana', 'cristina', 'cristobal',
  'kristina', 'kristian', 'kristina', 'krystian',
  'christmas', 'christen', 'christened',
  'antilope', 'antilopes',
  'lopear',
  'culebro', 'culebrera',
  // Escobar — apellido extremadamente común en España y Latinoamérica
  // (>40.000 personas en España, INE). Reverso "rabocse" contiene "rabo"
  // como artefacto Scunthorpe; lo perforamos.
  'escobar', 'escobedo', 'escobio',
  'pizarro', 'pizarra', 'pizarras', // Pizarro común también
  'ramirez', 'ramos', 'ramirezgomez',

  // ── Castellano: palabras que contienen subcadenas potencialmente
  //    problemáticas pero son legítimas
  'espárrago', 'esparrago', 'espárragos', 'esparragos', 'esparragal',
  'culomar',  // (raro pero existe)
  'culombio', 'culombios',  // unidad de carga eléctrica (Coulomb)
  'culantro', 'culantros',  // hierba aromática
  'culebra', 'culebras', 'culebrón',
  'culombiano', // adjetivo
  'cultura', 'cultural', 'culturas', 'culturismo', 'culturista',
  'culpable', 'culpables', 'culpa', 'culpar', 'culposo',
  'cultivar', 'cultivado', 'cultivadora',
  'culminante', 'culminar', 'culmen',
  'ruculares',
  'mitocondria', 'mitomanía', 'mítico',
  'monosabio',
  'simiente', 'simiesco',  // contienen 'simio' como base
  'macarrónico', 'macarrón', 'macarrones',  // ≠ macaco
  'oferta', 'ofertón',  // ≠ feo

  // ── Francés
  'concombre',  // contiene 'con' pero es pepino
  'concours', 'concurrent', 'concept',
  'congratulation',

  // ── Portugués
  'cumbuca',
  'cumprimento', 'cumprimentar',
  'piça',  // sí existe como apellido (registrado en PT)

  // ── Apellidos rusos comunes (transliterados) — alguna combinación con
  //    "huy/huj/khuy" o sufijos puede sufrir colisión Scunthorpe.
  'ivanov', 'ivanova', 'ivanovich',
  'petrov', 'petrova', 'petrovich',
  'sokolov', 'sokolova',
  'volkov', 'volkova',                // contiene "vol" / "kov"
  'kuznetsov', 'kuznetsova',
  'popov', 'popova',
  'lebedev', 'lebedeva',
  'mikhailov', 'mikhailova',
  'fedorov', 'fedorova',
  'morozov', 'morozova',
  'kozlov', 'kozlova',                // riesgo: contiene "kozyol" tras fonético
  'novikov', 'novikova',
  'andreev', 'andreeva',
  'medvedev', 'medvedeva',
  'beliaev', 'beliaeva',
  'zaitsev', 'zaitseva',
  'nikolaev', 'nikolaeva',
  'baranov', 'baranova',              // "baran" (carnero) sería FP — protegemos apellido
  'romanov', 'romanova',
  'gordeev',
  'shukin', 'shukinova',

  // ── Apellidos polacos comunes
  'kowalski', 'kowalska',
  'nowak', 'nowakowski', 'nowakowska',
  'wojcik', 'wojcikowska',
  'kaminski', 'kaminska',
  'lewandowski', 'lewandowska',       // top apellido PL (Robert Lewandowski)
  'wisniewski', 'wisniewska',
  'dabrowski', 'dabrowska',
  'kozlowski', 'kozlowska',           // FP "kozel" tras fonético
  'jankowski', 'jankowska',
  'mazur', 'mazurek',                 // FP "mazur" tras fonético

  // ── Apellidos griegos comunes (terminados en -kos / -akos / -opoulos)
  //    que tras fonético rozan "kos" (kuss árabe) o "kolos" (kolos griego).
  'papadopoulos', 'papadopoulou',     // top apellido griego
  'georgiou', 'georgiadis',
  'nikolaidis', 'nikolaou',
  'antoniou', 'antonopoulos',
  'panagiotopoulos', 'panagiotis',
  'konstantinou', 'konstantinos',
  'dimitriou', 'dimitrakopoulos',
  'kostopoulos', 'kostas',
  'karagiannis', 'karageorgis',
  'theodoratos', 'theodorou',
  'angelopoulos', 'angelidis',
  'vasilakos', 'vasilakopoulos',     // FP -kos
  'spyros', 'spyrakis',
  'manakos', 'manolakos',
  'stathakis', 'stamatis',
  'diakos', 'diakogiannis',
  'kyriakos',                         // FP "kos"

  // ── Apellidos turcos comunes (-oğlu, -türk)
  // OJO: omitimos -oc/-koc/-kurt/-kaya (3 chars o menos) porque
  //   perforarían substrings inocentes en otros idiomas.
  'yilmaz', 'demir', 'celik',
  'sahin', 'yildirim', 'yildiz',
  'aydin', 'ozdemir', 'arslan',
  'dogan', 'kilic', 'cetin',
  'kurt',                              // ojo: 'kurt' coincide con gentilicio kürt; protegemos
  'ozkan', 'simsek', 'sari-',          // 'sari' aislado es nombre indio/turco común
  'erdogan', 'akyol',
  'ogan-', 'ozer-',
  'turan', 'yavuz',
  'koroglu', 'oguzhan',
  'pekcan', 'pekkan',                  // Pekka(n)

  // ── Apellidos árabes comunes (transliterados)
  //    Riesgo: muchos -kos / -kus / -kal / -kel — colisionan con AR profanity.
  //    OJO: omitimos 3-letter (omar, ali) porque son demasiado cortos.
  'mohamed', 'mohammad', 'muhammad', 'muhamed',
  'ahmed', 'ahmad',
  'alibasha',
  'hassan', 'hossain', 'hussain',
  'ibrahim',
  'mahmoud', 'mahmud',
  'ismail',
  'mustafa',
  'youssef', 'yusuf', 'yousef',
  'khaled', 'khalid',
  'hamdan', 'hamdani',
  'rashid', 'rasheed',
  'fakhouri', 'fakhoury',             // FP "fak" → exempt
  'aboud', 'abboud',
  'kassem', 'qasim', 'kasim',
  'nasser', 'nassir',
  'jamal', 'jamil',
  'kanaan', 'qanan',
  'kossayan', 'kossaifi',             // Kos- como sufijo (apellido legítimo)
  'haddad', 'hadad',
  'jabbar',                            // FP "jabb"

  // ── Apellidos chinos comunes (Pinyin)
  // OJO: NO incluimos los de 1-3 chars (li, wu, ma, he, hu, su, xu...)
  //   porque al ser tan cortos perforarían substrings de palabras
  //   legítimas largas en otros idiomas (e.g. "li" eliminaría parte de
  //   "gilipollas"). Los nombres muy cortos están protegidos sólo si
  //   ya forman tokens enteros del input (= no son la única palabra
  //   problemática del input).
  'wang', 'zhang', 'chen', 'yang', 'huang',
  'zhao', 'zhou', 'song',
  'tang', 'cheng', 'feng',
  'chiang',
  // 3-letter omitted: liu, guo, gao, lin, luo (alto riesgo de FP)
  'pengfei', 'jianhua',                // nombres compuestos
  'shaolin',                           // famoso, no shaobi/shabi
  // Apellidos compuestos comunes que rozan "shabi"/"caonima" tras concatenación
  'shaobing', 'shaomin',

  // ── Apellidos japoneses comunes (romaji) — top 30, omitimos 3-letter:
  //    sato, ito, goto, mori, aoki son cortos pero >=4 ok
  'tanaka', 'yamamoto', 'suzuki', 'watanabe',
  'nakamura', 'kobayashi', 'yoshida', 'yamada', 'sasaki',
  'matsumoto', 'inoue', 'kimura', 'shimizu', 'hayashi',
  'saito', 'fujita', 'okada-', 'kondo', 'mori-',
  'ikeda', 'hashimoto', 'ishikawa', 'maeda', 'fujii',
  'aoki-', 'matsuda', 'nakajima',
  // Riesgo: 'manuke', 'busu' (mujer fea) son palabras vulgares pero
  //   apellidos como "Maeda", "Maoka", "Busujima" rozan tras concatenar.
  'busujima', 'manukawa',

  // ── Apellidos coreanos comunes (romaji RR)
  // KIM, LEE, PARK, CHOI, JUNG... Top 10 cubren ~50% de Corea.
  // OJO: igual que con chinos, evitamos apellidos de 1-3 chars (kim, lee,
  //   park, choi, han, oh, jo, yi, ji, su) porque son demasiado cortos y
  //   perforarían substrings inocentes de otros idiomas. Los protegemos
  //   sólo en sus combinaciones de 4+ chars o con nombres compuestos.
  'choi', 'chung', 'jung', 'jeon',
  'jeong', 'kang', 'yoon', 'jang',
  'shin-', 'kwon',
  'hwang', 'ryoo', 'baek',
  // 3-letter omitted: seo, ryu, kim, lee, oh
  // Compuestos comunes que rozan profanity coreano
  'jongho', 'junho', 'minho', 'jiho',
  'sangwoo', 'sungwoo',
  'parkjun', 'leejun', 'kimjun',       // compuestos de 6+ chars

  // ── Apellidos hebreos / israelíes comunes (omitimos 3-letter: amar, etc.)
  'cohen', 'kohen',
  'levi-', 'levy-',
  'mizrahi', 'mizrachi',
  'peretz',
  'azoulay',
  'biton',
  'dahan',
  'avraham',
  'shapiro', 'shapira',
  'goldberg',
  'rosenberg',
  'friedman',
  'kushner',                          // ojo: contiene "kush" árabe — exempt

  // ── Apellidos holandeses comunes (omitimos 3-letter: kok, kox)
  'jansen', 'janssen', 'devries', 'devos', 'denboer',
  'vanderberg', 'vandenberg', 'vanderlinden', 'vanleeuwen',
  'mulder',
  'bakker',
  'visser',
  'meijer', 'meyer',
  'pothoven',                         // contiene 'pot' (peyorativo lesb. NL — pero también apellido)

  // ── Apellidos húngaros comunes
  'kovacs', 'kovács',
  'nagy',
  'toth', 'tóth',
  'horvath', 'horváth',
  'szabo', 'szabó',
  'farkas',
  'molnar', 'molnár',
  'balogh',
  'papp',
  'takacs', 'takács',
  'juhasz', 'juhász',
  'lakatos',
  'szilagyi', 'szilágyi',
  'mészáros', 'meszaros',
  'olah', 'oláh',
  'simon',
  'racz', 'rácz',
  'fekete',
  'pinter', 'pintér',                 // riesgo "pin" / "ter" — exento

  // ── Apellidos rumanos comunes (omitimos 3-letter: pop, rus, stan, etc.)
  'popescu', 'ionescu', 'popa-',
  'stoica', 'dumitrescu', 'dumitru',
  'gheorghe', 'georgescu',
  'constantinescu', 'constantin',
  'rusulescu', 'rusu-',
  'munteanu',
  'matei-',
  'tudorescu',
  'barbu-',                           // FP "bar"
  'florea',
  'serban',                           // FP "serb"
  'oprea',
];

// Pre-normalizamos la whitelist al cargar el módulo (más rápido).
const NORMALIZED_WHITELIST = scunthorpeWhitelist
  .map((w) =>
    w
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '')
  )
  .filter(Boolean);

// Cache de whitelists ya transformadas con cada función fonética. Evita
// recalcular en cada validación.
const PHONETIC_WHITELIST_CACHE = new WeakMap();

/**
 * Aplica la whitelist Scunthorpe sobre una vista normalizada del input.
 * Reemplaza cada palabra-whitelist por placeholders (\x02) para que el
 * matching de profanidad no la encuentre como substring.
 *
 * Si se pasa `phoneticFn`, transforma cada entrada de la whitelist con
 * esa función ANTES de buscar — así "Cockburn" se vuelve "coburn" y
 * neutraliza el match fonético "cok" derivado de "cock".
 *
 * @param {string} text — vista a "perforar"
 * @param {Function} [phoneticFn] — opcional, función fonética por idioma
 * @returns {string}
 */
export function applyScunthorpeWhitelist(text, phoneticFn = null) {
  if (!text) return text;
  let words;
  if (phoneticFn) {
    let cached = PHONETIC_WHITELIST_CACHE.get(phoneticFn);
    if (!cached) {
      cached = NORMALIZED_WHITELIST.map((w) => phoneticFn(w)).filter(Boolean);
      PHONETIC_WHITELIST_CACHE.set(phoneticFn, cached);
    }
    words = cached;
  } else {
    words = NORMALIZED_WHITELIST;
  }
  let out = text;
  for (const w of words) {
    if (!w || !out.includes(w)) continue;
    const placeholder = '\x02'.repeat(w.length);
    out = out.split(w).join(placeholder);
  }
  return out;
}
