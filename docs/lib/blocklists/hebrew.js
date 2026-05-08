// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en hebreo (HE) — transliterado
// ──────────────────────────────────────────────────────────────────────────
//
// Hebreo en transliteración latina. Los visitantes israelíes/judíos al
// Bernabéu usan habitualmente esta forma en formularios occidentales.
// El paso unconfuse y stripDiacritics ya neutralizan otros formatos.
//
// IMPORTANTE: NO bloqueamos nombres religiosos hebreos legítimos
// (David, Daniel, Sara, Miriam, Yosef…) ni palabras como "shalom" /
// "todah". Sólo profanidad clara.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `he.txt`
//   ▸ Curación manual con referencia al slang yiddish en hebreo moderno

export const hebrewProfanity = [
  // ── Vulgar (no muy extendido en hebreo, hay menos vocabulario obsceno
  //    nativo; gran parte del slang viene de yiddish y árabe)
  'kus', 'koos', 'kuss',           // כוס (vulgar para vagina, transliterado)
  'kusemek', 'kusochotcha',         // "el coño de tu madre" / hermana (vulgar levantino)
  'kusumek', 'kusumak',
  'zayin', 'zionrim',               // זין (pene vulgar)
  'mizdayen', 'mizdayenet',         // verbo vulgar (follador/a)
  'tachat', 'tachatcha',            // תחת (culo, vulgar en algunos contextos)
  'manyak', 'manyaq', 'manyakeem',  // del árabe — "imbécil" / "loco"
  'nudnik',                         // del yiddish — pesado
  'shmuck', 'shmok',                // del yiddish — idiota / pene
  'putz', 'putzim',                 // del yiddish — idiota / pene
  'momzer', 'momzerim',             // bastardo (yiddish)
  'gornisht',                       // "nada" peyorativo
  'shvitzer',                       // mentiroso/farolero
  'goy', 'goyim',                   // ambiguo en contexto antisemita inverso
  'shiksa', 'shiksas',              // peyorativo (no-judía)
  'sheygets',                       // peyorativo (no-judío masculino)
  'kapo', 'kapot',                  // colaboracionista — uso muy ofensivo
  'benzona', 'benzonot',            // hijo de puta
  'batzonah', 'batzona',            // peyorativo (mujer)
  'lechara',                        // "vete a la mierda"
  'choletzayin', 'cholezayin',      // expresión vulgar
  'tipesh', 'tipsha',               // tonto
  'metumtam', 'metumtamim',         // capacitista
  'mefager',                        // capacitista grave
  'chara',                          // "mierda"
  'charayot',                       // "mierdas"
  'lechakelhakelev',                // expresión vulgar "lamer al perro"
  'koos-ima', 'koos-ahot',          // variantes
  'sharmuta',                       // del árabe — puta
  'zonah', 'zonot',                 // puta
  'beelat',                         // peyorativo
  'lemamzeret',
  'efes',                           // "cero" como insulto (mild)
  'koosit',                         // peyorativo
  // 'pot' eliminado — colisiona con "Pol Pot" (figura histórica) y demás
  'beizaim',                        // testículos vulgares
  'mizraknek',
  'achshavanit',
  'gilui-arayot',                   // referencia incestual ofensiva

  // ── Slurs / apología
  'kahanist', 'kahanee',            // referencia a Meir Kahane (extremismo)
  'lehibatla',
  'antisemit', 'antishemit',        // ambiguo, depende del uso
  'shvartze',                       // slur racial yiddish
  'arsim',                          // peyorativo socioeconómico
  'frecha', 'frechot',              // peyorativo misógino
  'mizrachi-frecha',                // slur socio-étnico
  'ashkenazi-arrogant',
  'kushi',                          // slur racial (lit. "etíope" usado peyorativamente)
  'yefehnefesh',                    // ambiguo (peyorativo político)
  'haredi-fanatic',                 // peyorativo religioso interno
  'meshumad',                       // converso (peyorativo)
  'amalek-fan',                     // referencia bíblica usada como apología
  'transfer-now',                   // referencia política extremista
  'kachfan', 'kahanefan',
  'meir-kahane-fan',                // pro-extremista
  'baruch-goldstein-fan',           // apología terrorismo
];

export const hebrewJokeNames = [
  ['kusachoteh',       'expresión vulgar hebrea'],
  ['benzona',          '"hijo de puta" en hebreo (literalmente "hijo de prostituta")'],
  ['kapostia',         'término muy ofensivo (colaboracionista nazi)'],
  ['kusemek',          'insulto sexual a la madre (mezcla árabe-hebreo)'],
  ['mizdayen',         'expresión vulgar hebrea'],
  ['baruchgoldsteinfan', 'apología terrorista'],
  ['meirkahanefan',    'apología extremista'],
  ['amalekfan',        'apología bíblica violenta'],
];

export const hebrewExactOnly = new Set([
  'kus',       // muy corto, también puede ser apellido/nombre raro
  'zayin',
  'goy',
  'goyim',
  'shiksa',
  'putz',      // muy común en jerga inglesa-yiddish
  'shmuck',
  'efes',      // ambiguo (también significa "cero")
  'chara',     // común también en árabe — gestionado allí
  'kushi',     // también nombre propio raro
  'kapo',      // muy corto, riesgo FP
  'arsim',     // ambiguo
  'goy',
  'tipesh',    // común
  'frecha',    // ambiguo
]);
