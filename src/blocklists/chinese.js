// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en chino mandarín (ZH) — Pinyin
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "脏话" (zānghuà — palabrotas) chinas más comunes en
// transliteración Pinyin (con o sin tonos), que es como los chinos suelen
// escribir su nombre con caracteres latinos en formularios occidentales.
//
// Importante:
//   ▸ El paso `unconfuse` ya convierte caracteres confusables.
//   ▸ Esta lista trabaja sobre Pinyin (latín). Los caracteres chinos
//     directos (汉字) son raros en formularios de stadium ticketing, pero
//     si un visitante los pega, NFD los normaliza a su forma canónica y
//     no matchearemos — habría que añadir una capa específica para Hanzi
//     en el futuro.
//
// Tonos:
//   - El Pinyin a veces lleva tonos (mā, má, mǎ, mà). stripDiacritics los
//     elimina, así que aquí escribimos sin ellos (forma "ma").
//   - Algunos visitantes pegan números para indicar tono (ma1, ma3).
//     Esos números los recoge `lettersOnly` filtrando dígitos.

export const chineseProfanity = [
  // ── Núcleo vulgar mandarín
  'cao',  // 操 (no es siempre vulgar — sólo solo)
  'caonima', 'caonimade',          // 操你妈 — "follar a tu madre"
  'ganni', 'gannima', 'gannimade', // 干你妈 — variante
  'tamade', 'tamadebi',            // 他妈的 — vulgar genérico
  'zhinanmen',
  'shabi', 'shabide',              // 傻屄 — slur misógino fuerte
  'biaozi', 'biaoziyangde',        // 婊子 — puta
  'jianhuo', 'jianren',            // 贱货 / 贱人 — vulgar
  'haoji', 'haojividaodai',
  'sibichaodi',
  'wangbadan',                     // 王八蛋 — bastardo (lit. huevo de tortuga)
  'pigu', 'pigutoupin',            // 屁股 — culo (a veces vulgar)
  'jiba', 'jibadai',               // 鸡巴 — pene vulgar
  'diao', 'diaoji', 'diaomao',     // 屌 — pene vulgar
  'ridao', 'ridaole',
  'manbide', 'manbi',
  'shenjingbing',                  // 神经病 — "enfermo mental"
  'biaqu',
  'gaoji', 'gaobile',

  // ── Slurs étnicos / políticos
  'zhinaman', 'zhina',             // 支那 — slur racista pre-WWII para chinos (irónicamente usado)
  'gunzi',                         // peyorativo
  'taiwandulei',                   // pro-independencia agresiva (ambiguo)

  // ── Apología totalitaria
  'maogesang',                     // referencia a Mao Zedong de forma chant
  'taishijunzhuxi',
  'tiananmenzhihua',

  // ── Frases compuestas
  'shabichaodi', 'caonimazongma',
  'wonimade',
  'ganyaobile',
  'qunidemama',
];

export const chineseJokeNames = [
  ['caonima',          'expresión sexual china a la madre'],
  ['caonimade',        'variante vulgar mandarín'],
  ['gannima',          '"follar a tu madre" en mandarín'],
  ['shabichaodi',      'insulto misógino fuerte'],
  ['wangbadan',        '"hijo de tortuga" — insulto vulgar'],
  ['tamadeshenjingbing', 'expresión vulgar compuesta'],
];

export const chineseExactOnly = new Set([
  'cao',     // muy corto, ambiguo (apellido 曹 Cao existe)
  'pigu',    // ambiguo
  'diao',    // muy corto
  'jiba',    // muy corto
  'zhina',   // ambiguo
  'gunzi',
  'tama',    // demasiado corto, parte de "tamade"
]);
