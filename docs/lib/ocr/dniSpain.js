// ──────────────────────────────────────────────────────────────────────────
//  DNI / NIE español — validación con algoritmo letra (mod 23)
// ──────────────────────────────────────────────────────────────────────────
//
// Independiente del MRZ. Útil cuando el OCR no consigue capturar la zona
// MRZ pero sí el número visible del DNI (frontal). Sirve también para
// VALIDAR el documentNumber extraído del MRZ.
//
// Formato:
//   ▸ DNI: 8 dígitos + 1 letra (12345678Z)
//   ▸ NIE: X/Y/Z + 7 dígitos + 1 letra (X1234567L)
//
// Algoritmo de la letra: posición = number mod 23, letra = LETTERS[pos]
// donde LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE" (sin I, O, U, Ñ).

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

const NIE_PREFIX = { X: 0, Y: 1, Z: 2 };

const DNI_RE = /^([0-9]{8})([A-Z])$/;
const NIE_RE = /^([XYZ])([0-9]{7})([A-Z])$/;

/**
 * Calcula la letra esperada para un número de DNI.
 * @param {string|number} number — 8 dígitos
 * @returns {string} — la letra
 */
export function dniLetter(number) {
  const n = parseInt(String(number), 10);
  if (Number.isNaN(n)) return '?';
  return DNI_LETTERS[n % 23];
}

/**
 * Valida un DNI/NIE. Devuelve un objeto con validez + tipo + letra
 * esperada para feedback.
 *
 * @param {string} input — el DNI/NIE crudo (con o sin espacios/guiones)
 * @returns {{ valid: boolean, type: 'DNI'|'NIE'|'unknown', given: string,
 *             expectedLetter?: string, providedLetter?: string,
 *             reason?: string }}
 */
export function validateDniNie(input) {
  if (!input) return { valid: false, type: 'unknown', given: '', reason: 'vacío' };
  const cleaned = String(input).toUpperCase().replace(/[\s-]/g, '');

  // ── DNI
  let m = cleaned.match(DNI_RE);
  if (m) {
    const num = m[1];
    const letter = m[2];
    const expected = DNI_LETTERS[parseInt(num, 10) % 23];
    return {
      valid: letter === expected,
      type: 'DNI',
      given: cleaned,
      expectedLetter: expected,
      providedLetter: letter,
      reason: letter === expected ? 'OK' : `letra esperada "${expected}", recibida "${letter}"`,
    };
  }

  // ── NIE
  m = cleaned.match(NIE_RE);
  if (m) {
    const prefix = m[1];
    const num = m[2];
    const letter = m[3];
    const fullNum = NIE_PREFIX[prefix] + num;
    const expected = DNI_LETTERS[parseInt(fullNum, 10) % 23];
    return {
      valid: letter === expected,
      type: 'NIE',
      given: cleaned,
      expectedLetter: expected,
      providedLetter: letter,
      reason: letter === expected ? 'OK' : `letra esperada "${expected}", recibida "${letter}"`,
    };
  }

  return {
    valid: false,
    type: 'unknown',
    given: cleaned,
    reason: 'formato no reconocido como DNI ni NIE',
  };
}

/**
 * Busca un DNI/NIE en un texto OCR cualquiera. Útil cuando OCRizamos la
 * cara frontal de un documento y queremos detectar el número visible.
 *
 * @param {string} text
 * @returns {{ raw: string, validation: ReturnType<typeof validateDniNie> } | null}
 */
export function findDniNieInText(text) {
  if (!text) return null;
  const candidates = [];
  // DNI: 8 dígitos seguidos de letra (con posibles espacios o guiones)
  const dniMatches = [...text.toUpperCase().matchAll(/[0-9]{8}\s*[-]?\s*[A-Z]/g)];
  for (const m of dniMatches) candidates.push(m[0]);
  // NIE: letra inicial + 7 dígitos + letra final
  const nieMatches = [...text.toUpperCase().matchAll(/[XYZ]\s*[-]?\s*[0-9]{7}\s*[-]?\s*[A-Z]/g)];
  for (const m of nieMatches) candidates.push(m[0]);

  for (const c of candidates) {
    const v = validateDniNie(c);
    if (v.valid) return { raw: c, validation: v };
  }
  // Si ninguno valida, devuelve el primero como SOSPECHOSO
  if (candidates.length) {
    return {
      raw: candidates[0],
      validation: validateDniNie(candidates[0]),
    };
  }
  return null;
}
