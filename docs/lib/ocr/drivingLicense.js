// ──────────────────────────────────────────────────────────────────────────
//  Permiso de conducir — multi-país
// ──────────────────────────────────────────────────────────────────────────
//
// Formato UE armonizado (Directiva 2006/126/CE, en vigor desde enero
// de 2013): todos los países de la UE usan numeración estándar de los
// campos:
//
//   1. Apellido(s)
//   2. Nombre(s)
//   3. Fecha y lugar de nacimiento
//   4a. Fecha de expedición
//   4b. Fecha de caducidad
//   4c. Autoridad emisora
//   5. Número del permiso
//   9. Categorías
//
// Los labels están en el idioma del país (en cada idioma de la UE) pero
// los NÚMEROS DE CAMPO son universales. Esto facilita el parsing:
// cualquier "1." seguido de un nombre es el apellido, etc.
//
// Para USA / UK / otros sin numeración UE, parseamos por labels
// específicos del país.

import {
  toLines,
  cleanLine,
  indexLabels,
  findValueAfter,
  parseDateLine,
  looksLikePersonName,
  TRAP_WORDS,
} from './identityCommon.js';
import { LABEL_REGEX, TYPE_HINT_REGEX } from './identityLabels.js';

/**
 * Detecta el formato UE armonizado por los marcadores "1.", "2.", "5.".
 */
function looksLikeEuLicense(text) {
  // Tres marcadores numéricos consecutivos (algunos OCR los pegan)
  return (
    /(?:^|\s)1[.)]\s*[A-ZÁÉÍÓÚÑ]/m.test(text) &&
    /(?:^|\s)2[.)]\s*[A-ZÁÉÍÓÚÑ]/m.test(text) &&
    /(?:^|\s)5[.)]\s*\d/m.test(text)
  );
}

/**
 * Categorías estándar UE: AM, A1, A2, A, B1, B, BE, C1, C, CE, C1E,
 * D1, D, DE, D1E. Útil para confirmar que es un carnet de conducir
 * (no un DNI).
 */
const CATEGORIES_RE = /\b(?:AM|A1|A2|A|B1|BE|C1E|CE|C1|C|D1E|DE|D1|D|B)\b/g;
function countCategories(text) {
  const matches = String(text || '').match(CATEGORIES_RE);
  return matches ? matches.length : 0;
}

/**
 * Parser principal de carnet de conducir.
 * Estrategia:
 *   1) ¿Hay indicios "permiso/licencia/permis/license"? Si no, null.
 *   2) ¿Es formato UE armonizado (1./2./5.)? → parser numérico
 *   3) Si no, → parser por labels específicos
 *
 * @param {string} ocrText
 * @returns {Object|null}
 */
export function parseDrivingLicense(ocrText) {
  if (!ocrText) return null;
  const lines = toLines(ocrText);
  if (lines.length < 3) return null;
  const fullText = lines.join(' ');

  // ── Indicio fundamental: ¿es un permiso de conducir?
  const isLicense = TYPE_HINT_REGEX.drivingLicense.test(fullText);
  const numCategories = countCategories(fullText);
  // Si hay 3+ categorías E/UE listadas, casi seguro es carnet (aunque
  // no haya texto "Driving License" identificable).
  if (!isLicense && numCategories < 3) return null;

  const result = {
    type: 'DRIVING_LICENSE',
    surname: '',
    given: '',
    fullName: '',
    birthDate: null,
    issueDate: null,
    expiryDate: null,
    documentNumber: '',
    categories: [],
    issuingCountry: '',
    score: (isLicense ? 15 : 0) + Math.min(numCategories, 5) * 2,
    evidence: { isLicense, numCategories },
  };

  // ── ESTRATEGIA UE ARMONIZADA (campos numerados)
  if (looksLikeEuLicense(fullText)) {
    parseEuFields(lines, result);
    result.score += 15;
  } else {
    // ── ESTRATEGIA POR LABELS multi-idioma
    parseByLabels(lines, result);
  }

  // ── Composición fullName
  result.fullName = [result.given, result.surname].filter(Boolean).join(' ').trim();

  // ── Categorías (lista única)
  const cats = new Set();
  const matches = fullText.match(CATEGORIES_RE);
  if (matches) {
    for (const c of matches) cats.add(c);
  }
  result.categories = [...cats];

  // ── Score por completitud
  if (result.fullName) result.score += 20;
  if (result.documentNumber) result.score += 10;
  if (result.birthDate) result.score += 5;
  if (result.expiryDate) result.score += 5;
  if (result.categories.length) result.score += 5;

  return result;
}

/**
 * Parser para formato UE armonizado. Cada campo está prefijado con su
 * número (1., 2., 3., 4a., 4b., 4c., 5., 9.).
 */
function parseEuFields(lines, result) {
  // Buscamos las posiciones de cada marcador
  // Patrones tolerantes: "1.", "1)", "1 .", etc.
  const fieldPositions = {};
  const fieldPatterns = {
    surname: /^\s*1\s*[.)]\s*(.*)$/,
    given: /^\s*2\s*[.)]\s*(.*)$/,
    birthInfo: /^\s*3\s*[.)]\s*(.*)$/,
    issueDate: /^\s*4\s*a?\s*[.)]\s*(.*)$/,
    expiryDate: /^\s*4\s*b?\s*[.)]\s*(.*)$/,
    authority: /^\s*4\s*c?\s*[.)]\s*(.*)$/,
    documentNumber: /^\s*5\s*[.)]\s*(.*)$/,
    categories: /^\s*9\s*[.)]\s*(.*)$/,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [field, re] of Object.entries(fieldPatterns)) {
      if (fieldPositions[field] !== undefined) continue;
      const m = line.match(re);
      if (m) {
        const value = cleanLine(m[1]);
        fieldPositions[field] = { idx: i, inline: value };
      }
    }
  }

  // Apellido (campo 1)
  if (fieldPositions.surname) {
    const fp = fieldPositions.surname;
    if (looksLikePersonName(fp.inline)) {
      result.surname = fp.inline;
    } else {
      result.surname = findValueAfter(lines, fp.idx, looksLikePersonName);
    }
  }

  // Nombre (campo 2)
  if (fieldPositions.given) {
    const fp = fieldPositions.given;
    if (looksLikePersonName(fp.inline)) {
      result.given = fp.inline;
    } else {
      result.given = findValueAfter(lines, fp.idx, looksLikePersonName);
    }
  }

  // Fecha de nacimiento (campo 3 — viene con LUGAR opcional)
  if (fieldPositions.birthInfo) {
    const fp = fieldPositions.birthInfo;
    let date = parseDateLine(fp.inline);
    if (!date) {
      for (let i = fp.idx; i < Math.min(fp.idx + 2, lines.length); i++) {
        date = parseDateLine(lines[i]);
        if (date) break;
      }
    }
    if (date) result.birthDate = date;
  }

  // Fecha expedición (campo 4a)
  if (fieldPositions.issueDate) {
    const fp = fieldPositions.issueDate;
    result.issueDate = parseDateLine(fp.inline) ||
      parseDateLine(lines[fp.idx + 1] || '');
  }

  // Fecha caducidad (campo 4b)
  if (fieldPositions.expiryDate) {
    const fp = fieldPositions.expiryDate;
    result.expiryDate = parseDateLine(fp.inline) ||
      parseDateLine(lines[fp.idx + 1] || '');
  }

  // Número del permiso (campo 5)
  if (fieldPositions.documentNumber) {
    const fp = fieldPositions.documentNumber;
    const cleaned = fp.inline.replace(/\s/g, '');
    if (/^[A-Z0-9-]{5,15}$/i.test(cleaned)) {
      result.documentNumber = cleaned.toUpperCase();
    } else {
      for (let i = fp.idx + 1; i < Math.min(fp.idx + 3, lines.length); i++) {
        const c = lines[i].replace(/\s/g, '');
        if (/^[A-Z0-9-]{5,15}$/i.test(c)) {
          result.documentNumber = c.toUpperCase();
          break;
        }
      }
    }
  }
}

/**
 * Parser por LABELS (no UE armonizado): USA, UK, otros formatos. Usa
 * el diccionario multi-idioma genérico.
 */
function parseByLabels(lines, result) {
  const labelHits = indexLabels(lines, {
    surname: LABEL_REGEX.surname,
    given: LABEL_REGEX.given,
    birthDate: LABEL_REGEX.birthDate,
    expiryDate: LABEL_REGEX.expiryDate,
    issueDate: LABEL_REGEX.issueDate,
    documentNumber: LABEL_REGEX.documentNumber,
  });

  if (labelHits.has('surname')) {
    result.surname = findValueAfter(lines, labelHits.get('surname'), looksLikePersonName);
  }
  if (labelHits.has('given')) {
    result.given = findValueAfter(lines, labelHits.get('given'), looksLikePersonName);
  }
  if (labelHits.has('birthDate')) {
    const idx = labelHits.get('birthDate');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d) { result.birthDate = d; break; }
    }
  }
  if (labelHits.has('expiryDate')) {
    const idx = labelHits.get('expiryDate');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d) { result.expiryDate = d; break; }
    }
  }
  if (labelHits.has('issueDate')) {
    const idx = labelHits.get('issueDate');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d) { result.issueDate = d; break; }
    }
  }
}
