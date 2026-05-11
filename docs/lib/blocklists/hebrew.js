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

  // ── Apellidos-broma: nombre hebreo transliterado + vulgaridad concatenada
  ['yossibenkalba',         '"Yossi ben kalba" → hijo de perra'],
  ['davidzayinov',          '"David Zayinov" → zayin (polla)'],
  ['avitachatcha',          '"Avi Tachatcha" → tachat (culo)'],
  ['moshemizdayen',         '"Moshe Mizdayen" → mizdayen follador'],
  ['rondkoosima',           '"Ron koos ima" → coño de mamá'],
  ['noamkoosahot',          '"Noam koos ahot" → coño hermana'],
  ['eyalbenzonah',          '"Eyal ben zonah" → hijo de puta'],
  ['shaimomzerov',          '"Shai Momzerov" → momzer bastardo'],
  ['itamarchara',           '"Itamar Chara" → chara (mierda)'],
  ['oryairmanyak',          '"Or Yair Manyak" → manyak imbécil'],
  ['guycholezayin',         '"Guy Cholezayin" → vulgar'],
  ['amitkoosit',            '"Amit Koosit" → koosit peyorativo'],
  ['liorbeizaim',           '"Lior Beizaim" → beizaim huevos'],
  ['tomerlechara',          '"Tomer lech chara" → vete a la mierda'],
  ['danimefager',           '"Dani Mefager" → mefager capacitista'],
  ['urimetumtam',           '"Uri Metumtam" → metumtam estúpido'],
  ['ofersharmuta',          '"Ofer Sharmuta" → sharmuta (puta)'],
  ['gilkusumak',            '"Gil kus umak" → coño de tu madre'],
  ['rotemnudnikov',         '"Rotem Nudnikov" → nudnik pesado yiddish'],
  ['matanshmokov',          '"Matan Shmokov" → shmok idiota yiddish'],
  ['ariefrechot',           '"Arie Frechot" → frecha peyorativo misógino'],
  ['barakshvartze',         '"Barak Shvartze" → shvartze slur racial'],
  ['gadbatzonah',           '"Gad batzonah" → ba-zonah peyorativo'],
  ['nirtipshelo',           '"Nir Tipshelo" → tipesh shelo tonto'],
  ['ranzonahben',           '"Ran ben zonah" reordenado'],
  ['amosputzim',            '"Amos Putzim" → putz yiddish idiota'],
  ['yairshigetz',           '"Yair Shigetz" → sheygets peyorativo'],
  ['eldarkooseima',         '"Eldar koos eima" → coño de mamá'],
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
