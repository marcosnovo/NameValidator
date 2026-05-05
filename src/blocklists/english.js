// English blocklist. Same conventions as Spanish: lowercase, no diacritics,
// substring matching. Short words (< 4 chars) go into `englishExactOnly`.
export const englishProfanity = [
  // Sexual / vulgar
  'fuck', 'fucker', 'fucked', 'fucking', 'fucks', 'motherfucker', 'mofo',
  'shit', 'shitty', 'shithead', 'shitface', 'bullshit', 'shitting',
  'bitch', 'bitches', 'biatch', 'btch',
  'asshole', 'arsehole', 'asshat', 'asswipe', 'jackass', 'dumbass',
  'bastard', 'bastards',
  'damn', 'goddamn', 'goddammit', 'damnit',
  'piss', 'pissed', 'pisser',
  'cunt', 'cunts',
  'pussy', 'pussies',
  'cock', 'cocks', 'cocksucker', 'cocksucking',
  'dick', 'dickhead', 'dickface', 'dicks',
  'prick', 'pricks',
  'twat', 'twats',
  'wank', 'wanker', 'wanking',
  'jerk', 'jerkoff', 'jerkface',
  'whore', 'whores', 'slut', 'sluts', 'slutty',
  'hooker', 'hookers',
  'tits', 'titties', 'titty', 'boobies',
  'blowjob', 'blowjobs', 'handjob', 'handjobs', 'rimjob',
  'orgasm', 'orgasms', 'cum', 'cumming', 'jizz',
  'rape', 'raped', 'rapist', 'rapists',
  'pedophile', 'paedophile', 'pedo',

  // Slurs / hate (zero tolerance)
  'nigger', 'niggers', 'nigga', 'niggas', 'nigguh', 'nigguz', 'niggah',
  'faggot', 'faggots', 'fag',
  'dyke', 'dykes',
  'tranny', 'trannies',
  'kike', 'kikes',
  'spic', 'spics', 'wetback', 'wetbacks',
  'chink', 'chinks', 'gook', 'gooks',
  'paki', 'pakis',
  'retard', 'retarded', 'retards',
  'mongoloid',
  'gypsy scum', 'gypped',
  'nazi', 'nazis', 'heil hitler', 'sieg heil', 'kkk',
  'white power', 'jewry', 'jewish dog',
  'islamist scum',

  // Vulgar phrases
  'go fuck yourself', 'fuck off', 'fuck you', 'screw you',
  'eat shit', 'kiss my ass', 'kissmyass',
  'son of a bitch', 'sonofabitch', 'sob bitch',
  'piece of shit', 'pieceofshit',

  // Threats / violence
  'kill yourself', 'kys', 'kill myself', 'i will kill',
  'shoot you', 'stab you', 'hang you',
  'bomb the', 'school shooter', 'mass shooter',

  // Drugs (extreme references — context HALO)
  'crack whore', 'meth head', 'crackhead',

  // Funny-but-banned name traps in English
  'mike hunt', 'mikehunt',          // "my cunt"
  'ben dover', 'bendover',           // "bend over"
  'hugh jass', 'hughjass',           // "huge ass"
  'phil mccavity', 'philmccavity',   // "fill my cavity"
  'amanda hugginkiss', 'amandahugginkiss',
  'seymour butts', 'seymourbutts',
  'pat mycrotch', 'patmycrotch',
  'i p freely', 'ipfreely',
  'jacques strap', 'jacquesstrap',
  'bart simpson',                    // gag-call classic, also impersonation
  'oliver clothesoff', 'oliverclothesoff',
  'al coholic', 'alcoholic',
  'anita bath', 'anitabath',         // "I need a bath"
  'maya buttreeks', 'mayabuttreeks',
  'rusty kuntz', 'rustykuntz',
  'haywood jablowme',
  'harry baals', 'harrybaals',
  'craven moorehead', 'cravenmoorehead',
  'mike rotch', 'mikerotch',
  'dixie normous', 'dixienormous',
  'wayne kerr', 'waynekerr',         // "wanker"
  'mike oxlong', 'mikeoxlong',
  'mike oxbig', 'mikeoxbig',
  'mike oxsmall', 'mikeoxsmall',
  'mike litoris', 'mikelitoris',
  'jenny tals', 'jennytals',
  'al caholic',
  'i c weiner', 'icweiner',
  'mr klitz', 'mrklitz',
];

export const englishExactOnly = new Set([
  'ass', 'tit', 'fag', 'cum', 'jew',
]);
