// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en ruso (RU) — transliteradas a latín
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre el "мат" (mat) — vocabulario obsceno ruso — y los slurs más
// comunes. Crítico porque:
//   ▸ Bernabéu Tour recibe miles de visitantes rusos al año.
//   ▸ Los rusos suelen escribir su nombre con caracteres LATINOS en el
//     formulario, no con cirílicos. Por eso la lista está en transliteración.
//   ▸ El paso `unconfuse` del normalize ya convierte cirílico→latín cuando
//     un atacante mete glifos confusables (а cyrillic → a latin), así que
//     esta lista pilla AMBAS vías.
//
// Reglas:
//  - Todas en minúsculas, sin acentos.
//  - Bloqueamos como subcadena en concatNoSpaces.
//  - Tokens muy cortos o ambiguos en `russianExactOnly`.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/oranmor/russian_obscenity (MIT)
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `ru.txt`
//   ▸ Curación manual + revisión de transliteraciones comunes (kh ↔ h ↔ x)

export const russianProfanity = [
  // ── El "Mat" — palabras núcleo del vocabulario obsceno ruso (transliteradas)
  'blyat', 'blyad', 'bliad', 'blyatj', 'bliatj',     // блядь
  'blyaha', 'blyaha-muha',                            // eufemismo vulgar
  'suka', 'sukaa', 'sukin', 'sukinsyn', 'sukasdocheri', // сука
  'sukoblyat', 'sukoyebina',
  'pizdets', 'pizdec', 'pizdetz', 'piezdets',         // пиздец
  'pizdaa', 'pizda', 'pizdoy', 'pizdoyi',             // пизда (vagina vulgar)
  'pizdobol', 'pizdoshnik',                           // mentiroso vulgar
  'pizduy', 'pizdyuk', 'pizdyuka',                    // verbo / variantes
  'huy', 'huj', 'khuy', 'khuj',                       // хуй (pene vulgar)
  'huyi', 'huyem', 'khuya', 'khujem',
  'huesos', 'huesosy', 'khuesos',                     // peyorativo
  'huevo', 'huyovo',                                  // adjetivo vulgar
  'huiplet', 'huiplyot',                              // "tonteando con el pene"
  'huesoset', 'huinya', 'khuinya', 'huinia',          // basura, vulgar
  'pohuy', 'pohuj', 'pofig',                          // "me da igual" vulgar
  'naxuy', 'nahuy', 'nahuj', 'idinakhuj',             // "vete a tomar por…"
  'idinahuy', 'idinakhui', 'idinanahuy', 'poshelnahuy',
  'mudak', 'mudaki', 'mudila', 'mudozvon',            // мудак (idiota vulgar)
  'mudoeb', 'mudoyob',                                // ofensivo grave
  'ebat', 'ebatj', 'ebal', 'ebnut', 'ebnula',         // ёб (verbo grosero)
  'ebatkopat', 'ebanyirot', 'ebanyutkurva',
  'ebanat', 'ebanutyi', 'ebanutaya',                  // "puto loco"
  'yebat', 'yebal', 'yebanutyi',                       // variantes ye-
  'zaebal', 'zaebala', 'doebatsia', 'doyebalsya',
  'razebai', 'razebay', 'razyebay',
  'pizdobratiya', 'yebanyaska',
  'huyak', 'khuyak', 'huyaknul',                      // sonido vulgar
  'zalupa', 'zalupy', 'zalupit',                      // glande (vulgar)
  'jopa', 'zhopa', 'zhopu', 'zhopka', 'zhopnik',      // жопа (culo vulgar)
  'zhopolizvuk', 'zhopoliz',                          // peyorativo
  'derьmo', 'dermo', 'dermovyy', 'govno', 'govna',    // mierda
  'govnoed', 'govnyuk', 'govniuk',
  'pidor', 'pidoras', 'pidaras', 'pidarasy',          // slur homófobo grave
  'pidorashka', 'pidorka',                            // slur étnico-político
  'gomik', 'pederast', 'pedik', 'pidik',
  'shluha', 'shlyuha', 'shlyukha',                    // puta
  'shlepa', 'shliopa',
  'zashkvar',                                         // jerga vulgar contemporánea
  'rossiyatupayastrana',
  'putinhuilo', 'putinkhuilo',                        // chant ucraniano contra Putin
  'svinya', 'svinyatina',                             // cerdo (insulto)
  'tvar', 'tvarey', 'mraz', 'mraza',                  // bestia / escoria
  'kozyol', 'kozyel', 'kozel', 'kozli',               // козёл (cabrón)
  'urodec', 'urodets', 'urod', 'urodina',             // monstruo / feo (insulto)
  'gnida', 'gnidy', 'parasit',                        // parásito (insulto)
  'durak', 'duraki', 'duracheskiy',                   // tonto (mild → moderate)
  'idiot', 'idiotskij',
  'tupica', 'tupitsa', 'tupoy', 'tupoyumnik',
  'debil', 'debily', 'debilizm',                      // débil mental (slur capacitista)
  'imbicil', 'imbecil', 'kreten', 'kretiny',
  'olen', 'olenyi',                                   // "ciervo" usado como tonto
  'lokh', 'lokhi', 'lokhushka',                       // pringado vulgar
  'baran', 'baranyi',                                 // borrego (insulto)
  'tvarina',
  'jopolyz', 'zhopolyz',                              // lameculos vulgar
  'sosi', 'sosalovo', 'soska', 'sosaka',              // chupar (vulgar sexual)
  'minyetchik', 'minetchik', 'minyot',                // sexo oral vulgar
  'kurva',                                            // puta (préstamo eslavo)
  'gondon', 'gondony',                                // condón usado como insulto
  'manda', 'mandavoshka',                             // vulgar genital
  'salaga',
  'tcheppanutyy', 'cheppanutyy',                      // "tarado"

  // ── Slurs étnicos rusos
  'churka', 'churki', 'churkam',                      // slur xenófobo (asiáticos centrales)
  'khachi', 'khachiki', 'khachik',                    // slur (caucasianos)
  'zhid', 'zhidy', 'zhidovskiy', 'zhidovin',          // slur antisemita
  'zhabbar',
  'negr', 'negry', 'chernojopyy',                     // slur racial
  'banderovec', 'banderlog',                          // peyorativo anti-ucraniano
  'moskal', 'moskali',                                // peyorativo (anti-ruso usado por ucranianos)
  'khokhol', 'khokhly',                               // slur étnico anti-ucraniano
  'ukrop', 'ukropy',                                  // peyorativo en guerra
  'ukronazi', 'rusofob',                              // términos políticos extremos
  'tsygane', 'tsygan', 'cygane', 'tsiganshchina',     // slur anti-romaní
  'tatarva',                                          // slur anti-tártaro

  // ── Apología (URSS / Stalin / nazi-rusa / Putinismo)
  'gulag', 'kgb',                                     // pueden ser ambiguos — sólo solos
  'vladlen',                                          // diminutivo de Vladimir Lenin
  'stalingulag', 'stalinist',
  'zaputinapomnemvse', 'putinist',
  'krymnash',                                         // chant invasión Crimea
  'zsvozhno', 'zaputinazaputina',
  'rusmir', 'russkijmir',                             // "Russkiy Mir" — narrativa imperialista
  'ssvoyu', 'wagnerchik',                             // referencia mercenarios Wagner
  'kadyrovec',                                        // milicia controvertida
];

// Frases compuestas vulgares — re-segmentación obvia.
export const russianJokeNames = [
  ['idinahuy',     'expresión rusa muy vulgar'],
  ['idinakhui',    'expresión rusa muy vulgar'],
  ['idinanahuy',   'expresión rusa muy vulgar'],
  ['poshelnahuy',  'expresión rusa muy vulgar'],
  ['putinhuilo',   'chant contra Putin (ofensivo en HALO neutral)'],
  ['krymnash',     'chant pro-anexión de Crimea'],
  ['xuiplet',      'vulgar ruso compuesto'],
  ['blyahamuha',   'eufemismo vulgar ruso'],
  ['russkijmir',   'narrativa imperialista controvertida'],
  ['banderovec',   'peyorativo político anti-ucraniano'],
  ['kadyrovec',    'referencia milicia controvertida'],

  // ── Apellidos-broma: nombre ruso transliterado + vulgaridad concatenada
  ['ivanpizdatov',          '"Ivan Pizdatov" → "ivan, pizdat..." vulgar'],
  ['olgasuchkina',          '"Olga Suchkina" → suchka (perra)'],
  ['vladimirhuilov',        '"Vladimir Huilov" → huilo (pollón)'],
  ['sergeyzaebalov',        '"Sergey Zaebalov" → zaebal (me has jodido)'],
  ['dmitrymudakov',         '"Dmitry Mudakov" → mudak (gilipollas)'],
  ['alexeyebanutov',        '"Alexey Ebanutov" → ebanyi puto loco'],
  ['natashablyadova',       '"Natasha Blyadova" → blyad (zorra)'],
  ['borispizdetsky',        '"Boris Pizdetsky" → pizdets cagada total'],
  ['andreyzalupin',         '"Andrey Zalupin" → zalupa (glande)'],
  ['mikhailgovnov',         '"Mikhail Govnov" → govno (mierda)'],
  ['yuripidorov',           '"Yuri Pidorov" → slur homófobo'],
  ['katyashlyuhina',        '"Katya Shlyuhina" → shlyuha (puta)'],
  ['nikolaymudilov',        '"Nikolay Mudilov" → mudila (idiota)'],
  ['romanjopolizov',        '"Roman Jopolizov" → jopoliz (lameculos)'],
  ['svetlanapizdunova',     '"Svetlana Pizdunova" → pizdun mentiroso'],
  ['fedorhuyakov',          '"Fedor Huyakov" → huyak (golpazo vulg)'],
  ['gennadyebakov',         '"Gennady Ebakov" → ebak follador'],
  ['leonidsosalov',         '"Leonid Sosalov" → sosalovo (chupar vulg)'],
  ['viktorgondonov',        '"Viktor Gondonov" → gondon (condón insulto)'],
  ['pavelpidorashkin',      '"Pavel Pidorashkin" → pidorashka slur'],
  ['arkadyhuesosov',        '"Arkady Huesosov" → chupapollas'],
  ['galinamandavoshkina',   '"Galina Mandavoshkina" → mandavoshka (ladilla)'],
  ['ilyazhopnikov',         '"Ilya Zhopnikov" → zhopnik (culero)'],
  ['valentinminetchikov',   '"Valentin Minetchikov" → minetchik mamador'],
  ['oksanasukoyebina',      '"Oksana Sukoyebina" → puta jodida'],
  ['grigoryebanyrotov',     '"Grigory Ebanyrotov" → puta boca'],
  ['ruslannahuevov',        '"Ruslan Nahuevov" → nahuy a tomar por culo'],
  ['anastasiyazalupina',    '"Anastasiya Zalupina" → zalupa (glande)'],
  ['maximkhachikov',        '"Maxim Khachikov" → khachik slur caucásico'],
];

// Tokens cortos / ambiguos — sólo como token completo.
export const russianExactOnly = new Set([
  'huy', 'huj',     // demasiado cortos como subcadena (causaría FP)
  'kgb', 'gulag',   // sólo solos = referencia política
  'mat',            // tan corto que falsearía
  'jopa', 'zhopa',  // existe como apellido raro
  'cao', 'mraz',    // demasiado cortos
  'urod', 'tvar',
  'olen',
  'pofig',          // ambiguo
  'durak', 'idiot', // términos comunes que también aparecen en lit. legítima
  'gomik',
  'salaga',
  'lokh',
  'pedik', 'pidik',
  'baran',          // común como apellido (Baran existe)
  'svinya',
  'kozel',          // también apellido común
  'soska', 'sosi',
  'kurva',          // también vía polaca
  'manda',          // existe como nombre propio raro
  'gondon',
]);
