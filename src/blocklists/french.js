// French blocklist. Same conventions: lowercase, no diacritics, substring.
export const frenchProfanity = [
  // Vulgaire / sexuel
  'merde', 'merdique', 'emmerder', 'emmerdeur',
  'putain', 'putains', 'pute', 'putes', 'putasse',
  'salope', 'salopes', 'salopard', 'saloperie',
  'connard', 'connards', 'connasse', 'connasses',
  'enculer', 'encule', 'enculee', 'enculeur', 'enculons',
  'enfoire', 'enfoires', 'enfoiree',
  'baiser', 'baisee', 'baises', 'baisons', 'baisez',
  'foutre', 'foutu', 'foutue',
  'chier', 'chiant', 'chiante', 'chiotte', 'chiottes',
  'bordel', 'bordels',
  'couilles', 'couillon', 'couillonne',
  'bite', 'bites', 'biten', 'bitos',
  'queue', 'queutard',
  'chatte', 'chattes',
  'nichons', 'nichon',
  'tetons', 'teton',
  'fesse', 'fesses', 'cul',
  'pisser', 'pisse', 'pissant',
  'branler', 'branleur', 'branlette', 'branlee',
  'pedale', 'pedales', 'pd',
  'tapette', 'tapettes',
  'gouine', 'gouines',
  'pute mere', 'putemere', 'fdp', 'filsdepute',
  'fils de pute', 'filsdepute', 'fillesdepute',
  'ta mere', 'tamere', 'tamerelapute',
  'nique', 'niquer', 'niquee', 'niquees', 'niquants',
  'niquetamere', 'nique ta mere', 'nique ta race',
  'enfoiré',

  // Slurs / discriminatoires
  'negro', 'negros', 'negre', 'negresse', 'bougnoule', 'bougnoules',
  'bicot', 'bicots', 'arabe de merde',
  'chinetoque', 'chintok', 'chintoque',
  'youpin', 'youpins', 'youtre',
  'crouille', 'crouilles',
  'feuj', 'feujs',
  'bamboula', 'bamboulas',
  'rebeu', 'rebeus', // peyoratif selon usage
  'pute juive', 'sale juif', 'sale arabe', 'sale negre',
  'mongol', 'mongole', 'mongoles', 'attardé',
  'handicapé de la vie', 'autiste de merde',
  'heil hitler', 'sieg heil', 'nazi',

  // Phrases violentes
  'je vais te tuer', 'creve', 'crève', 'va crever',
  'pendre les juifs', 'gazer les arabes',

  // Drogues
  'putain de merde',

  // Noms-blagues classiques en français
  'jean bon', 'jeanbon',                  // "jambon"
  'jean neymar', 'jeanneymar',            // "j'ai n'aime pas"
  'jean peuplus', 'jeanpeuplus',          // "j'en peux plus"
  'jean marche', 'jeanmarche',            // "j'en marche / j'en ai marre"
  'jean valjean',                          // Hugo, ok mais souvent en blague
  'paul lochon', 'paullochon',            // "polochon"
  'paul ochon', 'paulochon',
  'paul ygame', 'paulygame',              // "polygame"
  'paul hisson', 'paulhisson',            // "poisson"
  'paul ar', 'paulair', 'paul air',       // "polaire"
  'paul rhydre', 'paulrhydre',
  'jacques hadit', 'jacqueshadit',        // "j'ai cas-dit"
  'jacques uzzi', 'jacquesuzzi',          // "jacuzzi"
  'jean kèlepat', 'jeankelepat',          // "j'enquête le pat"
  'sacha touille', 'sachatouille',        // "ça chatouille"
  'jean hus', 'jeanhus',                  // "génius"
  'jean nase', 'jeannase',                // "j'en ai un"
  'jean cuisse', 'jeancuisse',
  'paul molla', 'paulmolla',
  'guy mauve', 'guymauve',                // "guimauve"
  'guy taar', 'guytaar', 'guy tare',      // "guitare"
  'guillaume terre', 'guillaumeterre',    // "pomme de terre"
  'agathe zeblues', 'agathezeblues',
  'theo dupneu', 'theodupneu',            // "t'as un d'tep neu"
  'sacha grain', 'sachagrain',            // "ça chagrin"

  // Pièges français vulgaires plus subtils
  'jean ssaime', 'jeanssaime',            // "j'en s'aime / j'en ai marre"
  'jean cul', 'jeancul',
];

export const frenchExactOnly = new Set([
  'cul', 'pd', 'pq', 'fdp',
]);
