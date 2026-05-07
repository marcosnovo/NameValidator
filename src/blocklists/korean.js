// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en coreano (KO) — romaji RR
// ──────────────────────────────────────────────────────────────────────────
//
// Coreano en romaji (Revised Romanization, RR). Los visitantes coreanos
// usan tanto Hangul como romaji en formularios — cubrimos romaji.
//
// Cubrimos:
//   ▸ "욕설" (yokseol — palabrotas) más comunes
//   ▸ Slurs étnico-políticos (incluyendo el conflicto Norte/Sur)
//   ▸ Apología norcoreana extrema (Kim Il-sung-fan, Juche fanatic)

export const koreanProfanity = [
  // ── Núcleo vulgar coreano
  'shibal', 'shiba', 'sibal', 'sippal',           // 씨발 (vulgar genérico)
  'jiral', 'jirralhane',                           // 지랄 (vulgar)
  'gaesaekki', 'gaesaeki', 'gaesakki',             // 개새끼 (hijo de perro)
  'byungshin', 'byungsin', 'pyongsin',             // 병신 (capacitista, MUY ofensivo)
  'jonna', 'jonnashibal',                           // 존나 (intensificador vulgar)
  'jotgateun', 'jotgato',                           // 좆같은 (vulgar de pene)
  'jot', 'jote', 'jota',                            // 좆 (pene vulgar)
  'boji', 'bojo',                                   // 보지 (vagina vulgar)
  'gae',                                            // 개 (perro — vulgar como prefijo)
  'gaesaeki', 'gaeyungseokki',
  'nigosaeki',
  'meorigeori',
  'mannamandol',
  'sshibalnom',                                     // 씨발놈
  'siphal',
  'changnyeo',                                      // 창녀 (puta)
  'narojagi',

  // ── Slurs étnicos / políticos
  'jjokbari',                                       // 쪽발이 — slur anti-japonés
  'ttongkkae',                                      // peyorativo
  'jjajangmyeonpig', // peyorativo (chinos)
  'jjangkkae',                                      // 짱깨 — slur anti-chino
  'kimchinom',                                      // peyorativo
  'baekjong', 'baekjeong',                          // 백정 — clase social peyorativa

  // ── Apología régimen norcoreano / Kim
  'kimilsungfan',                                   // pro-régimen extremo
  'jucheist',                                       // ideología juche fanatic
  'kimjongunmanseh',                                // chant pro-régimen
  'pyongyangbomb',
];

export const koreanJokeNames = [
  ['shibalnom',         'insulto coreano vulgar'],
  ['gaesaekki',         '"hijo de perro" en coreano'],
  ['byungshin',         'slur capacitista coreano grave'],
  ['jonnashibal',       'expresión vulgar intensificada'],
  ['jotgateun',         'expresión vulgar coreana'],
  ['kimilsungfan',      'apología régimen norcoreano'],
];

export const koreanExactOnly = new Set([
  'gae',     // muy corto, ambiguo (significa "perro" pero también prefijo legítimo)
  'jot',     // muy corto
  'boji',    // ambiguo (también nombre propio raro)
  'shiba',   // demasiado corto, FP en otros idiomas
  'byung',   // ambiguo
  'jonna',   // ambiguo (también nombre propio)
  // OJO: "kim" NO se incluye aquí — incluirlo lo haría chequear como token
  //   y matchearía cualquier nombre coreano con apellido Kim.
  //   Como tampoco está en koreanProfanity, no se chequea en ninguna ruta.
]);
