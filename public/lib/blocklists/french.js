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

  // Slurs / discriminatoires
  'negro', 'negros', 'negre', 'negresse', 'bougnoule', 'bougnoules',
  'bicot', 'bicots', 'arabe de merde',
  'chinetoque', 'chintok', 'chintoque',
  'youpin', 'youpins', 'youtre',
  'crouille', 'crouilles',
  'feuj', 'feujs',
  'bamboula', 'bamboulas',
  'rebeu', 'rebeus',
  'pute juive', 'sale juif', 'sale arabe', 'sale negre',
  'mongol', 'mongole', 'mongoles', 'attardé',
  'handicapé de la vie', 'autiste de merde',
  'heil hitler', 'sieg heil', 'nazi',

  // Phrases violentes
  'je vais te tuer', 'creve', 'crève', 'va crever',
  'pendre les juifs', 'gazer les arabes',

  // ── Ampliación ──
  'pute borgne',
  'tirelaine',
  'enculotter',
  'baltringue', 'baltringues',
  'glandu', 'glandus',
  'connard de merde',
  'tete de noeud', 'teteducon',
  'morpion', 'morpions',
  'foutaise', 'foutaises',
  'pisseux', 'pisseuse',
  'caca boudin',
  'sodomite',
  'fistage',
  'doggystyle',
  'levrette',

  // Plus de slurs
  'ramequin',
  'frichti', // contexto despectivo
  'macaque', 'macaques',
  'face de pet',
  'fellah de merde',
  'nègre asservi',

  // Menaces explicites
  'je vais te buter', 'je vais te défoncer', 'je vais te niquer',
  'casse-toi salope', 'crève sale arabe', 'crève sale juif',
  'mort aux juifs', 'mort aux arabes', 'mort aux pédés',
  'gazons les juifs', 'brulons les arabes',

  // Pédocriminalité (tolerancia cero)
  'pédoporno', 'pédocriminel', 'aime les enfants sexuellement',

  // ── Ampliación: profanity-light + slurs adicionales
  'caca', 'cacaboudin', 'pipi',
  'ducon', 'duconnasse',
  'ducul', 'cul-de-jatte',
  'tête de gland', 'gland', 'glands',
  'bite molle', 'bitemolle',
  'foufoune', 'foufounette',
  'zob', 'zobi',
  'queutard',
  'pédant', 'pédanteux',
  'crétin', 'crétine', 'crétins',
  'débile', 'débiles', 'débilité',
  'tarlouze', 'tarlouzes',
  'pédéraste', 'pédérastes',
  'sodomite',
  'putoufeu', 'putoclou',

  // Anti-Madrid en francés
  'putain de madrid', 'putaindemadrid', 'merdedemadrid',
  'vive le barca', 'viveelbarca', 'vivelebarca', 'vivebarca',
];

// ─── Noms-blagues en français ───────────────────────────────────────────────
// Curaduría: ~350 candidats du recherche → ~150 retenus, en filtrant:
//   - Prénoms réels (Léa, Lara, Sophie, Marie, Camille, Albertine,
//     Béatrice, Stéphanie, Mauricette, Carla, Carla Bruni…) qui produiraient
//     des faux positifs.
//   - Calembours trop faibles ("Marc Donald" = McDonald, qui pourrait
//     percuter un nom de famille légitime).
//   - Conservé tous les vulgaires explicites et les classiques canon
//     "Monsieur et Madame" / Tube Bar / Topito.
export const frenchJokeNames = [
  // ── Série "Jean + verbe/nom" (j'en …)
  ['jeanbon', 'Jean Bon → "jambon"'],
  ['jeanpeuplus', 'Jean Peuplus → "j\'en peux plus"'],
  ['jennemarre', 'Jean Némarre → "j\'en ai marre"'],
  ['jeannaimar', 'Jean Naimar → "j\'en ai marre"'],
  ['jennemafoutre', 'Jean Némafoutre → "j\'en ai à foutre"'],
  ['jeanhus', 'Jean Hus → "génius / Jésus"'],
  ['jeanmarche', 'Jean Marche → "j\'en marche / gendarme"'],
  ['jeanvoyage', 'Jean Voyage → "j\'envoyage"'],
  ['jeantendrien', 'Jean Tendrien → "j\'entends rien"'],
  ['jennemaledos', 'Jean Némaledos → "j\'en ai mal au dos"'],
  ['jeancul', 'Jean Cul → "j\'encule (vulgaire)"'],
  ['jeanculevache', 'Jean Cul Évache → "j\'encule les vaches (vulgaire)"'],
  ['jeancouille', 'Jean Couille → "couilles (vulgaire)"'],
  ['jeanbonbeur', 'Jean Bonbeur → "jambon beurre"'],
  ['jeanfromage', 'Jean Fromage → "jambon fromage"'],
  ['jeanpisse', 'Jean Pisse → "j\'en pisse (vulgaire)"'],
  ['jeanchie', 'Jean Chié → "j\'ai chié (vulgaire)"'],
  ['jeanfoiredanslefroc', 'Jean Foiré dans le Froc (vulgaire)'],
  ['jennemassez', 'Jean Némassez → "j\'en ai assez"'],
  ['jeanaimar', 'Jean Aimar → "j\'en ai marre"'],
  ['jeancroipasmeyeux', 'Jean Croipasméyeux → "j\'en crois pas mes yeux"'],
  ['jeannaipalu', 'Jean Naipalu → "j\'en ai pas lu"'],

  // ── Série "Paul + sustantivo" (pol-)
  ['paulochon', 'Paul Ochon → "polochon"'],
  ['paulhisson', 'Paul Hisson → "poisson"'],
  ['paulhygame', 'Paul Hygame → "polygame"'],
  ['paullution', 'Paul Lution → "pollution"'],
  ['paulystyrene', 'Paul Ystyrene → "polystyrène"'],
  ['paultron', 'Paul Tron → "poltron"'],
  ['paultergeist', 'Paul Tergeist → "poltergeist"'],
  ['paulaire', 'Paul Aire → "polaire"'],
  ['paultique', 'Paul Tique → "politique"'],
  ['paulissant', 'Paul Issant → "polissant / polisson"'],
  ['paulemique', 'Paul Émique → "polémique"'],
  ['paulissage', 'Paul Issage → "polissage"'],
  ['paularoid', 'Paul Aroïd → "polaroïd"'],

  // ── Série "Jacques + …" (j\'ai cassé …)
  ['jacquesouille', 'Jacques Ouille → "jacquouille / aïe"'],
  ['jacquesuzzi', 'Jacques Uzzi → "jacuzzi"'],
  ['jacquesstrap', 'Jacques Strap → "jock strap"'],

  // ── Série "Sacha + verbo" (ça cha-)
  ['sachatouille', 'Sacha Touille → "ça chatouille"'],
  ['sachagrain', 'Sacha Grain → "ça chagrine"'],
  ['sachapitre', 'Sacha Pitre → "chapitre"'],
  ['sachaloupe', 'Sacha Loupe → "chaloupe"'],
  ['sachapote', 'Sacha Pote → "ça chapote / capote"'],
  ['sachahute', 'Sacha Hute → "ça chahute"'],
  ['sachavire', 'Sacha Vire → "ça chavire"'],
  ['sachamaille', 'Sacha Maille → "ça chamaille"'],
  ['sachapelle', 'Sacha Pelle → "chapelle / ça s\'appelle"'],

  // ── Série "Guy + sustantivo" (gui-)
  ['guymauve', 'Guy Mauve → "guimauve"'],
  ['guytare', 'Guy Tare → "guitare"'],
  ['guydon', 'Guy Don → "guidon"'],
  ['guychet', 'Guy Chet → "guichet"'],
  ['guygnol', 'Guy Gnol → "guignol"'],
  ['guypure', 'Guy Pure → "guipure"'],
  ['guylotine', 'Guy Lotine → "guillotine"'],
  ['guynessbouc', 'Guy Nessbouc → "Guinness Book"'],
  ['guynepig', 'Guy Nepig → "guinea pig"'],

  // ── Série "Agathe + adjectivo"
  ['agathezeblues', 'Agathe Zeblues → "I got the blues"'],
  ['agathelacreve', 'Agathe Lacrève → "j\'ai la crève"'],
  ['agatheeumal', 'Agathe Eumal → "j\'ai eu mal"'],

  // ── Série "Théo + sufijo"
  ['theologien', 'Théo Logien → "théologien"'],
  ['theodolite', 'Théo Dolite → "théodolite"'],
  ['theocratique', 'Théo Cratique → "théocratique"'],
  ['theoreme', 'Théo Rème → "théorème"'],
  ['theodupneu', 'Théo Dupneu → "tuyau du pneu"'],

  // ── Série "Henri + algo" (en ri-)
  ['henricot', 'Henri Cot → "haricot"'],
  ['henrigolo', 'Henri Golo → "rigolo"'],
  ['henriviere', 'Henri Vière → "rivière"'],

  // ── Série "Anne + sustantivo" (a-)
  ['annehonyme', 'Anne Honyme → "anonyme"'],
  ['annetartique', 'Anne Tartique → "antarctique"'],
  ['anneatomique', 'Anne Atomique → "anatomique"'],
  ['anneaerobie', 'Anne Aérobie → "anaérobie"'],
  ['anneesthesie', 'Anne Esthésie → "anesthésie"'],
  ['anneniversaire', 'Anne Niversaire → "anniversaire"'],
  ['annetilope', 'Anne Tilope → "antilope"'],
  ['anneticonstitutionnelle', 'Anne Ticonstitutionnelle → "anticonstitutionnelle"'],
  ['annechois', 'Anne Chois → "anchois"'],
  ['annequete', 'Anne Quête → "enquête"'],
  ['annetourage', 'Anne Tourage → "entourage"'],
  ['annecroute', 'Anne Croute → "en croûte"'],
  ['annedorrah', 'Anne Dorrah → "Andorre"'],
  ['annedalousie', 'Anne Dalousie → "Andalousie"'],
  ['anneculee', 'Anne Culée → "enculée (vulgaire)"'],
  ['annecule', 'Anne Culé → "enculé (vulgaire)"'],

  // ── Série "Lou + sustantivo"
  ['lougaroux', 'Lou Garoux → "loup-garou"'],

  // ── Série "Marie + algo"
  ['marihonnette', 'Marie Honnette → "marionnette"'],
  ['marisapuhe', 'Marie Sapuhé → "Marie ça pue"'],
  ['mariouana', 'Marie Ouana → "marijuana"'],
  ['marijuana', 'Marie Juana → "marijuana"'],
  ['mariannette', 'Marie Annette → "marionnette"'],
  ['marietouche', 'Marie Touche → "Marie touche (vulgaire)"'],

  // ── Série "Camille + algo" (mille- / kilo-)
  ['camillehonnaire', 'Camille Honnaire → "millionnaire"'],
  ['camillepattes', 'Camille Pattes → "mille-pattes"'],
  ['camillefeuilles', 'Camille Feuilles → "mille-feuilles"'],
  ['camillemetrique', 'Camille Métrique → "kilométrique"'],
  ['camilleticolore', 'Camille Ticolore → "multicolore"'],

  // ── Série "Yves + sustantivo" (i-)
  ['yvesrogne', 'Yves Rogne → "ivrogne"'],
  ['yvresse', 'Yves Resse → "ivresse"'],

  // ── Otros canon
  ['leopard', 'Léo Pard → "léopard"'],
  ['leopardine', 'Léopardine'],
  ['barthelemie', 'Bart Hélémie → "Barthélémy"'],
  ['homersexuel', 'Homer Sexuel → "homosexuel"'],
  ['artichaud', 'Artie Chaud → "artichaut"'],
  ['rickhochet', 'Rick Hochet → "ricochet"'],
  ['ricktus', 'Rick Tus → "rictus"'],
  ['samedi', 'Sam Edi → "samedi"'],
  ['samsuffit', 'Sam Suffit → "ça me suffit"'],
  ['samdunk', 'Sam Dunk → "slam dunk"'],
  ['tombola', 'Tom Bola → "tombola"'],
  ['microphone', 'Mike Rofone → "microphone"'],
  ['microbe', 'Mike Robe → "microbe"'],
  ['charlatan', 'Charles Atan → "charlatan"'],
  ['charlescuterie', 'Charles Cuterie → "charcuterie"'],
  ['eveapore', 'Eve Aporé → "évaporé"'],
  ['eveidemment', 'Eve Idemment → "évidemment"'],
  ['justinpetitpeu', 'Justin Petitpeu → "juste un petit peu"'],
  ['justincas', 'Justin Cas → "juste en cas"'],
  ['billard', 'Bill Lard → "billard"'],
  ['billboquet', 'Bill Boquet → "bilboquet"'],
  ['alimentaire', 'Ali Mentaire → "alimentaire"'],
  ['benitier', 'Ben Itier → "bénitier"'],
  ['bendiction', 'Ben Diction → "bénédiction"'],

  // ── Vulgaires explicites (ces noms sont conçus pour être vulgaires)
  ['cunnilingus', 'Cunni Lingus (vulgaire)'],
  ['cunnilinguiste', 'Cunni Linguiste → "cunnilingus" (vulgaire)'],
  ['analyse', 'Anna Lyse → "analyse"'],
  ['annalogue', 'Anna Logue → "analogue"'],
  ['annaconda', 'Anna Conda → "anaconda"'],
  ['annalphabete', 'Anna Lphabète → "analphabète"'],
  ['annatomique', 'Anna Tomique → "anatomique"'],
  ['annalement', 'Anna Lement → "analement (vulgaire)"'],
  ['nicktamere', 'Nick Tamère → "nique ta mère (vulgaire)"'],
  ['fildepute', 'Phil de Pute → "fils de pute (vulgaire)"'],
  ['fysdepute', 'Fys Députe → "fils de pute (vulgaire)"'],
  ['salopard', 'Sa Lopard → "salopard (vulgaire)"'],
  ['salope', 'Sa Lope → "salope (vulgaire)"'],
  ['henriculer', 'Henri Culer → "enculer (vulgaire)"'],
  ['tutencules', 'Tu Tencules → "tu t\'encules (vulgaire)"'],
  ['conniyard', 'Connie Yard → "connard (vulgaire)"'],
  ['connyasse', 'Conny Yasse → "connasse (vulgaire)"'],
  ['branlette', 'Bran Lette → "branlette (vulgaire)"'],
  ['branleur', 'Bran Leur → "branleur (vulgaire)"'],
  ['putttain', 'Putt Tain → "putain (vulgaire)"'],
  ['biteterieur', 'Bite Térieur → "bite à l\'intérieur (vulgaire)"'],
  ['chatetone', 'Cha Tetone → "chatte tonne (vulgaire)"'],
  ['penelopeteenculee', 'Pénélope Été Enculée (vulgaire)'],
  ['suzyphyllis', 'Suzy Phyllis → "syphilis"'],
  ['sophilis', 'Sophie Lis → "syphilis"'],
  ['salomepete', 'Salomé Pète → "salope pète (vulgaire)"'],
  ['salomete', 'Salomé Té → "salopette"'],
  ['lolasuce', 'Lola Suce (vulgaire)'],
  ['suzydoigte', 'Suzy Doigte (vulgaire)'],
  ['pettasse', 'Pet Tasse → "pétasse (vulgaire)"'],
  ['testosterone', 'Tess Tostérone → "testostérone"'],
  ['testicule', 'Tess Ticule → "testicule"'],
  ['vincentcentimetres', 'Vincent Centimètres'],
];

export const frenchExactOnly = new Set([
  'cul', 'pd', 'pq', 'fdp',
]);
