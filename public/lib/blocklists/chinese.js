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
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/viddexa/safetext (MIT)
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `zh.txt`

export const chineseProfanity = [
  // ── Núcleo vulgar mandarín
  'cao',  // 操 (no es siempre vulgar — sólo solo)
  'caonima', 'caonimade', 'caonimama',             // 操你妈 — "follar a tu madre"
  'caonidemama', 'caoniba',
  'ganni', 'gannima', 'gannimade',                 // 干你妈 — variante
  'gannilaomu', 'gannidemama',
  'tamade', 'tamadebi', 'tamadeshenjingbing',      // 他妈的 — vulgar genérico
  'tamabi', 'tama',
  'zhinanmen',
  'shabi', 'shabide', 'shabichaodi',               // 傻屄 — slur misógino fuerte
  'shabidaheng',
  'biaozi', 'biaoziyangde', 'jiaobiaozi',          // 婊子 — puta
  'jianhuo', 'jianren', 'jianbi',                  // 贱货 / 贱人 — vulgar
  'haoji', 'haojividaodai',
  'sibichaodi',
  'wangbadan', 'wangbazhongzi',                    // 王八蛋 — bastardo (lit. huevo de tortuga)
  'wangbatao',
  'pigu', 'pigutoupin', 'pigudangzhang',           // 屁股 — culo (a veces vulgar)
  'jiba', 'jibadai',                               // 鸡巴 — pene vulgar
  'jibawan', 'jibadexin',
  'diao', 'diaoji', 'diaomao',                     // 屌 — pene vulgar
  'diaosi', 'diaoyangzi',
  'ridao', 'ridaole',
  'manbide', 'manbi',
  'shenjingbing', 'shenjingbingwa',                // 神经病 — "enfermo mental"
  'biaqu',
  'gaoji', 'gaobile',
  'gunne', 'gunkai',                               // "vete a la mierda" vulgar
  'shabai', 'shaguo', 'shaguazi',                  // tonto vulgar
  'bendan', 'bendanguo',                           // 笨蛋 idiota
  'erbi', 'erbao',                                 // 二屄 idiota grosero
  'baichi', 'baichihan',                           // 白痴 imbécil
  'sile',                                          // "muérete" vulgar
  'qunimade', 'qunidegnima', 'qunimadebi',         // 去你妈的 — vulgar
  'wonimade', 'wonidemama',                        // variante
  'cnm', 'tmd', 'wbd',                             // abreviaturas comunes en chats
  'naimaode',
  'huaidan', 'huaidanxinyou',                      // 坏蛋 (mala persona, peyorativo)
  'goupi', 'goupinde',                             // 狗屁 (mierda de perro)
  'goutou', 'gourisi',                             // 狗头 vulgar
  'damabide',                                      // grave
  'sibu', 'sibulu', 'sibulai',
  'dabian', 'dabianla',                            // mierda (vulgar)
  'shadiao', 'shibi',
  'ganshenme',
  'erhuozi',                                       // peyorativo
  'lajigui',                                       // 垃圾鬼 "fantasma de basura"
  'piruncanji',
  'bushizhonggou',                                 // ofensivo (lit. "no es chino")

  // ── Slurs étnicos / políticos
  'zhinaman', 'zhina',                             // 支那 — slur racista pre-WWII para chinos (irónicamente usado)
  'gunzi',                                         // peyorativo
  'taiwandulei',                                   // pro-independencia agresiva (ambiguo)
  'gaolizibang',                                   // peyorativo anti-coreano
  'xiaoribenzi', 'wokouzhang',                     // peyorativo anti-japonés
  'bangzi',                                        // peyorativo anti-coreano
  'aliebabachegao',
  'xiongdiminzu',                                  // peyorativo (depende del contexto)

  // ── Apología totalitaria
  'maogesang',                                     // referencia a Mao Zedong de forma chant
  'taishijunzhuxi',
  'tiananmenzhihua',
  'maozhuxiwannian',                               // chant pro-Mao
  'wenhuagemingfan',                               // pro-Revolución Cultural
  'jingmingrendaozai',                             // referencia controvertida
  'sigangqilaobaba',

  // ── Frases compuestas
  'shabichaodi', 'caonimazongma',
  'ganyaobile',
  'qunidemama',
  'tamadeniubi', 'niubishabi',
];

export const chineseJokeNames = [
  ['caonima',           'expresión sexual china a la madre'],
  ['caonimade',         'variante vulgar mandarín'],
  ['gannima',           '"follar a tu madre" en mandarín'],
  ['shabichaodi',       'insulto misógino fuerte'],
  ['wangbadan',         '"hijo de tortuga" — insulto vulgar'],
  ['tamadeshenjingbing','expresión vulgar compuesta'],
  ['qunimadebi',        'expresión vulgar mandarín'],
  ['shenjingbing',      '"enfermo mental" — slur capacitista'],
  ['maozhuxiwannian',   'apología pro-Mao Zedong'],
  ['xiaoribenzi',       'slur peyorativo anti-japonés'],

  // ── Apellidos-broma: apellido CN común + vulgaridad concatenada (pinyin)
  ['wangcaonima',        '"Wang Cao Ni Ma" → 操你妈 follar a tu madre'],
  ['licaonima',          '"Li Cao Ni Ma" → variante apellido Li'],
  ['zhangcaonima',       '"Zhang Cao Ni Ma" → variante apellido Zhang'],
  ['chencaonima',        '"Chen Cao Ni Ma" → variante apellido Chen'],
  ['liushabide',         '"Liu Sha Bi De" → contiene shabi 傻屄'],
  ['wangshabi',          '"Wang Sha Bi" → Wang tonto del culo'],
  ['chenshabi',          '"Chen Sha Bi" → variante apellido Chen'],
  ['lishabide',          '"Li Sha Bi De" → shabi de reforzado'],
  ['zhaoshabi',          '"Zhao Sha Bi" → shabi apellido Zhao'],
  ['linjiba',            '"Lin Ji Ba" → 鸡巴 pene vulgar'],
  ['hejiba',             '"He Ji Ba" → jiba pene vulgar'],
  ['zhoujiba',           '"Zhou Ji Ba" → jiba pene vulgar'],
  ['wutamade',           '"Wu Ta Ma De" → tamade 他妈的 joder vulgar'],
  ['zhengtamabi',        '"Zheng Ta Ma Bi" → tamabi vulgar'],
  ['xutamade',           '"Xu Ta Ma De" → tamade vulgar'],
  ['mangannima',         '"Ma Gan Ni Ma" → 干你妈 follar a tu madre'],
  ['fengannima',         '"Feng Gan Ni Ma" → gannima variante'],
  ['gaogannilaomu',      '"Gao Gan Ni Lao Mu" → follar a tu vieja madre'],
  ['huwangbadan',        '"Hu Wang Ba Dan" → huevo de tortuga / bastardo'],
  ['liwangbadan',        '"Li Wang Ba Dan" → wangbadan apellido Li'],
  ['susabichaodi',       '"Su Sha Bi Chao Di" → shabi reforzado'],
  ['dongdiaomao',        '"Dong Diao Mao" → 屌毛 pelo de polla'],
  ['fudiaosi',           '"Fu Diao Si" → diaosi perdedor'],
  ['guomanbi',           '"Guo Man Bi" → manbi vulgar vagina'],
  ['shenqunimade',       '"Shen Qu Ni Ma De" → vete a la mierda de tu madre'],
  ['yangoupi',           '"Yan Gou Pi" → 狗屁 mierda de perro'],
  ['baigourisi',         '"Bai Gou Ri Si" → vulgar canino'],
  ['ougunimade',         '"Ou Gu Ni Ma De" → qunimade variante'],
  ['huerbi',             '"Hu Er Bi" → 二屄 idiota grosero'],
  ['kongbaichi',         '"Kong Bai Chi" → 白痴 imbécil'],
];

export const chineseExactOnly = new Set([
  'cao',     // muy corto, ambiguo (apellido 曹 Cao existe)
  'pigu',    // ambiguo
  'diao',    // muy corto, también apellido raro
  'jiba',    // muy corto
  'zhina',   // ambiguo
  'gunzi',
  'tama',    // demasiado corto, parte de "tamade"
  'shibi',   // muy corto (también nombre propio raro)
  'sile',    // muy corto, FP fácil
  'cnm', 'tmd', 'wbd',  // abreviaturas — sólo cuando solas
  'shadiao', // ambiguo
  'huaidan', // ambiguo en algunos contextos
  'baichi',  // común
  'bangzi',  // muy corto, también significa "palo" legítimo
  'goutou',  // ambiguo
]);
