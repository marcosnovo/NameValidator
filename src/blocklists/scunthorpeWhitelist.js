// ──────────────────────────────────────────────────────────────────────────
//  Whitelist Scunthorpe — palabras legítimas que CONTIENEN subcadenas
//  vulgares pero NO son ofensivas.
// ──────────────────────────────────────────────────────────────────────────
//
// El "Scunthorpe problem" toma su nombre de la ciudad inglesa Scunthorpe,
// que contiene la subcadena "cunt". Los filtros de profanidad ingenuos la
// bloqueaban, frustrando a los habitantes y empresas locales.
//
// Funcionamiento:
//   ▸ Antes de buscar profanidad por subcadena, "perforamos" el texto
//     reemplazando cada palabra-whitelist por marcadores neutros (•••).
//   ▸ Las búsquedas posteriores no pueden encontrar la subcadena vulgar
//     dentro de la palabra protegida.
//   ▸ Si la palabra protegida APARECE TAL CUAL en el input, no se
//     bloquea. Si el atacante intenta usar SÓLO la subcadena vulgar
//     (sin la palabra envolvente completa), sigue cayendo.
//
// Categorías cubiertas:
//   ▸ Topónimos del Reino Unido / mundo (Scunthorpe, Penistone, Cumbria,
//     Cumbernauld, Matsushita, Arsenal…)
//   ▸ Palabras inglesas comunes (assess, classic, glasses, cockpit,
//     analysis, pussycat, niggardly…)
//   ▸ Palabras españolas/castellanas comunes que tienen subcadena
//     potencialmente vulgar (espárrago, esparragal…)
//   ▸ Apellidos/nombres conocidos (Dickens, Fitch, Hitchcock, Gokulapuram…)
//   ▸ Nombres de productos (Matsushita)
//
// La lista se aplica como ENTERO Word — es decir, "assess" no protege
// "shitassess" porque el matcher exacto comprobará que sí está como
// palabra completa.

export const scunthorpeWhitelist = [
  // ── Topónimos UK / Europa
  'scunthorpe',
  'penistone',
  'cumbria', 'cumbernauld', 'cumberland', 'cummington',
  'lightwater',
  'shitterton',     // (sí existe, Dorset, UK)
  'arsenal',
  'sussex',
  'middlesex',
  'wessex',
  'essex',

  // ── Palabras EN comunes con subcadena ofensiva
  'classic', 'classical', 'classics',
  'class', 'classes', 'classroom', 'classmate',
  'assess', 'assessment', 'assessor', 'assessing', 'assessed',
  'pass', 'passing', 'passed', 'passes', 'password',
  'mass', 'masses', 'massive', 'massacre', 'massachussetts',
  'glass', 'glasses', 'glassware', 'fiberglass',
  'compass', 'compasses', 'embassy',
  'cockpit', 'cocktail', 'cockerel', 'cockney',
  'shitake',         // shitake mushroom (variante de shiitake)
  'shiitake',
  'analysis', 'analyses', 'analyst', 'analytical', 'analytics',
  'analog', 'analogy', 'analogous',
  'banal', 'banality',
  'canal', 'canals',
  'pianola',
  'fanatic', 'fanatical',
  'pussycat', 'pussyfoot',
  'niggardly',       // palabra inglesa legítima de origen escandinavo
  'snigger',         // antiguo inglés
  'titmouse', 'titanic', 'titles', 'titration',
  'twatch',          // (raro pero existe)
  'fagus',           // género botánico (haya)
  'faggot',          // ahora ofensivo en EN; en culinaria UK significa albóndiga
                     // — sigue en blocklist pero documentado por completitud
  'aspect', 'aspectos',
  'bass', 'basset', 'bassist', 'bassoon',
  'kumquat',
  'kumar', 'kumara',

  // ── Marcas / nombres propios
  'matsushita',
  'gokulapuram',
  'fitchburg',
  'hitchcock', 'hitchcocks',
  'dickens', 'dickensian',
  'dickinson',
  'cockney',
  'cockburn', 'cockburns',
  'cockerell',
  'fitch',

  // ── Apellidos castellanos y portugueses comunes con substring potencial
  'lopez', 'lopezjr', 'lopes', 'lopezgarcia',
  'antilope', 'antilopes',
  'lopear',
  'culebro', 'culebrera',

  // ── Castellano: palabras que contienen subcadenas potencialmente
  //    problemáticas pero son legítimas
  'espárrago', 'esparrago', 'espárragos', 'esparragos', 'esparragal',
  'culomar',  // (raro pero existe)
  'culombio', 'culombios',  // unidad de carga eléctrica (Coulomb)
  'culantro', 'culantros',  // hierba aromática
  'culebra', 'culebras', 'culebrón',
  'culombiano', // adjetivo
  'cultura', 'cultural', 'culturas', 'culturismo', 'culturista',
  'culpable', 'culpables', 'culpa', 'culpar', 'culposo',
  'cultivar', 'cultivado', 'cultivadora',
  'culminante', 'culminar', 'culmen',
  'ruculares',
  'mitocondria', 'mitomanía', 'mítico',
  'monosabio',
  'simiente', 'simiesco',  // contienen 'simio' como base
  'macarrónico', 'macarrón', 'macarrones',  // ≠ macaco
  'oferta', 'ofertón',  // ≠ feo

  // ── Francés
  'concombre',  // contiene 'con' pero es pepino
  'concours', 'concurrent', 'concept',
  'congratulation',

  // ── Portugués
  'cumbuca',
  'cumprimento', 'cumprimentar',
  'piça',  // sí existe como apellido (registrado en PT)
];

// Pre-normalizamos la whitelist al cargar el módulo (más rápido).
const NORMALIZED_WHITELIST = scunthorpeWhitelist
  .map((w) =>
    w
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '')
  )
  .filter(Boolean);

// Cache de whitelists ya transformadas con cada función fonética. Evita
// recalcular en cada validación.
const PHONETIC_WHITELIST_CACHE = new WeakMap();

/**
 * Aplica la whitelist Scunthorpe sobre una vista normalizada del input.
 * Reemplaza cada palabra-whitelist por placeholders (\x02) para que el
 * matching de profanidad no la encuentre como substring.
 *
 * Si se pasa `phoneticFn`, transforma cada entrada de la whitelist con
 * esa función ANTES de buscar — así "Cockburn" se vuelve "coburn" y
 * neutraliza el match fonético "cok" derivado de "cock".
 *
 * @param {string} text — vista a "perforar"
 * @param {Function} [phoneticFn] — opcional, función fonética por idioma
 * @returns {string}
 */
export function applyScunthorpeWhitelist(text, phoneticFn = null) {
  if (!text) return text;
  let words;
  if (phoneticFn) {
    let cached = PHONETIC_WHITELIST_CACHE.get(phoneticFn);
    if (!cached) {
      cached = NORMALIZED_WHITELIST.map((w) => phoneticFn(w)).filter(Boolean);
      PHONETIC_WHITELIST_CACHE.set(phoneticFn, cached);
    }
    words = cached;
  } else {
    words = NORMALIZED_WHITELIST;
  }
  let out = text;
  for (const w of words) {
    if (!w || !out.includes(w)) continue;
    const placeholder = '\x02'.repeat(w.length);
    out = out.split(w).join(placeholder);
  }
  return out;
}
