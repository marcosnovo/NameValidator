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
    tokens,               // ['aitor', 'tilla']
  };
}

export { buildVariants, stripDiacritics, deLeet, lettersOnly };
