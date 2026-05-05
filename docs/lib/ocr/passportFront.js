// ──────────────────────────────────────────────────────────────────────────
//  Pasaporte — parser de la página de datos (front side, no MRZ)
// ──────────────────────────────────────────────────────────────────────────
//
// La página de datos del pasaporte tiene la MRZ abajo (parseada por mrz.js)
// PERO ARRIBA tiene los mismos campos en TEXTO LEGIBLE con etiquetas.
// Este parser cubre el caso (frecuente) en que el OCR no puede leer
// limpiamente la MRZ (mucha glare, foto torcida, etc.) pero SÍ lee los
// labels visibles arriba.
//
// La inmensa mayoría de pasaportes del mundo usan etiquetas BILINGÜES
// inglés + idioma local. Ejemplo (España):
//
//   Surname / Apellidos        ESPAÑOL ESPAÑOL
//   Given names / Nombres      JUAN
//   Nationality / Nacionalidad ESPAÑOLA
//   Date of birth / Fecha…     10 ENE 1950
//   Sex / Sexo                 M
//   Place of birth / Lugar…    MADRID
//   Date of issue              17 04 2008
//   Date of expiry             17 04 2018
//   Passport No. / N°          AAA000000

import {
  toLines,
  indexLabels,
  findValueAfter,
  findValueInline,
  parseDateLine,
  looksLikePersonName,
  findIsoCountryCode,
} from './identityCommon.js';
import { LABEL_REGEX, TYPE_HINT_REGEX } from './identityLabels.js';

/**
 * Extrae un número de pasaporte de una línea. Si la línea contiene varios
 * tokens (e.g. "P GBR 123456789"), elige el más probable (el más largo
 * y predominantemente numérico).
 */
function extractPassportNumber(line) {
  if (!line) return '';
  const tokens = String(line).toUpperCase().split(/[\s\/.,;:|\\-]+/).filter(Boolean);
  let best = '';
  for (const t of tokens) {
    const cleaned = t.replace(/[^A-Z0-9]/g, '');
    if (cleaned.length < 5 || cleaned.length > 14) continue;
    // Los números de pasaporte SIEMPRE contienen al menos un dígito.
    // Esto descarta tokens-palabra como "PASSPORT", "SURNAME", "BRITISH".
    if (!/\d/.test(cleaned)) continue;
    if (cleaned.length > best.length) best = cleaned;
  }
  return best;
}

/**
 * Parsea la página de datos de un pasaporte a partir del texto OCR.
 * Devuelve null si NO parece pasaporte.
 *
 * @param {string} ocrText
 * @returns {Object|null}
 */
export function parsePassportFront(ocrText) {
  if (!ocrText) return null;
  const lines = toLines(ocrText);
  if (lines.length < 3) return null;
  const fullText = lines.join(' ');

  // Necesitamos al menos 1 indicio de "passport" para descartar otros docs
  const hintRegex = TYPE_HINT_REGEX.passport;
  if (!hintRegex.test(fullText)) return null;

  const labelHits = indexLabels(lines, {
    surname: LABEL_REGEX.surname,
    given: LABEL_REGEX.given,
    nationality: LABEL_REGEX.nationality,
    birthDate: LABEL_REGEX.birthDate,
    expiryDate: LABEL_REGEX.expiryDate,
    issueDate: LABEL_REGEX.issueDate,
    documentNumber: LABEL_REGEX.documentNumber,
    sex: LABEL_REGEX.sex,
  });

  const result = {
    type: 'PASSPORT_FRONT',
    surname: '',
    given: '',
    fullName: '',
    nationality: '',
    birthDate: null,
    expiryDate: null,
    issueDate: null,
    documentNumber: '',
    sex: '',
    score: hintRegex.test(fullText) ? 10 : 0,
    evidence: { labelsFound: labelHits.size },
  };

  // ── Nombres: a veces los pasaportes tienen el valor en la MISMA línea
  //    que el label, otras veces en la línea siguiente. Probamos ambos.
  if (labelHits.has('surname')) {
    const idx = labelHits.get('surname');
    const inlineVal = findValueInline(lines[idx], LABEL_REGEX.surname);
    if (inlineVal && looksLikePersonName(inlineVal)) {
      result.surname = inlineVal;
    } else {
      result.surname = findValueAfter(lines, idx, looksLikePersonName);
    }
  }
  if (labelHits.has('given')) {
    const idx = labelHits.get('given');
    const inlineVal = findValueInline(lines[idx], LABEL_REGEX.given);
    if (inlineVal && looksLikePersonName(inlineVal)) {
      result.given = inlineVal;
    } else {
      result.given = findValueAfter(lines, idx, looksLikePersonName);
    }
  }

  // ── Compón fullName
  result.fullName = [result.given, result.surname].filter(Boolean).join(' ').trim();

  // ── Fechas
  if (labelHits.has('birthDate')) {
    const idx = labelHits.get('birthDate');
    const inlineDate = parseDateLine(findValueInline(lines[idx], LABEL_REGEX.birthDate));
    if (inlineDate) {
      result.birthDate = inlineDate;
    } else {
      for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
        const d = parseDateLine(lines[i]);
        if (d) { result.birthDate = d; break; }
      }
    }
  }
  if (labelHits.has('expiryDate')) {
    const idx = labelHits.get('expiryDate');
    const inlineDate = parseDateLine(findValueInline(lines[idx], LABEL_REGEX.expiryDate));
    if (inlineDate) {
      result.expiryDate = inlineDate;
    } else {
      for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
        const d = parseDateLine(lines[i]);
        if (d) { result.expiryDate = d; break; }
      }
    }
  }
  if (labelHits.has('issueDate')) {
    const idx = labelHits.get('issueDate');
    for (let i = idx; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d && (!result.issueDate || i > idx)) { result.issueDate = d; break; }
    }
  }

  // ── Nacionalidad: código ISO 3 letras
  if (labelHits.has('nationality')) {
    const idx = labelHits.get('nationality');
    for (let i = idx; i < Math.min(idx + 3, lines.length); i++) {
      const code = findIsoCountryCode(lines[i]);
      if (code) { result.nationality = code; break; }
    }
  }
  // Si no encontró por label, busca código ISO en cualquier línea corta
  if (!result.nationality) {
    for (const l of lines) {
      const code = findIsoCountryCode(l);
      if (code) { result.nationality = code; break; }
    }
  }

  // ── Sexo (M/F)
  if (labelHits.has('sex')) {
    const idx = labelHits.get('sex');
    for (let i = idx; i < Math.min(idx + 3, lines.length); i++) {
      const m = lines[i].match(/(?:^|\W)([MF])(?:$|\W)/);
      if (m) { result.sex = m[1]; break; }
    }
  }

  // ── Número de pasaporte (formato variable por país)
  if (labelHits.has('documentNumber')) {
    const idx = labelHits.get('documentNumber');
    const inline = findValueInline(lines[idx], LABEL_REGEX.documentNumber);
    const candidate = extractPassportNumber(inline);
    if (candidate) {
      result.documentNumber = candidate;
    } else {
      for (let i = idx + 1; i < Math.min(idx + 4, lines.length); i++) {
        const c = extractPassportNumber(lines[i]);
        if (c) { result.documentNumber = c; break; }
      }
    }
  }

  // ── Puntuación de autenticidad
  if (result.fullName) result.score += 25;
  if (result.documentNumber) result.score += 15;
  if (result.birthDate) result.score += 10;
  if (result.expiryDate) result.score += 10;
  if (result.nationality) result.score += 10;

  return result;
}
