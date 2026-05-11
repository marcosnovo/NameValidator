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
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `ro.txt`

export const romanianProfanity = [
  // ── Núcleo vulgar rumano
  'pulă', 'pula', 'pulei', 'pulamea',                    // pene
  'pulagiu', 'pulamentar', 'pulardi',
  'pulinaite',
  'pizdă', 'pizda', 'pizdele', 'pizduit',                // vagina vulgar
  'pizdoasă', 'pizdoasa', 'pizdărit',
  'futai', 'fute', 'futui', 'futere',                    // follar
  'futui-mama-ta', 'futuima', 'futumata', 'futuiti',
  'futeti', 'futerea', 'futalumea',
  'sugi', 'sugipula', 'sugislpula', 'sugibula',          // chupa-pene
  'sugiconservator',
  'cur', 'curu', 'curul', 'curit',                       // culo
  'curacios', 'curlinge',
  'rahat', 'rahaturi', 'rahatos',                        // mierda
  'caca', 'cacat', 'cacatul',                             // mierda/cagar
  'cacaiosul', 'cacaiosi',
  'curva', 'curve', 'curvarie', 'curvasara',             // puta
  'curvitate', 'curvasdraciei',
  'tarfa', 'tarfei', 'tarfute',                          // puta
  'futicariera',
  'pulicaru',
  'borfas', 'borfaș',                                    // ladrón
  'jegos', 'jegoasa', 'jegosul',                         // sucio (insulto)
  'idiot', 'idiotule', 'idioata',                        // idiota
  'prost', 'proasta', 'prostule', 'prostănac', 'prostie',// tonto
  'imbecil', 'imbecila', 'imbecilul',
  'tampit', 'tampita', 'tampitule',                      // estúpido
  'tâmpit', 'tâmpita',
  'nesimtit', 'nesimțit', 'nesimtitule',                 // sinvergüenza
  'manelist', 'manelistul',                              // peyorativo cultural
  'mustaceanu',
  'pizdeala',
  'mortuti', 'mortutii', 'mortcomu',                     // "muertos tuyos"
  'durerea-ma',
  'in-pizda-ma-ta', 'inpizdamatii', 'inpizdamamatii',
  'mortiitai',
  'mananca-rahat', 'mancarahat',
  'paraiu',
  'porc', 'porcule', 'porcari',                          // cerdo (insulto)
  'oligofren', 'oligofrenule',                           // capacitista
  'retardat', 'retardata',                               // capacitista
  'mongol',                                              // capacitista
  'gunoi', 'gunoiule',                                   // basura (insulto)
  'parazit', 'parazita',                                 // parásito
  'lichea', 'licheaua',                                  // peyorativo
  'pidigos',
  'la-mama-naibii',
  'paraschiva',
  'matra', 'matrahaiala',
  'cretin', 'cretina', 'cretinule',
  'jiganul',
  'cocalar', 'cocalari',                                 // peyorativo cultural
  'cocota', 'cocotă', 'cocote',                          // amante / mantenida (peyorativo)
  'fofoloanca',
  'pohoste',

  // ── Slurs étnicos
  'tigan', 'țigan', 'tigani', 'tiganii',                 // slur (gitanos) — extendidísimo en RO
  'tiganca', 'țiganca', 'tiganesti',
  'jidan', 'jidani', 'jidovan',                          // slur antisemita
  'bozgor', 'bozgori', 'bozgorul',                       // slur antihúngaro
  'bulai',
  'cioara', 'ciori',                                     // slur racial (cuervo)
  'rusan',                                               // peyorativo
  'turcalete',                                           // peyorativo

  // ── Apología extremista (Legionarios, Iron Guard)
  'legionari', 'legionar', 'legionarismul',              // Iron Guard fascist (puede ser ambiguo)
  'codreanu-fan',
  'antonescu-fan',                                       // pro-dictador
  'antonescu-erou',                                      // pro-Antonescu
  'corneliu-codreanu',                                   // referencia controvertida
  'gardadefier',                                         // Iron Guard
  'simionsoru',                                          // referencia política controvertida
  'kkkfan',                                              // referencia ultranacionalista
];

export const romanianJokeNames = [
  ['futuimata',        'insulto sexual rumano a la madre'],
  ['fututimama',       'insulto sexual rumano'],
  ['sugipula',         '"chupa pene" en rumano'],
  ['mortuti',          'maldición rumana sobre los muertos'],
  ['inpizdamamatii',   'insulto vulgar rumano'],
  ['curvabatrana',     'insulto rumano'],
  ['mancarahat',       'expresión vulgar'],
  ['antonescuerou',    'apología dictador rumano'],
  ['gardadefier',      'apología Iron Guard fascista'],
  ['cocalar',          'peyorativo cultural rumano'],

  // ── Apellidos-broma: nombre rumano + vulgaridad concatenada
  ['ionmuieta',             '"Ion, muie ta" → mamada tuya'],
  ['mariamuiepula',         '"Maria muie pula" → vulgar muie+pula'],
  ['andreipizdamatii',      '"Andrei, pizda matii" → el coño de tu madre'],
  ['vasiledamipula',        '"Vasile, dă-mi pula" → dame la polla'],
  ['mihaisugicur',          '"Mihai, sugi cur" → chupa el culo'],
  ['danielfutumata',        '"Daniel futu mata" → me follo a tu madre'],
  ['gabrielacurva',         '"Gabriela curva" → puta rumana'],
  ['cristiansugibula',      '"Cristian sugi bula" → chupa-pene variante'],
  ['adrianpizdoasa',        '"Adrian Pizdoasa" → puta rumana'],
  ['petrebagapula',         '"Petre baga pula" → métela vulgar'],
  ['ralucalingepula',       '"Raluca linge pula" → lame la polla'],
  ['cipriancacatpemine',    '"Ciprian cacat pe mine" → cagado encima'],
  ['stefanrahatos',         '"Stefan Rahatos" → de mierda'],
  ['nicumortiitai',         '"Nicu, mortii tai" → tus muertos maldición'],
  ['florinpulamea',         '"Florin, pula mea" → mi polla vulgar'],
  ['raducacavulpe',         '"Radu caca vulpe" → escatológico'],
  ['costelfutamata',        '"Costel futa mata" → variante futumata'],
  ['georgetarfa',           '"George Tarfa" → tarfa = puta'],
  ['mihaelafofoloanca',     '"Mihaela Fofoloanca" → vulva en argot'],
  ['bogdancurlinge',        '"Bogdan cur linge" → lameculos'],
  ['catalingunoiule',       '"Catalin gunoiule" → basura humana'],
  ['valibagamiama',         '"Vali, baga-mi-a-ma" → métemela sexual'],
  ['silviumuiestii',        '"Silviu muie stii" → mamada sabe'],
  ['robertinapizdrita',     '"Robertina Pizdrita" → diminutivo vulgar'],
  ['serbansugispula',       '"Serban sugi-s pula" → chupa-pene fonético'],
  ['danielafuturita',       '"Daniela Futurita" → folladita vulgar'],
  ['ovidiulingecur',        '"Ovidiu linge cur" → lameculos'],
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
  'porc',     // común en otros idiomas (FR/ES "porc/puerco")
  'mongol',   // como gentilicio
  'gunoi',    // ambiguo
  'cretin',   // común en literatura
  'matra',    // ambiguo
  'lichea',
  'fute',     // muy corto
  'sugi',     // muy corto
  'parazit',
  'rusan',
  'cocota',
]);
