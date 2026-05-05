// Normalización del input. Devuelve múltiples vistas del mismo string para
// que las capas posteriores puedan buscar en cada una.

const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '€': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
  '8': 'b',
  '9': 'g',
  '6': 'g',
};

// Quita diacríticos: á→a, é→e, ñ→n, ç→c, ü→u, ø→o…
function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Sustituye caracteres tipo leet por sus letras.
function deLeet(s) {
  let out = '';
  for (const ch of s) out += LEET_MAP[ch] ?? ch;
  return out;
}

// Quita todo lo que no sea letra (incluye dígitos y puntuación).
function lettersOnly(s) {
  return s.replace(/[^a-z]/g, '');
}

// Colapsa espacios y trim.
function collapseSpaces(s) {
  return s.replace(/\s+/g, ' ').trim();
}

// Quita repeticiones excesivas (aaaaaa → aa) para detectar elongaciones.
function dedupeRuns(s) {
  return s.replace(/(.)\1{2,}/g, '$1$1');
}

// ──── Normalizaciones fonéticas por idioma ────────────────────────────────
// Cada función toma un string ya en minúsculas, sin acentos y sin leet, y
// devuelve la "forma canónica fonética" para ese idioma. La capa estática
// busca en paralelo en la forma directa Y en la forma fonética, así
// "devora melo" matchea "deboramelo", "Carlos Gil Hipoyas" matchea
// "gilipollas", "Warra" matchea "guarra", etc.

// Castellano de España. Equivalencias:
//   - v ↔ b (homófonos)
//   - h muda (excepto en "ch")
//   - ll ↔ y (yeísmo)
//   - z, c+(e|i) → s (seseo — útil para variantes LatAm)
//   - ñ → n
//   - qu+(e|i) → k, y q → k
//   - w → gu (slang: "wapo"="guapo", "warra"="guarra")
function phoneticEs(s) {
  if (!s) return '';
  return s
    .replace(/ll/g, 'y')                  // 1. ll → y
    .replace(/ch/g, '\x01')               // 2. proteger "ch" temporalmente
    .replace(/h/g, '')                    // 3. quitar h muda
    .replace(/\x01/g, 'ch')               // 4. restaurar "ch"
    .replace(/v/g, 'b')                   // 5. v → b
    .replace(/c(?=[ei])/g, 's')           // 6. ce/ci → se/si
    .replace(/z/g, 's')                   //    z → s
    .replace(/ñ/g, 'n')                   // 7. ñ → n
    .replace(/qu(?=[ei])/g, 'k')          // 8. qu+e/i → k+e/i
    .replace(/q/g, 'k')                   //    resto de q → k
    .replace(/w/g, 'gu');                 // 9. w → gu (slang castellano)
}

// Inglés. Más conservador — sólo sonidos donde la ortografía oculta:
//   - ph → f ("Phil" sonaría como "Fil")
//   - ck → k
//   - kn al inicio → n ("knight" sonaría como "night")
//   - silent gh ("though" → "tho")
//   - dobles consonantes colapsadas (ll, mm, nn, pp, ss, tt, cc, ff, gg, dd
//     a una sola). Defiende contra typing variations: McCavity vs Mecavity.
function phoneticEn(s) {
  if (!s) return '';
  return s
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/^kn/g, 'n')
    .replace(/gh(?=t|$)/g, '')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Francés. Las consonantes finales mudas son demasiado variables para una
// regla simple, así que cubrimos lo más útil:
//   - qu → k ("Jacques" sonaría como "zhak"…)
//   - ç → s
//   - x → ks (en pocos casos)
//   - ph → f
function phoneticFr(s) {
  if (!s) return '';
  return s
    .replace(/qu/g, 'k')
    .replace(/ç/g, 's')
    .replace(/ph/g, 'f');
}

// Portugués (BR + EU). Equivalencias:
//   - h muda (igual que en castellano, en PT la h es prácticamente muda)
//   - nh → n (sonido similar a ñ — "Sonho" → "Sono")
//   - lh → l (palatalizada — "Filho" → "Filo")
//   - ç → s
//   - ã, õ ya se han eliminado por stripDiacritics → a, o
//   - x suele sonar como "ch" pero la regla es muy variable — la dejamos
//   - ss → s (sonido único)
function phoneticPt(s) {
  if (!s) return '';
  return s
    .replace(/nh/g, 'n')
    .replace(/lh/g, 'l')
    .replace(/ch/g, '\x01')
    .replace(/h/g, '')
    .replace(/\x01/g, 'ch')
    .replace(/ç/g, 's')
    .replace(/ss/g, 's');
}

// Genera todas las particiones por espacio y devuelve las re-segmentaciones
// posibles deslizando el corte. Útil para que el motor de concat no dependa
// de los espacios elegidos por el usuario.
//
// Ej: "AitorTilla" o "Aitor Tilla" o "A I Tortilla" colapsan al mismo
// `concatNoSpaces` ⇒ aitortilla.
function buildVariants(raw) {
  if (typeof raw !== 'string') raw = String(raw ?? '');

  const trimmed = collapseSpaces(raw);
  const lower = trimmed.toLowerCase();
  const noDiacritics = stripDiacritics(lower);
  const deLeeted = deLeet(noDiacritics);
  const concatNoSpaces = lettersOnly(deLeeted);
  const dedupedConcat = dedupeRuns(concatNoSpaces);
  const reversedConcat = concatNoSpaces.split('').reverse().join('');
  const phoneticEsView = phoneticEs(concatNoSpaces);
  const phoneticEnView = phoneticEn(concatNoSpaces);
  const phoneticFrView = phoneticFr(concatNoSpaces);
  const phoneticPtView = phoneticPt(concatNoSpaces);

  // Versión "tokenizada": separa por espacio y filtra vacíos.
  const tokens = deLeeted.split(' ').map(lettersOnly).filter(Boolean);

  return {
    raw,                  // tal cual lo escribió el usuario
    trimmed,              // sin espacios redundantes
    lower,                // minúsculas
    noDiacritics,         // sin acentos
    deLeeted,             // sin sustituciones leet
    concatNoSpaces,       // todo junto, sólo letras  ←  ★ la vista clave
    dedupedConcat,        // con runs colapsados
    reversedConcat,       // al revés
    phoneticEs: phoneticEsView, // ★ b↔v, h muda, ll→y, w→gu, seseo
    phoneticEn: phoneticEnView, //   ph→f, ck→k
    phoneticFr: phoneticFrView, //   qu→k, ç→s, ph→f
    phoneticPt: phoneticPtView, //   nh→n, lh→l, h muda, ç→s
    tokens,               // ['aitor', 'tilla']
  };
}

export {
  buildVariants,
  stripDiacritics,
  deLeet,
  lettersOnly,
  phoneticEs,
  phoneticEn,
  phoneticFr,
  phoneticPt,
};
