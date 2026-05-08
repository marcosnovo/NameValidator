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
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/Tanat05/korean-profanity-resources (MIT)
//   ▸ github.com/doublems/korean-bad-words (MIT)
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `ko.txt`

export const koreanProfanity = [
  // ── Núcleo vulgar coreano
  'shibal', 'shiba', 'sibal', 'sippal', 'siphal',  // 씨발 (vulgar genérico)
  'sibalnom', 'sshibalnom', 'sibaryeon', 'sibalsekki',
  'jiral', 'jirralhane', 'jirarhanda',             // 지랄 (vulgar)
  'gaesaekki', 'gaesaeki', 'gaesakki',             // 개새끼 (hijo de perro)
  'gaeseki', 'gaeseki-ya', 'gaeyungseokki',
  'nigosaeki',
  'gaejabnyeon', 'gaejapnyeon',                    // peyorativo grave
  'horosaekki',                                    // 호로새끼 (hijo de bastardo)
  'gaegateun', 'gaegateunnom',                     // "como un perro"
  'byungshin', 'byungsin', 'pyongsin', 'byungsina', // 병신 (capacitista, MUY ofensivo)
  'byungsinnom',
  'jonna', 'jonnashibal', 'jonnah', 'jonnaba',     // 존나 (intensificador vulgar)
  'jotgateun', 'jotgato', 'jotgateunnom',          // 좆같은 (vulgar de pene)
  'jot', 'jote', 'jota', 'jotka',                  // 좆 (pene vulgar)
  'jotgachi',
  'boji', 'bojo', 'bojippal',                      // 보지 (vagina vulgar)
  'bobbal', 'bopalli',                             // peyorativo sexual
  'gae', 'gaesaeggi',                              // 개 (perro — vulgar como prefijo)
  'meorigeori',
  'mannamandol',
  'changnyeo', 'changnyeoga',                      // 창녀 (puta)
  'narojagi',
  'michinnom', 'michinyeon', 'michingeon',         // 미친 (loco/a — vulgar)
  'michinsaekki',
  'nigochi', 'nideo',                              // formas vulgares
  'deungsin', 'deungsina',                         // 등신 (idiota — capacitista)
  'ttorai', 'ttoraii', 'ddorai',                   // 또라이 (loco vulgar)
  'sseuregi',                                      // 쓰레기 (basura — insulto)
  'yangachi',                                      // 양아치 (vándalo / despectivo)
  'gaesori', 'gaeppul',
  'banghwangja',                                   // ofensivo
  'pyeoneejil', 'pyeoneeggi',
  'ttalttali', 'ttalttalliya',                     // 딸딸이 (sexual vulgar)
  'gangkangja',                                    // peyorativo
  'jeongmal',
  'baboya', 'babonom',                             // 바보 (tonto, mild → moderate)
  'meongchungi',                                   // 멍청이 (estúpido)
  'momhamsibalnom',
  'hwajangshil',                                   // ambiguo
  'satgat',                                        // ambiguo
  'gaesori-ya', 'gaeppulnom',
  'doraennom',                                     // peyorativo
  'narotokki',
  'sibyangchu',
  'mansaeknyeom',
  'jjijinda',                                      // peyorativo

  // ── Slurs étnicos / políticos
  'jjokbari',                                      // 쪽발이 — slur anti-japonés
  'ttongkkae',                                     // peyorativo
  'jjajangmyeonpig',                               // peyorativo (chinos)
  'jjangkkae', 'jjangkkae-saekki',                 // 짱깨 — slur anti-chino
  'kimchinom',                                     // peyorativo
  'baekjong', 'baekjeong',                         // 백정 — clase social peyorativa
  'kkangtong',                                     // slur anti-coreanos del norte
  'binmin',                                        // peyorativo socioeconómico
  'megookkugaengi',                                // slur anti-americano vulgar
  'wenom', 'waenom',                               // slur anti-japonés histórico

  // ── Apología régimen norcoreano / Kim
  'kimilsungfan',                                  // pro-régimen extremo
  'jucheist',                                      // ideología juche fanatic
  'kimjongunmanseh',                               // chant pro-régimen
  'pyongyangbomb',
  'kimssiilga',                                    // 김씨일가 (dinastía Kim — pro-régimen)
  'jongildaewangmanse',
  'sahoejuui',                                     // ambiguo (socialismo) — exact only
];

export const koreanJokeNames = [
  ['shibalnom',         'insulto coreano vulgar'],
  ['gaesaekki',         '"hijo de perro" en coreano'],
  ['byungshin',         'slur capacitista coreano grave'],
  ['jonnashibal',       'expresión vulgar intensificada'],
  ['jotgateun',         'expresión vulgar coreana'],
  ['kimilsungfan',      'apología régimen norcoreano'],
  ['horosaekki',        'insulto coreano grave'],
  ['michinsaekki',      '"hijo de perra loco/a"'],
  ['kimssiilga',        'apología dinastía Kim norcoreana'],
  ['jjokbari',          'slur anti-japonés histórico'],
  ['jjangkkaesaekki',   'slur anti-chino vulgar'],
  ['waenom',            'slur anti-japonés histórico'],
];

export const koreanExactOnly = new Set([
  'gae',     // muy corto, ambiguo (significa "perro" pero también prefijo legítimo)
  'jot',     // muy corto
  'boji',    // ambiguo (también nombre propio raro)
  'shiba',   // demasiado corto, FP en otros idiomas
  'byung',   // ambiguo
  'jonna',   // ambiguo (también nombre propio)
  'babo',    // demasiado común (bebé/Babo apellido también)
  'jeongmal',// "muy" — palabra legítima
  'jote',    // muy corto
  'binmin',  // ambiguo
  'satgat',  // ambiguo (también significa "sombrero tradicional")
  // OJO: "kim" NO se incluye aquí — incluirlo lo haría chequear como token
  //   y matchearía cualquier nombre coreano con apellido Kim.
  //   Como tampoco está en koreanProfanity, no se chequea en ninguna ruta.
]);
