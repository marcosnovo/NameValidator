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

// Normalización fonética castellana: aplica las equivalencias de sonido del
// español de España para que "devora melo" matchee "deboramelo", "yo me
// llamo" matchee "yomeyamo", etc. Reglas aplicadas:
//   - v → b (b/v son homófonos en castellano)
//   - h → '' EXCEPTO cuando va precedida de c (mantenemos "ch")
//   - ll → y (yeísmo)
//   - z → s y c+(e|i) → s (seseo — útil para variantes LatAm; en España
//     se usa ortografía con z/c, pero algunos nombres-broma juegan con eso)
//   - ñ → n (defensa contra escapes tipo "ñ" → "n")
//
// Esta función se aplica sobre `concatNoSpaces` (todo junto, ya sin
// acentos ni leet), generando una vista paralela contra la que también
// buscamos.
function phoneticEs(s) {
  if (!s) return '';
  return s
    // 1. ll → y (antes de tocar las "l")
    .replace(/ll/g, 'y')
    // 2. ch → 'CHX' temporalmente para protegerla del paso 3 que borra h
    .replace(/ch/g, 'CHX')
    // 3. quita h muda en cualquier otra posición
    .replace(/h/g, '')
    // 4. restaura ch
    .replace(/CHX/g, 'ch')
    // 5. v → b
    .replace(/v/g, 'b')
    // 6. ce/ci → se/si y z → s (seseo)
    .replace(/c(?=[ei])/g, 's')
    .replace(/z/g, 's')
    // 7. ñ → n
    .replace(/ñ/g, 'n')
    // 8. qu+(e|i) → k+(e|i)  (para que "que" matchee "ke"-leet)
    .replace(/qu(?=[ei])/g, 'k')
    .replace(/q/g, 'k');
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
    phoneticEs: phoneticEsView, // ★ b↔v, h muda, ll→y, seseo
    tokens,               // ['aitor', 'tilla']
  };
}

export { buildVariants, stripDiacritics, deLeet, lettersOnly, phoneticEs };
