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

export const japaneseProfanity = [
  // ── Vulgaridades / insultos
  'kuso', 'kusogaki', 'kusoyarou', 'kusotare',     // クソ (mierda)
  'baka', 'bakayarou', 'bakatare',                  // バカ (idiota — leve pero ofensivo en contexto)
  'aho', 'ahotare',                                  // アホ (idiota Kansai)
  'kisama', 'kisamara',                              // 貴様 (insulto fuerte 2ª persona)
  'tema',                                            // てめえ vulgar
  'shineyo', 'shine',                                // 死ね (muere — insulto grave)
  'shinejibun', 'shinekudasai',
  'busu',                                            // ブス (mujer fea, ofensivo)
  'debu', 'debutare',                                // デブ (gordo, ofensivo)
  'chibi',                                           // チビ (enano, despectivo)
  'chinkasu',                                        // チンカス
  'unko', 'unkochan',                                // ウンコ (caca)
  'shikkoshite',
  'kichigai',                                        // キチガイ (loco, slur capacitista)
  'kuzu', 'kuzuyarou',                               // クズ (basura)
  'gomi', 'gomitare',                                // ゴミ (basura, despectivo)
  'gokiburi',                                        // ゴキブリ (cucaracha como insulto)

  // ── Sexo vulgar
  'chinpo', 'chinpoko', 'chinkomato',                // チンポ (pene vulgar)
  'manko', 'mankochan',                              // マンコ (vagina vulgar)
  'omanko',
  'sukebei',                                         // スケベ (pervertido, ambiguo en contexto)
  'echi', 'echichi',                                 // エッチ (sexual, ambiguo)
  'inran',                                           // 淫乱 (lascivo)
  'baisyun',                                         // 売春 (prostitución)
  'baita',                                           // 売女 (puta)

  // ── Slurs étnicos / políticos
  'chankoro',                                        // 支那畜 — slur extremo anti-chino
  'kibei',                                           // peyorativo
  'kichoube',                                        // peyorativo
  'sangokujin',                                      // 三国人 — slur post-WWII

  // ── Apología imperialista / militarista
  'yasukunifan',                                     // pro-Yasukuni controvertido
  'tojofan',                                         // pro-Tojo (criminal de guerra)
  'tenokibakami',
  'kaminokuni',                                      // 神の国 (referencia nacionalista)

  // ── Frases compuestas
  'kusobaba', 'kusojiji',                            // "vieja/viejo de mierda"
  'shinjimae',                                       // imperativo grosero "muérete"
];

export const japaneseJokeNames = [
  ['kusogaki',          'insulto vulgar japonés'],
  ['bakayarou',         'insulto japonés directo'],
  ['shineyo',           '"muérete" en japonés'],
  ['kichigai',          'slur capacitista japonés'],
  ['chinkomato',        'expresión sexual vulgar'],
  ['kusobaba',          'insulto japonés a mujer mayor'],
  ['tojofan',           'apología criminal de guerra japonés'],
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
]);
