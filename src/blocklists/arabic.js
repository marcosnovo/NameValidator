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

export const arabicProfanity = [
  // ── Núcleo vulgar árabe (transliteración común)
  'kuss', 'koss', 'kos', 'kosh', 'kossok', 'kosokhat',  // كس (vagina vulgar)
  'kosomak', 'kosumak', 'kosomk', 'kosumk',             // "el coño de tu madre"
  'kosokhatak',
  'zob', 'zobr', 'zobri', 'azzeb',                      // pene vulgar
  'air', 'ayri',                                        // pene vulgar (otra raíz)
  'tiz', 'teez', 'teezak',                              // culo
  'taht', 'tahtek',
  'sharmoot', 'sharmuta', 'charmouta', 'sharmoota',     // puta
  'sharmootik', 'sharmoutik',
  'kahba', 'kahbah', 'qahba', 'qahbeh',                 // puta
  'manyak', 'manyek',                                   // perdedor / vulgar
  'ahbal', 'ehbal', 'ahbel',                            // imbécil
  'gahba',                                              // variante
  'zibik', 'zib',                                       // pene
  'hayawan', 'hayawen', 'hayawana',                     // "animal" como insulto
  'zubri',
  'kalb', 'kelb', 'kalbi', 'kelbi',                     // perro como insulto
  'ibnelkalb', 'ibnalkalb', 'ibnkalb',                  // "hijo de perro"
  'ibnelhaha',                                          // insulto madre (vulgar)
  'ibnelqahba', 'ibnelkahba',                           // "hijo de puta"
  'ibnelharam', 'ibnharam',                             // "hijo del haram"
  'allayl3anak', 'allay3nak',                           // "que Dios te maldiga" (ofensivo)
  'kafir',                                              // "infiel" — usado como insulto
  'munafiq', 'munafiqun',                               // "hipócrita" — usado como insulto religioso
  'najis',                                              // "impuro" — usado como insulto

  // ── Slurs étnico-religiosos
  'yahudi', 'yehudi',                                   // ambiguo: "judío" (puede ser legítimo o slur)
  'sharqi',
  'bilamithl',
  'kuffar',                                             // plural infieles — extremista
  'zionist', 'sahyuni',                                 // dependiendo del uso

  // ── Apología extremista
  'daesh',                                              // ISIS — apología
  'jihad',                                              // ambiguo — sólo en contexto solo
  'almawtllamerica',
  'almawtllaisrael',
  'mujahid',                                            // ambiguo
];

export const arabicJokeNames = [
  ['kosomak',         'insulto árabe a la madre'],
  ['ibnelqahba',      '"hijo de puta" en árabe'],
  ['sharmootabint',   'insulto árabe vulgar'],
  ['allayl3anak',     'maldición religiosa árabe usada como insulto'],
  ['ibnelkalb',       '"hijo de perro" — insulto árabe'],
  ['daeshfanboy',     'apología ISIS'],
  ['jihadist',        'apología extremista'],
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
]);
