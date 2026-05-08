// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en árabe (AR) — transliteradas a latín
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "shatā'im" (insultos) árabes más extendidas y referencias
// religiosas usadas como insulto. Crítico porque:
//   ▸ El visitante árabe escribe casi siempre con caracteres LATINOS
//     (transliterado o "Arabizi"), no en árabe (los formularios de venta
//     online no aceptan árabe nativo en la mayoría de stadium ticketing).
//   ▸ Las transliteraciones varían (kuss/koss/kosh/kos), por eso incluimos
//     múltiples variantes.
//   ▸ Algunos insultos religiosos son específicos del contexto árabe y
//     necesitan match aunque vengan en latín.
//
// NO cubrimos referencias religiosas mainstream (Allah, Mohammed como
// nombre, Bismillah, etc.) — son nombres y expresiones legítimas en
// millones de personas. Solo lo que es claramente insulto.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/uxbertlabs/arabic_bad_dirty_word_filter_list
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `ar.txt`
//   ▸ Curación manual de variantes dialectales (egipcio, levantino, golfo)

export const arabicProfanity = [
  // ── Núcleo vulgar árabe (transliteración común)
  'kuss', 'koss', 'kos', 'kosh', 'kossok', 'kosokhat',  // كس (vagina vulgar)
  'kosomak', 'kosumak', 'kosomk', 'kosumk',             // "el coño de tu madre"
  'kosokhatak', 'kosukhtak', 'kosokho',
  'kos-emmak', 'kos-okhtak',
  'zob', 'zobr', 'zobri', 'azzeb', 'zobakh',            // pene vulgar
  'air', 'ayri', 'ayyer',                               // pene vulgar (otra raíz)
  'aireh', 'aireak',
  'tiz', 'teez', 'teezak', 'teezi',                     // culo
  'taht', 'tahtek',
  'sharmoot', 'sharmuta', 'charmouta', 'sharmoota',     // puta
  'sharmootik', 'sharmoutik', 'sharmootak',
  'kahba', 'kahbah', 'qahba', 'qahbeh', 'qahbah',       // puta
  'kahbeh-binit', 'qahbawi',
  'manyak', 'manyek', 'manyaak', 'manyooka',            // perdedor / vulgar
  'ahbal', 'ehbal', 'ahbel', 'ahbalek',                 // imbécil
  'gahba',                                              // variante
  'zibik', 'zib', 'zibii',                              // pene
  'hayawan', 'hayawen', 'hayawana',                     // "animal" como insulto
  'zubri', 'zubrak',
  'kalb', 'kelb', 'kalbi', 'kelbi',                     // perro como insulto
  'kelbah', 'kelbawi', 'kalbabnkalb',
  'ibnelkalb', 'ibnalkalb', 'ibnkalb',                  // "hijo de perro"
  'ibnalkalba', 'ibnkalbeh',
  'ibnelhaha', 'ibnelhaha-bi-nta',                      // insulto madre (vulgar)
  'ibnelqahba', 'ibnelkahba', 'ibn-elkahba',            // "hijo de puta"
  'ibnelharam', 'ibnharam', 'ibnharameh',               // "hijo del haram"
  'allayl3anak', 'allay3nak', 'allehyl3nak',            // "que Dios te maldiga" (ofensivo)
  'kafir', 'kuffar', 'kafera',                          // "infiel" — usado como insulto
  'munafiq', 'munafiqun', 'munafeqeen',                 // "hipócrita" — usado como insulto religioso
  'najis', 'najasa',                                    // "impuro" — usado como insulto
  'mughtasib',                                          // "violador" (cuando usado como insulto)
  'majnun', 'majnoun', 'majnoona',                      // "loco" (capacitista en contexto)
  'baghil', 'baghal', 'bghal',                          // "mula" como insulto
  'himar', 'humar',                                     // "burro" como insulto
  'khanzeer', 'khinzir', 'khanazir',                    // "cerdo" como insulto (relig. + animal)
  'la3een', 'laeen', 'mal3oun', 'mal3ouna',             // "maldito"
  'tannak', 'tannakk',
  'zibala', 'zibaleh', 'zbeleh',                        // "basura" como insulto
  'wessikh', 'wisikh', 'wessikha',                      // "sucio" / vulgar
  'walaagharib',
  'fashist',                                            // fascista
  'bint-elkalb',
  'a3sab', 'a3sba',
  'tilaka',
  'masakhra', 'masakhara',
  'zfto', 'zfit',                                       // peyorativo
  'sho-mukhabasakk',
  'akhuekkhal', 'akhirakhuk',

  // ── Slurs étnico-religiosos
  'yahudi', 'yehudi', 'yahud-elhrm',                    // ambiguo: "judío" (puede ser legítimo o slur)
  'sharqi',
  'bilamithl',
  'zionist', 'sahyuni', 'sahaayina',                    // dependiendo del uso
  'farisi',                                             // peyorativo en contextos
  'sho3oobi',
  'rafidh', 'rafidha',                                  // slur sectario contra chiíes
  'nasibi',                                             // slur sectario contra suníes
  'safavi',                                             // peyorativo sectario
  'jbal', 'jabal',                                      // peyorativo regional

  // ── Apología extremista
  'daesh', 'daeshfan',                                  // ISIS — apología
  'jihad', 'jihadi', 'jihadist',                        // ambiguo — sólo en contexto solo
  'mujahid',                                            // ambiguo
  'almawtllamerica', 'almautlamerica',
  'almawtllaisrael', 'almautlaisrael',
  'isis-fan', 'qaeda-fan', 'binladenfan',
  'hizbulshaytan',                                      // referencia controvertida
  'wilayatpro',                                         // pro-extremista
  'khilafa-now',                                        // chant pro-califato extremista
];

export const arabicJokeNames = [
  ['kosomak',         'insulto árabe a la madre'],
  ['ibnelqahba',      '"hijo de puta" en árabe'],
  ['sharmootabint',   'insulto árabe vulgar'],
  ['allayl3anak',     'maldición religiosa árabe usada como insulto'],
  ['ibnelkalb',       '"hijo de perro" — insulto árabe'],
  ['daeshfanboy',     'apología ISIS'],
  ['jihadist',        'apología extremista'],
  ['ibnelharam',      '"hijo del haram" — insulto religioso'],
  ['kosokhtak',       'insulto sexual a hermana'],
  ['binladenfan',     'apología extremista'],
  ['khilafanow',      'chant pro-califato extremista'],
  ['rafidh',          'slur sectario antichií'],
];

export const arabicExactOnly = new Set([
  'kos', 'kuss', 'koss',  // muy cortos / colapsan en fonético, FP en apellidos griegos (-kos / -akos)
  'air',             // colisiona con inglés "air"
  'zob',             // muy corto
  'tiz', 'teez',
  'kalb', 'kelb',    // pueden ser nombres legítimos en algunos contextos
  'jihad',           // sólo solo
  'daesh',           // sólo solo
  'mujahid',
  'majnun',          // común también como adjetivo legítimo (loco de amor)
  'himar',           // ambiguo
  'baghil', 'baghal',// ambiguo
  'farisi',          // ambiguo (también "persa" sin sentido peyorativo)
  'sharqi',          // ambiguo (también "oriental" en sentido neutral)
  'jbal', 'jabal',   // ambiguo (también nombre propio común)
  'kafir',           // sólo solo (también palabra teológica neutral)
  'munafiq',         // sólo solo
  'najis',           // sólo solo
  'fashist',         // sólo solo
  'a3sab',           // ambiguo
]);
