/// ────────────────────────────────────────────────────────────────────────
///  Port mínimo a Dart de las blocklists core (ES/EN/FR).
/// ────────────────────────────────────────────────────────────────────────
///
/// AVISO: este es el SUBSET MÁS USADO. El JS tiene 19 idiomas con miles de
/// entradas — portarlas todas a Dart es un trabajo de 1-2 días dedicados,
/// y para muchos casos de borde Dart pierde cobertura vs el Worker.
///
/// Estrategia recomendada:
///   ▸ Validación local Dart para casos OBVIOS (devuelve REJECTED rápido,
///     sin red, en <1ms). Cubre ~70% del tráfico.
///   ▸ Si Dart NO encuentra problema, llamar al Worker (que tiene los 19
///     idiomas + AI semántica).
///
/// Esta separación se llama "fast-path local + slow-path remoto" y es
/// estándar para validación offline-capable.

// ─── Spanish (subset core de los más vulgares) ─────────────────────────
const spanishProfanity = [
  'puta', 'puto', 'putada', 'putita', 'putamadre',
  'polla', 'pollas', 'pollon',
  'verga', 'pene', 'penes',
  'nabo', 'nabos', 'naboduro',
  'cipote', 'cipotes',
  'rabo', 'rabos',
  'coño', 'cono', 'conyo', 'conazo',
  'chocho', 'chochete', 'chochito', 'chochazo',
  'follar', 'follada', 'follon',
  'culo', 'culon', 'culazo',
  'pendejo', 'pendeja',
  'cojon', 'cojones',
  'mierda', 'mierdas',
  'cagar', 'cagada', 'cagado',
  'paja', 'pajote', 'pajeo',
  'cabron', 'cabrona', 'cabrones',
  'gilipollas', 'gilipuertas', 'gilipichi',
  'maricon', 'mariconazo',
  'puton', 'putonaza',
  'imbecil', 'idiota',
  'mierdoso',
  'jodido', 'jodida',
];

const spanishExactOnly = {
  'ano',  // ano (orificio) vs Año
  'mear', // colide con apellidos gallegos como Mearín
  'meo',
};

const spanishJokeNames = [
  // [forma_concatenada, motivo]
  ['aitortilla', 'a tortilla'],
  ['aitormenta', 'a tormenta'],
  ['susanaoria', 'su zanahoria'],
  ['elenanito', 'el nenito'],
  ['elsapato', 'el zapato'],
  ['marioneta', 'marioneta'],
  ['benitocamelas', 'venido a comerlas'],
  ['lolamento', 'lo lamento'],
  ['carlosgilhipoyas', 'gilipollas'],
  ['mariaunpajote', 'María, un pajote'],
  ['ionecesitomear', 'yo necesito mear'],
  ['carmegustaelanal', 'Carmen, gusta el anal'],
  ['dolidadelano', 'dolida del ano'],
];

// ─── English (subset core) ─────────────────────────────────────────────
const englishProfanity = [
  'fuck', 'fucker', 'fucking', 'motherfucker',
  'shit', 'shitty', 'shithead',
  'cunt', 'cunts',
  'asshole', 'assholes', 'arsehole',
  'bitch', 'bitches',
  'bastard', 'bastards',
  'dick', 'dickhead', 'dicks',
  'pussy', 'pussies',
  'whore', 'whores',
  'slut', 'sluts',
  'damn', 'damnit',
  'piss', 'pissed', 'pisses',
  'crap', 'crappy',
  'jackass',
  'wanker', 'wankers',
];

const englishExactOnly = {
  'ass',  // donkey vs asshole
  'tit',  // bird vs profanity
};

const englishJokeNames = [
  ['mikehunt', 'my cunt'],
  ['hughjass', 'huge ass'],
  ['bendover', 'bend over'],
  ['philmccavity', 'fill my cavity'],
  ['waynekerr', 'wanker'],
  ['mikeoxlong', "my cock's long"],
  ['amandahugginkiss', 'a man to hug and kiss'],
];

// ─── French (subset core) ──────────────────────────────────────────────
const frenchProfanity = [
  'putain', 'pute', 'putes',
  'merde', 'merdeux',
  'connard', 'conne', 'connasse',
  'salaud', 'salope', 'salopard',
  'enculé', 'encule', 'enculee',
  'bordel', 'bordels',
  'foutre', 'foutu', 'foutue',
  'bite', 'bites',
  'couilles', 'couillon',
  'chiant', 'chiante', 'chier',
  'connard', 'connasse',
];

const frenchExactOnly = {
  'cul',  // muy corto
  'con',  // muy común y ambiguo
};

const frenchJokeNames = [
  ['jeanbon', 'jambon'],
  ['paulochon', 'polochon'],
  ['sachatouille', 'ça chatouille'],
  ['anneculé', 'enculé'],
  ['anneculee', 'enculée'],
];
