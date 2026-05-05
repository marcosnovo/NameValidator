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

export const russianProfanity = [
  // ── El "Mat" — palabras núcleo del vocabulario obsceno ruso (transliteradas)
  'blyat', 'blyad', 'bliad', 'blyatj', 'bliatj',     // блядь
  'suka', 'sukaa', 'sukin', 'sukinsyn', 'sukasdocheri', // сука
  'pizdets', 'pizdec', 'pizdetz', 'pizdec', 'piezdets', // пиздец
  'pizdaa', 'pizda', 'pizdoy', 'pizdoyi',            // пизда (vagina vulgar)
  'pizdobol', 'pizdoshnik',                          // mentiroso vulgar
  'huy', 'huj', 'khuy', 'khuj',                      // хуй (pene vulgar)
  'huyi', 'huyem', 'khuya', 'khujem',
  'huiplet', 'huiplyot',                             // "tonteando con el pene"
  'pohuy', 'pohuj', 'pofig',                         // "me da igual" vulgar
  'naxuy', 'nahuy', 'nahuj', 'idinakhuj',            // "vete a tomar por…"
  'idinahuy', 'idinakhui',
  'mudak', 'mudaki', 'mudila', 'mudozvon',           // мудак (idiota vulgar)
  'mudoeb',                                          // ofensivo grave
  'ebat', 'ebatj', 'ebal', 'ebnut', 'ebnula',        // ёб (verbo grosero)
  'ebanyirot', 'ebanyirot', 'ebanyutkurva',
  'ebanat', 'ebanutyi', 'ebanutaya',                 // "puto loco"
  'ebatkopat',
  'zalupa', 'zalupy',                                // glande (vulgar)
  'jopa', 'zhopa', 'zhopu', 'zhopka', 'zhopnik',     // жопа (culo vulgar)
  'derьmo', 'dermo', 'dermovyy', 'govno', 'govna',   // mierda
  'pidor', 'pidoras', 'pidaras', 'pidarasy',         // slur homófobo grave
  'gomik', 'pederast',
  'zaebal', 'zaebala', 'doebatsia',
  'shluha', 'shlyuha', 'shlyukha',                   // puta
  'zashkvar',                                        // jerga vulgar contemporánea
  'pidorashka',                                      // slur étnico-político
  'rossiyatupayastrana',
  'putinhuilo', 'putinkhuilo',                       // chant ucraniano contra Putin

  // ── Slurs étnicos rusos
  'churka', 'churki', 'churkam',                     // slur xenófobo (asiáticos centrales)
  'khachi', 'khachiki', 'khachik',                   // slur (caucasianos)
  'zhid', 'zhidy', 'zhidovskiy',                     // slur antisemita
  'narko',                                           // sólo solo (luego va a exact)
  'zhabbar',
  'negr', 'negry',                                   // slur racial
  'ukronazi', 'rusofob',                             // términos políticos extremos

  // ── Apología (URSS / Stalin / nazi-rusa)
  'gulag', 'kgb',                                    // pueden ser ambiguos — sólo solos
  'vladlen',                                         // diminutivo de Vladimir Lenin
  'stalingulag',
  'zaputinapomnemvse',
  'krymnash',                                        // chant invasión Crimea
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
];

// Tokens cortos / ambiguos — sólo como token completo.
export const russianExactOnly = new Set([
  'huy', 'huj',     // demasiado cortos como subcadena (causaría FP)
  'kgb', 'gulag',   // sólo solos = referencia política
  'mat',            // tan corto que falsearía
  'jopa', 'zhopa',  // existe como apellido raro
]);
