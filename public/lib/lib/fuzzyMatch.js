// ──────────────────────────────────────────────────────────────────────────
//  Fuzzy matching con Levenshtein ≤1 (1 edit distance)
// ──────────────────────────────────────────────────────────────────────────
//
// Atrapa typos comunes de profanidad:
//   ▸ "fukc"  (transposición)  ↔ "fuck"
//   ▸ "fyck"  (sustitución)    ↔ "fuck"
//   ▸ "fuc"   (deleción)       ↔ "fuck"
//   ▸ "fucks" (inserción)      ↔ "fuck"  (ya cubierto si "fucks" está)
//
// Para nuestro caso de uso (~1.500 patterns × input <60 chars), usamos
// brute force: para cada palabra de la blocklist, deslizamos por el input
// y comprobamos si alguna ventana de longitud len(palabra)±1 tiene
// distancia Levenshtein ≤ 1.
//
// Optimización: pre-filtramos por longitud (|word.len - window.len| ≤ 1)
// y por primer/último carácter (suelen no cambiar en typos).
//
// Costo: ~O(n × |word| × c) donde c es small por las podas. Con 1.500
// patterns × 60 chars × ~4 ventanas = ~360k operaciones por validación.
// En la práctica <5ms y ejecutamos sólo si las capas anteriores no
// bloquearon.

/**
 * Calcula la distancia Levenshtein entre dos strings, con corte temprano
 * cuando excede `maxDist`. Si excede, devuelve maxDist+1.
 *
 * @param {string} a
 * @param {string} b
 * @param {number} maxDist — máximo a calcular (corte temprano)
 * @returns {number}
 */
export function levenshtein(a, b, maxDist = 2) {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > maxDist) return maxDist + 1;

  // Caso simple: misma longitud, sólo sustituciones.
  if (lenA === lenB) {
    let diff = 0;
    for (let i = 0; i < lenA; i++) {
      if (a[i] !== b[i]) {
        diff++;
        if (diff > maxDist) return maxDist + 1;
      }
    }
    return diff;
  }

  // Caso general: DP con dos filas. Siempre len(a) ≤ len(b).
  if (lenA > lenB) return levenshtein(b, a, maxDist);

  let prev = new Array(lenA + 1);
  let cur = new Array(lenA + 1);
  for (let i = 0; i <= lenA; i++) prev[i] = i;

  for (let j = 1; j <= lenB; j++) {
    cur[0] = j;
    let minInRow = j;
    for (let i = 1; i <= lenA; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[i] = Math.min(
        prev[i] + 1,        // deleción en a
        cur[i - 1] + 1,     // inserción en a
        prev[i - 1] + cost  // sustitución
      );
      if (cur[i] < minInRow) minInRow = cur[i];
    }
    if (minInRow > maxDist) return maxDist + 1;
    [prev, cur] = [cur, prev];
  }
  return prev[lenA];
}

/**
 * ¿Hay alguna subcadena del haystack cuya distancia Levenshtein con el
 * needle sea ≤ maxDist? Sólo considera ventanas de longitud
 * needle.length ± maxDist.
 *
 * @param {string} haystack — texto largo en el que buscar
 * @param {string} needle — palabra a buscar
 * @param {number} maxDist — máxima edit distance (default 1)
 * @returns {boolean}
 */
export function fuzzyContains(haystack, needle, maxDist = 1) {
  if (!haystack || !needle) return false;
  if (haystack.includes(needle)) return true; // shortcut
  if (needle.length < 4) return false;        // demasiado corto para fuzzy
  const minLen = Math.max(1, needle.length - maxDist);
  const maxLen = needle.length + maxDist;
  // Slide ventanas de longitud entre minLen y maxLen.
  for (let len = minLen; len <= maxLen; len++) {
    if (len > haystack.length) break;
    for (let start = 0; start + len <= haystack.length; start++) {
      const window = haystack.substring(start, start + len);
      // Pre-filtrado barato: primer y último carácter suelen igualar.
      if (window[0] !== needle[0] && window[len - 1] !== needle[needle.length - 1]) {
        continue; // typo en ambos extremos = improbable
      }
      if (levenshtein(window, needle, maxDist) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}
