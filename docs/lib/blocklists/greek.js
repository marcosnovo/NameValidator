// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en griego (EL) — transliteradas
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "βρισιές" (insultos) griegas más comunes, slurs y expresiones
// de doble sentido. Crítico porque:
//   ▸ Bernabéu Tour recibe miles de visitantes griegos anualmente.
//   ▸ Los visitantes griegos suelen rellenar el formulario con caracteres
//     LATINOS (transliterado), no con el alfabeto griego nativo. Cubrimos
//     ambas vías:
//       - El paso `unconfuse` del normalize convierte glifos confusables
//         (α griega → a latina, ε griega → e latina) automáticamente.
//       - Esta lista en transliteración latina pilla los formularios donde
//         el visitante directamente escribió en latino.
//   ▸ Los griegos tienen "βλάκας" (vlakas), "μαλάκας" (malakas) muy
//     extendidos como insultos genéricos.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos (ya quitados por NFD).
//  - Bloqueamos como subcadena en concatNoSpaces.
//  - Tokens muy cortos / ambiguos en `greekExactOnly`.

// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `el.txt`
export const greekProfanity = [
  // ── Núcleo vulgar griego (transliteración común)
  'malakas', 'malaka', 'malakes', 'malakies',          // μαλάκας
  'malakeia', 'malakomanos', 'malakomenos',
  'vlakas', 'vlakes', 'vlakeia', 'vlakos',             // βλάκας (idiota)
  'vlakeies',
  'gamoto', 'gamisou', 'gamiseta', 'gamietai',         // γαμώτο/γαμήσου
  'gamisi', 'gamisia', 'gamiete', 'gamiseteles',
  'gamomenos', 'gamomeno', 'gamomenoi',
  'gamietai-i-mana-sou', 'gamioles', 'gamiolis',
  'archidi', 'arxidi', 'archidia', 'arxidia',          // αρχίδι (cojón)
  'puthana', 'putana', 'poutana', 'poutanes',          // πουτάνα
  'poutanaki', 'poutanakigia',
  'gaidouri', 'gaidouria',                             // γαϊδούρι (burro/bestia)
  'kerato', 'keratomanos', 'keratos', 'keratomenos',   // κέρατο (cuerno/cornudo)
  'mounis', 'mouni', 'mounaki', 'mouniari',            // vagina vulgar
  'pousthros', 'pousti', 'poustis', 'pousties',        // πούστης (slur homófobo)
  'poustres', 'poustaras', 'poustomatziki',
  'aderfos',                                           // (ambiguo — sólo en contexto homofóbico)
  'aderfismos',
  'tsoula', 'tsoules', 'tsoularas',                    // τσούλα
  'vromiari', 'vromiaria', 'vromiaridis',              // βρωμιάρης
  'kareklas',                                          // jerga vulgar
  'gamao', 'gamame', 'gameno', 'gamiseten',            // γαμώ
  'skata', 'skatosa', 'skatofatsa', 'skatofatsamas',   // σκατά (mierda)
  'skatomania', 'skatompasis',
  'kolarakis', 'kolaraki',
  'kolos', 'kolokoutsoura', 'kolotsouras',             // κώλος (culo)
  'kolopaido', 'kolopaida', 'kolofardos',
  'gomena',                                            // jerga vulgar (mujer)
  'mounotrypa',                                        // vulgar
  'kakomoiri', 'kakomoiri-mou',                        // peyorativo
  'kavlomanis', 'kavla', 'kavlas',                     // sexual vulgar
  'kavlonaikos',
  'arxidaras',
  'palioskylo', 'paliotomari',                         // peyorativo
  'paliogriaspsofa',                                   // muy vulgar
  'sklavos',                                           // peyorativo en algunos contextos
  'ravdiou',
  'klavomanikos',
  'ekeinos-pou-vromaei',
  'kotsides', 'kotsidaki',
  'mageiritsogamos',
  'kavlinos',

  // ── Slurs étnico-religiosos
  'tsigganos', 'tsigganoi',                            // slur (gitanos)
  'arvanitos', 'arvanitisas',                          // peyorativo
  'mavros', 'mavri',                                   // ambiguo: literal "negro"
  'kineisaras', 'kinezos',                             // peyorativo (chinos)
  'tourkos', 'tourkoi', 'tourkosporos',                // ambiguo, depende del contexto
  'tourkalas', 'tourkomania',                          // peyorativo más fuerte
  'ovrios', 'ovrioi', 'ovrios-okhi',                   // peyorativo (judíos)
  'bouligaroi', 'voulgaros',                           // peyorativo (búlgaros)
  'skopianos',                                         // peyorativo en disputa de Macedonia
  'fasistas',                                          // ambiguo
  'arvaniti',
  'pakistanaki',                                       // peyorativo
  'mavrouli',                                          // peyorativo

  // ── Apología extremista (nacionalismo extremo, Junta de los coroneles)
  'xrysiavgi', 'chrysiavgi', 'chrysi-avgi',            // Aurora Dorada (neonazi)
  'xa', 'thaerthi', 'thaerthi-xa',                     // chants neonazi
  'ellineixrysi', 'ellinikon-xrysi-avgi',
  'antartis',                                          // ambiguo
  'mihalolaikofan',                                    // pro-Mihaloliakos (líder XA)
  'metaxasfan',                                        // pro-régimen Metaxas
  'papadopoulosfan',                                   // pro-Junta de los coroneles
  'eokakallergi',                                      // referencia controvertida
  'enosifan',                                          // ambiguo

  // ── Frases compuestas / dobles sentidos
  'kafromounis', 'kafrohani',
  'pordi', 'porderia',                                 // πέρδω (pedo)
  'archidofatsa', 'arxidofatsa',                       // "cara de cojón"
  'putsofatsa', 'malakaki',                            // "cara de pene"
];

export const greekJokeNames = [
  ['malakasiagas',     'expresión vulgar griega muy ofensiva'],
  ['gamiseta',         'expresión sexual vulgar'],
  ['gamoto',           'expresión vulgar genérica'],
  ['poutanasou',       '"tu puta madre" en griego'],
  ['xrysiavgi',        'apología neonazi (Aurora Dorada)'],
  ['kavlonaikos',      'sexual vulgar griego'],
  ['archidofatsa',     '"cara de cojón" — insulto vulgar'],

  // ── Apellidos-broma: nombre griego + vulgaridad concatenada (transliterado)
  ['yannismalakopanas',      '"Yannis Malakopanas" → malakas + sufijo'],
  ['spyrossoumalaka',        '"Spyros sou malaka" → te eres malaka'],
  ['nikospaparxidas',        '"Nikos Paparxidas" → "arxidas" cojones jerga'],
  ['kostasgamisemana',       '"Kostas gami se mana" → te folla la madre'],
  ['dimitrispoutanasou',     '"Dimitris poutana sou" → tu puta madre'],
  ['georgiosgamietaii',      '"Georgios gamietai" → que se folle'],
  ['vasilismounopanas',      '"Vasilis Mounopanas" → mouni + sufijo'],
  ['petrosgamotomouni',      '"Petros gamoto mouni" → joder + vulva'],
  ['stavroskolotrypa',       '"Stavros Kolotrypa" → ojete (kolos+trypa)'],
  ['manolisarxidakias',      '"Manolis Arxidakias" → cojoncitos diminutivo'],
  ['thanosgamopaida',        '"Thanos gamo paida" → folla-niños grave'],
  ['michalisputsaras',       '"Michalis Putsaras" → pollón'],
  ['andreaskavlomenos',      '"Andreas Kavlomenos" → cachondo vulgar'],
  ['lefterismalakomouri',    '"Lefteris malako mouri" → cara de malaka'],
  ['stelioschestikamou',     '"Stelios chestika mou" → me cagué vulgar'],
  ['takisskatofatsas',       '"Takis Skatofatsas" → cara de mierda'],
  ['pavlosgamiesaiblaka',    '"Pavlos gamiesai vlaka" → "te follan idiota"'],
  ['kyriakospoustaki',       '"Kyriakos Poustaki" → diminutivo de puto'],
  ['fotisarxidofagos',       '"Fotis Arxidofagos" → comecojones'],
  ['nikolaosgamopapas',      '"Nikolaos gamo papas" → folla-cura blasfemo'],
  ['christosgamosouto',      '"Christos gamo souto" → vulgar con Cristo'],
  ['ioannisxesemepano',      '"Ioannis xese me pano" → cágate encima'],
  ['vangelistsoulopanas',    '"Vangelis Tsoulopanas" → "tsoula" puta'],
  ['sotirismouniaras',       '"Sotiris Mouniaras" → grandote del mouni'],
  ['haralampospoutsomanos',  '"Haralampos Poutsomanos" → vulgar con poutso'],
  ['theodorosgamietai',      '"Theodoros gamietai" → que le follen'],
  ['panagiotisgamopanagia',  '"Panagiotis gamo Panagia" → blasfemia (Virgen)'],
];

export const greekExactOnly = new Set([
  'mavros',     // literal "negro" — muy ambiguo en español/inglés
  'tourkos',    // demasiado ambiguo
  'aderfos',    // significa "hermano" — sólo solo en contexto homófobo
  'antartis',   // ambiguo (también guerrilla)
  'fasistas',
  'xa',         // demasiado corto
  'gamao',      // demasiado corto/ambiguo
  'pordi',
  'mouni',
  'kolos',      // existe como apellido raro
]);
