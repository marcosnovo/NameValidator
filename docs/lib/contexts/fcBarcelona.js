// ──────────────────────────────────────────────────────────────────────────
//  Contexto FC Barcelona — Spotify Camp Nou
// ──────────────────────────────────────────────────────────────────────────
//
// Demostración del patrón multi-tenant. Mismas reglas que Real Madrid pero
// con espejo: los rivales son ahora los jugadores blancos, los cánticos
// rivales son los pro-Madrid, y los jugadores propios cubren la plantilla
// del Barça.
//
// Para añadir más clubes (Atlético, Manchester United, NBA Lakers, etc.)
// basta con copiar este archivo, renombrar y rellenar las listas.

export const fcBarcelonaContext = {
  id: 'fc-barcelona',
  displayName: 'FC Barcelona — Spotify Camp Nou',
  description:
    'Validador de nombres a mostrar en pantallas LED del Spotify Camp Nou. ' +
    'Bloquea identidades de jugadores rivales (Madrid, Atleti), cánticos ' +
    'pro-Madrid y combinaciones de slur+jugador propio.',

  // ─── Combinaciones nombre+apellido completos a bloquear ────────────────
  // Madrid actuales y leyendas. Los aficionados culés con apellidos
  // coincidentes (Ramos, Alonso, Asensio, etc.) no se ven afectados —
  // el motor SÓLO matchea full-name por defecto.
  rivalPlayerFullNames: [
    // ── Real Madrid actuales
    ['cristianoronaldo',     'Cristiano Ronaldo (ex-Madrid, BD-rival icónico)'],
    ['cr7',                  'Apodo Cristiano Ronaldo'],
    ['karimbenzema',         'Karim Benzema (ex-Madrid)'],
    ['vinicius junior',      'Vinicius Júnior (Madrid)'],
    ['viniciusjr',           'Vinicius Jr (Madrid)'],
    ['kylianmbappe',         'Kylian Mbappé (Madrid)'],
    ['judebellingham',       'Jude Bellingham (Madrid)'],
    ['lukamodric',           'Luka Modrić (Madrid)'],
    ['tonikroos',            'Toni Kroos (ex-Madrid)'],
    ['federicovalverde',     'Federico Valverde (Madrid)'],
    ['rodrygogoes',          'Rodrygo Goes (Madrid)'],
    ['edermilitao',          'Éder Militão (Madrid)'],
    ['antoniorudiger',       'Antonio Rüdiger (Madrid)'],
    ['eduardocamavinga',     'Eduardo Camavinga (Madrid)'],
    ['aurelientchouameni',   'Aurélien Tchouaméni (Madrid)'],
    ['ferlandmendy',         'Ferland Mendy (Madrid)'],
    ['ardaguler',            'Arda Güler (Madrid)'],
    ['dani carvajal',        'Dani Carvajal (Madrid)'],
    ['danicarvajal',         'Dani Carvajal (Madrid)'],
    ['thibautcourtois',      'Thibaut Courtois (Madrid)'],
    // ── Leyendas blancas
    ['zinedinezidane',       'Zinedine Zidane (ex-Madrid)'],
    ['ikercasillas',         'Iker Casillas (ex-Madrid)'],
    ['raulgonzalez',         'Raúl González Blanco (ex-Madrid)'],
    ['sergioramos',          'Sergio Ramos (ex-Madrid)'],
    ['xabialonso',           'Xabi Alonso (ex-Madrid)'],
    ['guti',                 'Guti (ex-Madrid)'],
    ['fernandoredondo',      'Fernando Redondo (ex-Madrid)'],
    ['michel salgado',       'Míchel Salgado (ex-Madrid)'],
    ['michelsalgado',        'Míchel Salgado (ex-Madrid)'],
    ['michelmadrid',         'Míchel — leyenda del Madrid'],
    ['hugosanchez',          'Hugo Sánchez (ex-Madrid)'],
    ['alfredodistefano',     'Alfredo Di Stéfano (leyenda Madrid)'],
    // ── Atlético de Madrid
    ['diegosimeone',         'Diego Simeone (Atlético de Madrid)'],
    ['cholosimeone',         'Cholo Simeone'],
    ['antoinegriezmann',     'Antoine Griezmann (Atlético)'],
    ['koke',                 'Koke (Atlético) — alias corto'],
    ['saulniguez',           'Saúl Ñíguez (Atlético)'],
    ['janoblak',             'Jan Oblak (Atlético)'],
    ['joaofelix',            'João Félix (Atlético)'],
    ['memphisdepay',         'Memphis Depay (Atlético)'],
    // ── Otros rivales históricos
    ['florentinoperez',      'Florentino Pérez (presidente Madrid)'],
    ['ramoncalderon',        'Ramón Calderón (ex-presidente Madrid)'],
  ],

  // Apellidos extremadamente raros — bloqueables sueltos.
  uniqueAloneSurnames: [
    ['mbappe',     'Apellido único Kylian Mbappé (Madrid)'],
    ['benzema',    'Apellido único Karim Benzema (ex-Madrid)'],
    ['vinicius',   'Apellido raro Vinicius Júnior (Madrid)'],
    ['bellingham', 'Apellido único Jude Bellingham (Madrid)'],
    ['rudiger',    'Apellido único Antonio Rüdiger (Madrid)'],
    ['camavinga',  'Apellido único Eduardo Camavinga (Madrid)'],
    ['tchouameni', 'Apellido único Aurélien Tchouaméni (Madrid)'],
    ['modric',     'Apellido único Luka Modrić (Madrid)'],
    ['courtois',   'Apellido único Thibaut Courtois (Madrid)'],
    ['guler',      'Apellido único Arda Güler (Madrid)'],
    ['florentino', 'Único en este uso (Florentino Pérez Madrid)'],
  ],

  // Apellidos comunes — REVIEW (no bloqueo duro).
  // Ej: aficionado culé llamado "Carlos Ramos García" debe poder pasar.
  commonAloneSurnames: [
    ['ramos',    'Posible suplantación de Sergio Ramos (apellido muy común)'],
    ['alonso',   'Posible suplantación de Xabi Alonso (apellido muy común)'],
    ['ronaldo',  'Posible suplantación de Cristiano Ronaldo (también nombre brasileño)'],
    ['carvajal', 'Posible suplantación de Dani Carvajal (apellido relativamente común)'],
    ['cristiano','Posible suplantación de Cristiano Ronaldo (también nombre común)'],
    ['raul',     'Posible suplantación de Raúl González (también nombre civil súper común)'],
    ['simeone',  'Posible suplantación de Diego Simeone (apellido italiano)'],
    ['cholo',    'Apodo de Diego Simeone (también término coloquial)'],
    ['griezmann','Posible suplantación de Antoine Griezmann'],
    ['michel',   'Posible suplantación de Míchel (también nombre común)'],
  ],

  // ─── Cánticos contra el Barça (pro-Madrid o anti-Barça) ────────────────
  antiClubChants: [
    // ── Pro Madrid
    ['halamadrid',         '"Hala Madrid"'],
    ['halamadridynadamas', '"Hala Madrid y nada más"'],
    ['vivaelmadrid',       '"Viva el Madrid"'],
    ['arribaelmadrid',     '"Arriba el Madrid"'],
    ['vamosmadrid',        '"Vamos Madrid"'],
    ['halamadridhalamadrid', 'doble "Hala Madrid"'],
    ['somoselmejorequipo', '"Somos el mejor equipo" — chant Madrid'],
    // ── Insultos al Barça
    ['barcademierda',      '"Barça de mierda"'],
    ['barcamierda',        '"Barça mierda"'],
    ['putobarca',          '"Puto Barça"'],
    ['putosculers',        '"Putos culers"'],
    ['putoxavi',           'insulto a Xavi'],
    ['putopep',            'insulto a Pep Guardiola'],
    ['culerosmierda',      '"Culeros mierda"'],
    ['catalanesfueradeespana','catalanofobia agresiva'],
    ['anticatalan',        'anticatalanismo'],
    // ── Insultos al presidente
    ['putolaporta',        'insulto a Joan Laporta'],
    ['laportadimision',    '"Laporta dimisión"'],
    ['putobartomeu',       'insulto a Bartomeu'],
    // ── Anti-jugadores Barça
    ['fueralewandowski',   '"Fuera Lewandowski"'],
    ['lewamierda',         'insulto a Lewandowski'],
    ['hijodeputaxavi',     'insulto grave a Xavi'],
    ['putoyamal',          'insulto a Lamine Yamal'],
  ],

  // Tokens de jugadores PROPIOS (Barça actual + leyendas) para detección
  // de racism-context: si aparece "Yamal mono", "Lewandowski cerdo",
  // "Pedri viejo", el motor escala a racism-context con severity:high.
  ownPlayerTokens: new Set([
    // ── Plantilla actual del Barça
    'lamineyamal', 'yamal',
    'pedri', 'pedrigonzalez',
    'gavi', 'pablogavi',
    'frenkie', 'frenkiedejong', 'dejong',
    'lewandowski', 'lewa', 'robertlewandowski',
    'raphinha',
    'fermin', 'ferminlopez',
    'cubarsi',
    'balde', 'alejandrobalde',
    'tersTegen', 'tertegen',
    'koundé', 'kounde',
    'eric garcia', 'ericgarcia',
    'inakiwilliams',
    'olmo', 'danolmo',
    'dani olmo',
    // ── Leyendas Barça
    'messi', 'lionelmessi', 'leomessi', 'liomessi',
    'xavi', 'xavihernandez',
    'andresiniesta', 'iniesta',
    'pep', 'guardiola', 'pepguardiola',
    'puyol', 'carlespuyol',
    'pique', 'gerardpique',
    'busquets', 'sergiobusquets',
    'neymar', 'neymarjr',
    'alves', 'danialves',
    'eto\'o', 'samueletoo',
    'ronaldinho',
    'rivaldo',
    'romario',
    'cruyff', 'johancruyff',
    'koeman', 'ronaldkoeman',
    'rijkaard',
    'stoichkov',
    'kluivert',
  ]),
};
