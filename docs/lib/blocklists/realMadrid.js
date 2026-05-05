// ──────────────────────────────────────────────────────────────────────────
// Blocklist específica del contexto Real Madrid / HALO Bernabéu.
//
// PRINCIPIO CLAVE para evitar falsos positivos:
//   ▸ Bloqueamos COMBINACIONES nombre+apellido completas de jugadores
//     rivales, NO apellidos sueltos.
//   ▸ Razón: una aficionada llamada "Ángela Guardiola Guardiola" debe poder
//     mostrar su nombre. Si bloqueáramos el apellido "Guardiola" suelto la
//     bloquearíamos a ella sin remedio (la capa estática es bloqueante).
//   ▸ Apellidos sueltos los juzga la capa AI con contexto (nombre completo,
//     diminutivos, primer nombre típico vs primer nombre del jugador, etc.).
//
// Sólo metemos en lista exacta:
//   - Nombre completo de jugador/entrenador rival famoso (Pep Guardiola,
//     Lionel Messi, Andrés Iniesta, etc.)
//   - Apellidos ÚNICOS / muy distintivos que casi nadie en España usaría
//     como nombre civil (Ronaldinho, Stoichkov, Eto'o, Cruyff…)
//   - Chants antimadridistas o pro-rivales (Visca el Barça, Madrid de
//     mierda, Florentino dimisión, Catalunya Independent…)
// ──────────────────────────────────────────────────────────────────────────

export const rivalPlayerFullNames = [
  // ── FC Barcelona — actuales y leyendas
  ['lionelmessi', 'Lionel Messi (Barcelona)'],
  ['leomessi', 'Leo Messi (Barcelona)'],
  ['liomessi', 'Lio Messi (Barcelona)'],
  ['lionelandresmessi', 'Lionel Andrés Messi'],
  ['pepguardiola', 'Pep Guardiola (ex-Barcelona, Manchester City)'],
  ['josepguardiola', 'Josep Guardiola'],
  ['peppguardiola', 'Pep Guardiola variante'],
  ['andresiniesta', 'Andrés Iniesta (Barcelona)'],
  ['xavihernandez', 'Xavi Hernández (Barcelona)'],
  ['javierhernandezxavi', 'Xavi Hernández'],
  ['carlespuyol', 'Carles Puyol (Barcelona)'],
  ['sergiobusquets', 'Sergio Busquets (Barcelona)'],
  ['gerardpique', 'Gerard Piqué (Barcelona)'],
  ['neymarjr', 'Neymar Jr (ex-Barcelona)'],
  ['neymarjunior', 'Neymar Junior'],
  ['neymardasilva', 'Neymar da Silva'],
  ['frenkiedejong', 'Frenkie de Jong (Barcelona)'],
  ['pedrigonzalez', 'Pedri González (Barcelona)'],
  ['robertlewandowski', 'Robert Lewandowski (Barcelona)'],
  ['memphisdepay', 'Memphis Depay (ex-Barcelona)'],
  ['jordialba', 'Jordi Alba (ex-Barcelona)'],
  ['marcandretersgegen', 'Marc-André ter Stegen (Barcelona)'],
  ['ousmanedembele', 'Ousmane Dembélé (ex-Barcelona)'],
  ['danialves', 'Dani Alves (ex-Barcelona)'],
  ['samueletoo', 'Samuel Eto\'o (ex-Barcelona)'],
  ['hristostoichkov', 'Hristo Stoichkov (ex-Barcelona)'],
  ['patrickkluivert', 'Patrick Kluivert (ex-Barcelona)'],
  ['rivaldoferreira', 'Rivaldo (ex-Barcelona)'],
  ['romariodesouza', 'Romário (ex-Barcelona)'],
  ['johancruyff', 'Johan Cruyff (leyenda Barcelona)'],
  ['jordicruyff', 'Jordi Cruyff'],
  ['ronaldkoeman', 'Ronald Koeman (ex-Barcelona)'],
  ['frankrijkaard', 'Frank Rijkaard (ex-Barcelona)'],
  ['joanlaporta', 'Joan Laporta (presidente Barcelona)'],
  ['santjoanlaporta', 'Sant Joan Laporta'],
  ['xavisimons', 'Xavi Simons'],
  ['ericgarcia', 'Eric García (Barcelona)'],
  ['gavipablopaez', 'Gavi (Pablo Páez)'],
  ['ferantorres', 'Ferran Torres (Barcelona)'],
  ['ferran torres', 'Ferran Torres'],
  ['raphinhabelloli', 'Raphinha (Barcelona)'],
  ['serginoleon', 'Sergi Roberto'],
  ['sergiroberto', 'Sergi Roberto'],
  ['jordialba', 'Jordi Alba'],

  // ── Apellidos únicos suficientes para identificar (sin riesgo de falso
  //     positivo en nombres civiles españoles)
  ['ronaldinho', 'Ronaldinho (ex-Barcelona)'],
  ['rivaldo', 'Rivaldo (ex-Barcelona, distintivo)'],
  ['romario', 'Romário (ex-Barcelona, distintivo)'],
  ['stoichkov', 'Stoichkov (ex-Barcelona, distintivo)'],
  ['kluivert', 'Kluivert (ex-Barcelona)'],
  ['lewandowski', 'Lewandowski (Barcelona)'],

  // ── Atlético de Madrid (rival ciudad)
  ['diegopablosimeone', 'Diego Pablo Simeone (Atlético)'],
  ['cholosimeone', 'Cholo Simeone (Atlético)'],
  ['diegocosta', 'Diego Costa (Atlético)'],
  ['saulniguez', 'Saúl Ñíguez (Atlético)'],
  ['saulnniguez', 'Saúl Ñíguez variante'],
  ['fernandotorres', 'Fernando Torres (ex-Atlético)'],
  ['kokeresurreccion', 'Koke Resurrección (Atlético)'],
  ['yannickcarrasco', 'Yannick Carrasco (Atlético)'],
  ['oblakjan', 'Jan Oblak (Atlético)'],
  ['janoblak', 'Jan Oblak'],
  ['antoinegriezmann', 'Antoine Griezmann (Atlético)'],
  ['griezmannantoine', 'Antoine Griezmann'],
  ['joaomariofelix', 'João Félix'],
  ['joaofelix', 'João Félix (ex-Atlético)'],
  ['memphisdepayatleti', 'Memphis Depay (Atlético)'],

  // ── Ex-presidentes problemáticos (en clave de mofa)
  ['floriperezdimision', 'Florentino Pérez dimisión (chant)'],
  ['florentinodimision', 'Florentino dimisión'],
  ['florivete', 'Florentino vete'],
  ['florentinoladron', 'Florentino ladrón (insulto)'],
  ['floriladrón', 'Floriladrón'],
];

// ─── Chants antimadridistas / pro-rivales ──────────────────────────────────
export const antiMadridChants = [
  ['halabarca', '"Hala Barça"'],
  ['halabarsa', '"Hala Barsa"'],
  ['viscaelbarca', '"Visca el Barça"'],
  ['viscaelbarsa', '"Visca el Barsa"'],
  ['forcabarca', '"Força Barça"'],
  ['forsabarca', '"Forsa Barça"'],
  ['mesqueunclub', '"Més que un club"'],
  ['masqueunclub', '"Más que un club"'],
  ['catalunyaindependent', '"Catalunya Independent"'],
  ['cataluniaindependiente', '"Cataluña Independiente"'],
  ['independenciacatalunya', '"Independencia Catalunya"'],
  ['boycottbernabeu', '"Boycott Bernabéu"'],
  ['boycotbernabeu', '"Boycot Bernabéu"'],
  ['madriddemierda', '"Madrid de mierda"'],
  ['madridmierda', '"Madrid mierda"'],
  ['merenguemierda', '"Merengue mierda"'],
  ['vikingosmierda', '"Vikingos de mierda" (anti-Madrid)'],
  ['putomadrid', '"Puto Madrid"'],
  ['putosblancos', '"Putos blancos"'],
  ['putoflorentino', '"Puto Florentino"'],
  ['atletigrandeza', '"Atleti grandeza" (chant rival)'],
  ['arribaelatleti', '"Arriba el Atleti"'],
  ['indiosatleti', '"Indios Atleti" (mote)'],
  ['lasentencia', '"La sentencia" (referencia anti-Madrid)'],
];
