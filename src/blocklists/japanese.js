// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en japonés (JA) — romaji
// ──────────────────────────────────────────────────────────────────────────
//
// Japonés en romaji (Hepburn). Los visitantes japoneses al Bernabéu suelen
// escribir su nombre así (Tanaka, Yamamoto, Suzuki…). El japonés tiene
// menos vocabulario "vulgar" puro que otros idiomas — los insultos tienden
// a ser indirectos o muy específicos del registro.
//
// Cubrimos:
//   ▸ Insultos directos (kuso, baka, aho, kisama, omae)
//   ▸ Vulgaridades sexuales (chinpo, manko, oppai en contexto vulgar)
//   ▸ Slurs étnico-políticos relevantes
//   ▸ Apología nacionalista extrema (Yasukuni-fan, Tojo-fan)
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `ja.txt`
//   ▸ Curación manual de slurs y formas vulgares 2ª persona

export const japaneseProfanity = [
  // ── Vulgaridades / insultos
  'kuso', 'kusogaki', 'kusoyarou', 'kusotare',     // クソ (mierda)
  'kusoamae', 'kusochinpo', 'kusoonna',
  'baka', 'bakayarou', 'bakatare', 'bakana', 'bakamono', // バカ (idiota — leve pero ofensivo en contexto)
  'bakkyarou', 'bakkayaro',
  'aho', 'ahotare', 'ahobon', 'ahoboke',           // アホ (idiota Kansai)
  'kisama', 'kisamara',                            // 貴様 (insulto fuerte 2ª persona)
  'tema', 'temee', 'temeerano',                    // てめえ vulgar
  'shineyo', 'shine', 'shinekuso',                 // 死ね (muere — insulto grave)
  'shinejibun', 'shinekudasai', 'shinaba',
  'shinejimaero',
  'busu', 'busunoonna',                            // ブス (mujer fea, ofensivo)
  'debu', 'debutare', 'debusuke',                  // デブ (gordo, ofensivo)
  'chibi', 'chibibu',                              // チビ (enano, despectivo)
  'chinkasu',                                      // チンカス
  'unko', 'unkochan', 'unkoman',                   // ウンコ (caca)
  'shikkoshite', 'shikkomori',
  'kichigai', 'kichigaiyaro',                      // キチガイ (loco, slur capacitista)
  'kuzu', 'kuzuyarou', 'kuzudomo',                 // クズ (basura)
  'gomi', 'gomitare', 'gomikuso',                  // ゴミ (basura, despectivo)
  'gokiburi',                                      // ゴキブリ (cucaracha como insulto)
  'yariman', 'yarimanonna',                        // ヤリマン (slut, slur misógino)
  'bicchi', 'bitchi',                              // ビッチ (préstamo del inglés vulgar)
  'kichouhen',
  'zako', 'zakoyarou',                             // 雑魚 (pez pequeño = perdedor)
  'donkusai', 'donogahara',
  'manuke', 'manukeyaro',                          // マヌケ (estúpido)
  'kasu', 'kasuyaro',                              // カス (escoria)
  'sukebe', 'sukebei',                             // スケベ (pervertido, ambiguo en contexto)
  'hentai',                                        // 変態 (pervertido) - ojo, también significa anime
  'baka-yarou', 'baka-onna',
  'damatte', 'damattenakute',                      // "cállate" vulgar
  'urusee', 'uruseebakyarou',                      // "ruidoso" vulgar
  'omeranosaa',
  'kichikuyaro',                                   // 鬼畜 (bestia humana, insulto grave)
  'donyoku',
  'shoufu', 'shoufuonna',                          // 娼婦 (prostituta — ofensivo en contexto)
  'aokan',                                         // sexo vulgar
  'kintama', 'tama',                               // testículos (ambiguo)
  'oshikko',                                       // pis vulgar
  'tamani',
  'kuneru', 'kuneru-yo',
  'shippainin',

  // ── Sexo vulgar
  'chinpo', 'chinpoko', 'chinkomato',              // チンポ (pene vulgar)
  'chinchin', 'chinkonomato',
  'manko', 'mankochan', 'omanko',                  // マンコ (vagina vulgar)
  'oma-nko', 'mankoshouri',
  'echi', 'echichi',                               // エッチ (sexual, ambiguo)
  'inran',                                         // 淫乱 (lascivo)
  'baisyun', 'baishun',                            // 売春 (prostitución)
  'baita',                                         // 売女 (puta)
  'omanj-uu',                                      // ofuscación común
  'oppai',                                         // ambiguo en contexto

  // ── Slurs étnicos / políticos
  'chankoro',                                      // 支那畜 — slur extremo anti-chino
  'kibei',                                         // peyorativo
  'kichoube',                                      // peyorativo
  'sangokujin',                                    // 三国人 — slur post-WWII
  'chosenjin', 'chousenjin',                       // 朝鮮人 — slur anti-coreano (en contexto despectivo)
  'kankokujin',                                    // ambiguo (lit. "coreano del sur")
  'gaijin',                                        // 外人 (peyorativo en contexto)
  'kikajin',                                       // 帰化人 — slur a naturalizados
  'eta', 'hinin',                                  // 穢多 / 非人 — slur clase histórica
  'burakumin',                                     // referencia controvertida si despectivo

  // ── Apología imperialista / militarista
  'yasukunifan',                                   // pro-Yasukuni controvertido
  'tojofan',                                       // pro-Tojo (criminal de guerra)
  'tenokibakami',
  'kaminokuni',                                    // 神の国 (referencia nacionalista)
  'tenno-banzai',                                  // chant nacionalista
  'kamikazefan',                                   // pro-kamikaze
  'imperialism-fan',
  'kimikgayo-only',                                // ultranacionalista
  'nankin-uso',                                    // negación masacre Nanjing

  // ── Frases compuestas
  'kusobaba', 'kusojiji',                          // "vieja/viejo de mierda"
  'shinjimae',                                     // imperativo grosero "muérete"
  'kichigaichinpo',
  'manukekuso',
  'omaeyariman',
];

export const japaneseJokeNames = [
  ['kusogaki',          'insulto vulgar japonés'],
  ['bakayarou',         'insulto japonés directo'],
  ['shineyo',           '"muérete" en japonés'],
  ['kichigai',          'slur capacitista japonés'],
  ['chinkomato',        'expresión sexual vulgar'],
  ['kusobaba',          'insulto japonés a mujer mayor'],
  ['tojofan',           'apología criminal de guerra japonés'],
  ['yariman',           'slur misógino japonés'],
  ['kichikuyaro',       'insulto grave japonés ("bestia humana")'],
  ['shinjimae',         '"muérete" imperativo grosero'],
  ['nankinuso',         'negacionismo masacre Nanjing'],
  ['chankoro',          'slur extremo anti-chino japonés'],

  // ── Apellidos-broma: apellido JP común + vulgaridad concatenada (rōmaji)
  ['tanakamanko',        '"Tanaka Manko" → マンコ vagina vulgar'],
  ['satomanko',          '"Sato Manko" → manko apellido Sato'],
  ['suzukimanko',        '"Suzuki Manko" → manko apellido Suzuki'],
  ['yamadachinpo',       '"Yamada Chinpo" → チンポ pene vulgar'],
  ['itochinpo',          '"Ito Chinpo" → chinpo pene'],
  ['yoshidachinpoko',    '"Yoshida Chinpoko" → diminutivo vulgar'],
  ['nakamurakuso',       '"Nakamura Kuso" → クソ mierda'],
  ['kobayashikusoyarou', '"Kobayashi Kuso Yarou" → cabrón de mierda'],
  ['hayashikusogaki',    '"Hayashi Kuso Gaki" → mocoso de mierda'],
  ['inoueshineyo',       '"Inoue Shineyo" → 死ね muérete vulgar'],
  ['kimurashinjimae',    '"Kimura Shinjimae" → imperativo muérete'],
  ['watanabeunko',       '"Watanabe Unko" → ウンコ caca'],
  ['hashimotokichigai',  '"Hashimoto Kichigai" → slur capacitista'],
  ['takahashikuzu',      '"Takahashi Kuzu" → クズ basura humana'],
  ['mochizukikasu',      '"Mochizuki Kasu" → カス escoria'],
  ['ohnoyariman',        '"Ohno Yariman" → slur misógino'],
  ['fujimorimanuke',     '"Fujimori Manuke" → estúpido vulgar'],
  ['saitobaita',         '"Saito Baita" → 売女 puta'],
  ['suzukibakayarou',    '"Suzuki Baka Yarou" → insulto compuesto'],
  ['katoahobon',         '"Kato Ahobon" → idiota Kansai'],
  ['naritakichikuyaro',  '"Narita Kichiku Yaro" → bestia humana'],
  ['endoubusu',          '"Endou Busu" → mujer fea vulgar'],
  ['mariodebu',          '"Mario Debu" → gordo despectivo'],
  ['kawaichinkasu',      '"Kawai Chinkasu" → smegma vulgar'],
  ['ogawaomanko',        '"Ogawa Omanko" → vagina vulgar honorífica'],
  ['saekibitchi',        '"Saeki Bitchi" → préstamo vulgar'],
  ['hondachankoro',      '"Honda Chankoro" → slur anti-chino extremo'],
  ['moriinran',          '"Mori Inran" → 淫乱 lascivo vulgar'],
  ['arashizako',         '"Arashi Zako" → 雑魚 perdedor'],
  ['kitanokintama',      '"Kitano Kintama" → testículos vulgar'],
  ['fukudashoufu',       '"Fukuda Shoufu" → 娼婦 prostituta'],
];

export const japaneseExactOnly = new Set([
  'baka',    // demasiado común, también verbo legítimo
  'aho',     // demasiado común
  'busu',    // muy corto
  'debu',    // muy corto
  'chibi',   // muy corto
  'kuso',    // muy corto, demasiados FP
  'gomi',    // muy corto
  'unko',    // muy corto
  'echi',    // ambiguo
  'tema',    // demasiado corto
  'shine',   // ambiguo (también palabra inglesa "shine")
  'kasu',    // ambiguo (apellido Kasu existe)
  'zako',    // ambiguo
  'tama',    // muy común (significa "bola" — ambiguo)
  'gaijin',  // ambiguo (común en literatura legítima)
  'oppai',   // ambiguo (frecuente en contexto neutral)
  'eta',     // ambiguo (también letra griega η = eta)
  'hinin',   // ambiguo (también significa "no humano" en contexto budista)
  'manuke',  // común en literatura
  'hentai',  // común en cultura otaku — ambiguo
  'shoufu',  // ambiguo
  'sukebe',  // ambiguo
]);
