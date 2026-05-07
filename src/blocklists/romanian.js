// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en rumano (RO)
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "înjurături" (palabrotas) rumanas más comunes y slurs.
// Rumanía es uno de los principales países emisores de turistas al
// Bernabéu — comunidad muy grande en España, también.
//
// El rumano usa alfabeto latino con diacríticos (ă, î, â, ș, ț). Tras
// stripDiacritics quedan en latino simple. Cubrimos también las variantes
// sin diacríticos que escriben los usuarios.

export const romanianProfanity = [
  // ── Núcleo vulgar rumano
  'pulă', 'pula', 'pulei', 'pulamea',                    // pene
  'pizdă', 'pizda', 'pizdele', 'pizduit',                // vagina vulgar
  'futai', 'fute', 'futui', 'futere',                    // follar
  'futui-mama-ta', 'futuima', 'futumata',                // insulto a la madre
  'sugi', 'sugipula', 'sugislpula',                      // chupa-pene
  'cur', 'curu', 'curul', 'curit',                       // culo
  'rahat', 'rahaturi',                                    // mierda
  'caca', 'cacat', 'cacatul',                             // mierda/cagar
  'curva', 'curve', 'curvarie',                           // puta
  'tarfa', 'tarfa', 'tarfei',                             // puta
  'futicariera',
  'pulicaru',
  'borfas', 'borfaș',                                     // ladrón
  'jegos', 'jegoasa',                                     // sucio (insulto)
  'idiot', 'idiotule',                                    // idiota
  'prost', 'proasta', 'prostule', 'prostănac',           // tonto
  'imbecil', 'imbecila',
  'tampit', 'tampita',                                    // estúpido
  'nesimtit', 'nesimțit',                                 // sinvergüenza
  'manelist',                                             // peyorativo cultural
  'mustaceanu',
  'pizdeala',
  'mortuti', 'mortutii',                                  // "muertos tuyos"
  'durerea-ma',
  'in-pizda-ma-ta', 'inpizdamatii',
  'mortiitai',

  // ── Slurs étnicos
  'tigan', 'țigan', 'tigani', 'tiganii',                  // slur (gitanos) — extendidísimo en RO
  'tiganca', 'țiganca',
  'jidan', 'jidani',                                      // slur antisemita
  'bozgor', 'bozgori',                                    // slur antihúngaro
  'bulai',
  'cioara',                                               // slur racial (cuervo)

  // ── Apología extremista (Legionarios, Iron Guard)
  'legionari', 'legionar',                                // Iron Guard fascist (puede ser ambiguo)
  'codreanu-fan',
  'antonescu-fan',                                        // pro-dictador
  'mortcomu',                                             // anti-comunismo extremo (raro)
];

export const romanianJokeNames = [
  ['futuimata',        'insulto sexual rumano a la madre'],
  ['fututimama',       'insulto sexual rumano'],
  ['sugipula',         '"chupa pene" en rumano'],
  ['mortuti',          'maldición rumana sobre los muertos'],
  ['inpizdamamatii',   'insulto vulgar rumano'],
  ['curvabatrana',     'insulto rumano'],
  ['mancarahat',       'expresión vulgar'],
];

export const romanianExactOnly = new Set([
  'pula',     // muy corto, ambiguo (existe como apellido en algunos países)
  'caca',     // muy corto
  'cur',      // muy corto, demasiados FP
  'cioara',   // ambiguo (apellido también)
  'tigan',    // gentilicio
  'jidan',    // muy específico
  'bozgor',
  'rahat',
  'idiot',    // demasiado común en otros idiomas
  'imbecil',
  'prost',    // común en eslavo
]);
