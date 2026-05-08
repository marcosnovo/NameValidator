// ──────────────────────────────────────────────────────────────────────────
//  Lista de palabras prohibidas en polaco (PL)
// ──────────────────────────────────────────────────────────────────────────
//
// Cubre las "wulgaryzmy" (vulgaridades) más comunes y los slurs polacos.
// Polonia envía muchísimo turista al Bernabéu (~5% del Tour según
// estimaciones). Los polacos a veces también escriben con caracteres
// latinos sin ł/ń/ó, así que cubrimos las dos formas.
//
// Reglas:
//  - Todas en minúsculas, sin diacríticos (la normalización los strip).
//  - Bloqueamos como subcadena en concatNoSpaces.
//
// Fuentes externas consultadas (datos derivados / inspirados):
//   ▸ github.com/coldner/wulgaryzmy (MIT)
//   ▸ github.com/LDNOOBWV2/List-of-Dirty-… (CC0) — `pl.txt`

export const polishProfanity = [
  // ── Núcleo vulgar polaco
  'kurwa', 'kurwy', 'kurwo', 'kurwami', 'kurwamac', 'kurewski', 'kurewska',
  'kurew', 'kurwiarz', 'kurwiszon',
  'chuj', 'chuje', 'chujem', 'chujnia', 'chujowo', 'chujowy',
  'chujowa', 'chujodupa',
  'huj', 'hujnia',                                // variante
  'pizda', 'pizdy', 'pizdami', 'pizdolizny',
  'jeb', 'jebac', 'jebal', 'jebana', 'jebany', 'jebajsie',
  'jebanyrot', 'jebanymatka', 'jebcie', 'jebnac', 'jebnij',
  'jebanasprawa', 'jebanasie',
  'pierdolic', 'pierdole', 'pierdolony', 'pierdolnac', 'spierdalaj',
  'spierdolic', 'wpierdol', 'odpierdol', 'wypierdalaj', 'opierdol',
  'pierdolnik', 'pierdolnikow', 'pierdolone', 'pierdolnij',
  'dupek', 'dupki', 'dupy', 'dupa', 'dupencia', 'dupcio',
  'dupojeb',
  'gowno', 'gownem', 'gowniarz', 'gowniany', 'gowniana',
  'sracz', 'sraczka', 'srac', 'sraj',
  'cipa', 'cipy', 'cipke', 'cipkach',
  'fiut', 'fiuty', 'fiutek',
  'pala', 'palka',                                // demasiado cortos → exact
  'skurwysyn', 'skurwiel', 'skurwysyny', 'skurwiele', 'skurwiona',
  'debil', 'debilu', 'debilka', 'debilski',
  'idiota', 'idioto', 'idiotka', 'idiotyzm',
  'zjebany', 'zjebac', 'zjebka', 'zjebany',
  'pojeb', 'pojebany', 'pojebana', 'popierdolony', 'popierdolona',
  'kutas', 'kutasem', 'kutasy', 'kutasie',         // pene vulgar
  'kutasowaty',
  'jajca', 'jajco', 'cojaja',
  'sram', 'sramie', 'srali', 'sranie',
  'bzdura', 'bzdurny',                             // tonteria (mild)
  'glupek', 'glupka', 'glupkowaty',
  'lamus', 'lamuski',                              // pringado
  'kretyn', 'kretynka', 'kretynski',
  'oszolom', 'oszolomy',
  'gnoj', 'gnojek', 'gnoju',                       // mierda / desgraciado
  'lajno', 'lajna',                                // mierda / vulgar
  'cholera', 'cholerny',                           // peste / mild
  'cholerstwo',
  'syf', 'syfa',                                   // mierda mild
  'menda', 'mendy',                                // pulgon / despectivo
  'wkurzony', 'wkurwic', 'wkurwiony', 'wkurwiona',
  'opierdalac', 'opierdolic',
  'oszust', 'oszustka',                            // estafador (más mild)
  'pierdolone',
  'sukinsyn', 'sukinsyna',                         // hijo de perra
  'lachociag', 'laska',                            // jerga vulgar (laska tb significa "tía")
  'wykurwiac',
  'kurwiska',

  // ── Slurs étnicos / homófobos
  'pedal', 'pedaly', 'pedalskie', 'pedalstwo',     // slur homófobo
  'cwel', 'cwele',                                 // slur homófobo (jerga)
  'czarnuch', 'czarnuchy',                         // slur racial grave
  'cygan', 'cyganow', 'cyganstwo',                 // slur (gitanos)
  'moskal', 'moskali', 'moskale',                  // slur antiruso
  'szwab', 'szwaby',                               // slur antialemán
  'kacap', 'kacapy',                               // slur antiruso (más fuerte)
  'jaszczury',                                     // político vulgar
  'lebowy',
  'mongol', 'mongoloid',                           // slur capacitista
  'zydek', 'zydki', 'zydostwo',                    // slur antisemita

  // ── Apología nazi / extremismo
  'sigieil',                                       // "sieg heil" mal escrito
  'heilhitler', 'siegheil',
  'putiniec',                                      // pro-Putin polaco peyorativo
  'banderowiec', 'banderowcy',                     // referencia controvertida
  'wehrmacht', 'gestapo',                          // sólo solos / como nombre = referencia
  'majdanek',                                      // campo de exterminio (sólo si solo)
];

export const polishJokeNames = [
  ['kurwamac',          'expresión polaca muy vulgar'],
  ['idiotaspierdalaj',  'insulto polaco compuesto'],
  ['skurwysyn',         '"hijo de puta" en polaco'],
  ['chujwduppe',        'expresión vulgar polaca'],
  ['jebanyrot',         'expresión vulgar polaca'],
  ['pojebanymir',       'expresión vulgar polaca'],
  ['heilhitler',        'apología nazi'],
  ['siegheil',          'saludo nazi'],
  ['banderowiec',       'referencia política controvertida'],
  ['kurwiszon',         'expresión polaca muy vulgar'],
  ['skurwiona',         'insulto polaco grave'],
];

export const polishExactOnly = new Set([
  'pala', 'palka',     // muy cortos
  'fiut',              // existe como apellido raro
  'cwel',              // slur muy corto
  'huj',
  'gnoj',              // existe como apellido (Gnoj)
  'syf',               // muy corto
  'menda',
  'syfa',
  'cholera',           // muy común en literatura legítima
  'jajca',
  'laska',              // tb significa "tía/cariño" — ambiguo
  'oszust',
  'mongol',            // como nombre (Mongol = nacionalidad/apellido)
  'wehrmacht',         // sólo como referencia política
  'gestapo',
  'majdanek',          // existe como apellido
]);
