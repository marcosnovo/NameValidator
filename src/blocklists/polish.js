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

export const polishProfanity = [
  // ── Núcleo vulgar polaco
  'kurwa', 'kurwy', 'kurwo', 'kurwami', 'kurwamac',
  'chuj', 'chuje', 'chujem', 'chujnia', 'chujowo', 'chujowy',
  'huj', 'hujnia',                                // variante
  'pizda', 'pizdy', 'pizdami',
  'jeb', 'jebac', 'jebal', 'jebana', 'jebany', 'jebajsie',
  'jebanyrot', 'jebanymatka', 'jebac', 'jebcie',
  'jebanasprawa',
  'pierdolic', 'pierdole', 'pierdolony', 'pierdolnac', 'spierdalaj',
  'spierdolic', 'wpierdol', 'odpierdol',
  'dupek', 'dupki', 'dupy', 'dupa', 'dupencia',
  'gowno', 'gówno', 'gownem', 'gowniarz',
  'sracz', 'sraczka', 'srac',
  'cipa', 'cipy', 'cipke', 'cipkach',
  'fiut', 'fiuty',
  'pala', 'palka',                                // demasiado cortos → exact
  'skurwysyn', 'skurwiel', 'skurwysyny',
  'debil', 'debilu', 'debilka',
  'idiota', 'idioto', 'idiotka',
  'zjebany', 'zjebac', 'zjebka',
  'chujowy', 'chujowa',
  'pojeb', 'pojebany', 'pojebana', 'popierdolony',

  // ── Slurs étnicos / homófobos
  'pedal', 'pedaly', 'pedalskie',                 // slur homófobo
  'cwel', 'cwele',                                // slur homófobo (jerga)
  'czarnuch', 'czarnuchy',                        // slur racial grave
  'cygan', 'cyganow',                             // slur (gitanos)
  'moskal', 'moskali', 'moskale',                 // slur antiruso
  'szwab', 'szwaby',                              // slur antialemán
  'jaszczury',                                    // político vulgar
  'lebowy',
  'mongol',                                       // slur capacitista

  // ── Apología nazi / extremismo
  'sigieil',                                      // "sieg heil" mal escrito
  'heilhitler',
  'putiniec',                                     // pro-Putin polaco peyorativo
];

export const polishJokeNames = [
  ['kurwamac',          'expresión polaca muy vulgar'],
  ['idiotaspierdalaj',  'insulto polaco compuesto'],
  ['skurwysyn',         '"hijo de puta" en polaco'],
  ['chujwduppe',        'expresión vulgar polaca'],
  ['jebanyrot',         'expresión vulgar polaca'],
  ['pojebanymir',       'expresión vulgar polaca'],
  ['heilhitler',        'apología nazi'],
];

export const polishExactOnly = new Set([
  'pala', 'palka',     // muy cortos
  'fiut',              // existe como apellido raro
  'cwel',              // slur muy corto
  'huj',
]);
