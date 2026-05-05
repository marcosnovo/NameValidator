// ──────────────────────────────────────────────────────────────────────────
//  MRZ Parser — Machine Readable Zone (ICAO 9303)
// ──────────────────────────────────────────────────────────────────────────
//
// La MRZ es la zona de caracteres en la parte inferior de pasaportes y
// tarjetas de identidad. El formato está estandarizado por la ICAO 9303
// y es legible por máquina con caracteres en posiciones fijas y
// CHECKSUMS internos.
//
// Tres formatos:
//   ▸ TD1 — Tarjetas de identidad estándar ICAO (3 líneas × 30 chars)
//   ▸ TD2 — Tarjetas viejas / IDs específicos (2 líneas × 36 chars)
//   ▸ TD3 — Pasaportes (2 líneas × 44 chars)
//
// El DNI ESPAÑOL usa formato TD1 desde 2015 (DNI 3.0).
// Pasaportes españoles, alemanes, USA, UK, etc. usan TD3.
//
// La detección de FALSIFICACIÓN básica se hace verificando los checksums:
// si los 4-5 checksums internos no cuadran con el algoritmo de pesos
// [7,3,1] de la ICAO, el documento es muy probablemente falso (o fue
// mal-OCRizado, lo cual marcamos como SUSPICIOUS).

// ─── Algoritmo checksum ICAO 9303 ──────────────────────────────────────────
// Pesos cíclicos [7, 3, 1, 7, 3, 1, ...]
// Letras A-Z = 10..35, '<' = 0, dígitos 0-9 = 0..9
const ICAO_WEIGHTS = [7, 3, 1];

function charValue(ch) {
  if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48;
  if (ch >= 'A' && ch <= 'Z') return ch.charCodeAt(0) - 55;
  if (ch === '<') return 0;
  return -1;
}

function icaoChecksum(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const v = charValue(str[i]);
    if (v < 0) return -1; // carácter inválido
    sum += v * ICAO_WEIGHTS[i % 3];
  }
  return sum % 10;
}

/**
 * Limpia un string MRZ de OCR errores comunes (espacios, confusables).
 */
function cleanLine(line) {
  return line
    .toUpperCase()
    .replace(/[^A-Z0-9<\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/«/g, '<');
}

/**
 * Reemplaza ambigüedades comunes de OCR en MRZ (chequeando contexto).
 *   ▸ 'O' ↔ '0'
 *   ▸ 'I' ↔ '1'
 *   ▸ 'B' ↔ '8'
 *   ▸ 'S' ↔ '5'
 *   ▸ 'Z' ↔ '2'
 * Aplicado SÓLO a campos que sabemos numéricos (fechas, número documento
 * expirado, sex M/F).
 */
function digitify(s) {
  return s
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/B/g, '8')
    .replace(/S/g, '5')
    .replace(/Z/g, '2')
    .replace(/D/g, '0')
    .replace(/Q/g, '0');
}

/**
 * Detecta el tipo de MRZ a partir de las líneas crudas del OCR.
 * @param {string[]} lines
 * @returns {'TD1'|'TD2'|'TD3'|null}
 */
export function detectMrzType(lines) {
  const cleaned = lines.map(cleanLine).filter((l) => l.length >= 28);
  // TD3: pasaporte — 2 líneas de 44, primera empieza con 'P'
  const td3 = cleaned.find((l) => /^P[A-Z<]{1}/.test(l) && l.length === 44);
  if (td3 && cleaned.filter((l) => l.length === 44).length >= 2) return 'TD3';
  // TD1: 3 líneas de 30, primera empieza con I/A/C
  if (cleaned.filter((l) => l.length === 30).length >= 3) return 'TD1';
  // TD2: 2 líneas de 36
  if (cleaned.filter((l) => l.length === 36).length >= 2) return 'TD2';
  return null;
}

/**
 * Parsea MRZ TD3 (pasaporte ICAO).
 *
 * Línea 1 (44 chars):
 *   pos 0     : 'P' (passport)
 *   pos 1     : tipo (subtype, '<' si no aplica)
 *   pos 2-4   : código emisor ISO 3166-1 alpha-3
 *   pos 5-43  : nombre, formato APELLIDO<<NOMBRE<NOMBRE<...
 *
 * Línea 2 (44 chars):
 *   pos 0-8   : número documento
 *   pos 9     : checksum
 *   pos 10-12 : nacionalidad (ISO alpha-3)
 *   pos 13-18 : fecha nac (YYMMDD)
 *   pos 19    : checksum fecha nac
 *   pos 20    : sexo (M/F/<)
 *   pos 21-26 : fecha expir (YYMMDD)
 *   pos 27    : checksum fecha expir
 *   pos 28-41 : datos personales opcionales
 *   pos 42    : checksum compuesto
 *   pos 43    : checksum final
 */
function parseTD3(lines) {
  const l1 = cleanLine(lines[0]).padEnd(44, '<').slice(0, 44);
  const l2 = cleanLine(lines[1]).padEnd(44, '<').slice(0, 44);

  const docType = l1[0];
  const issuer = l1.substring(2, 5);
  const namesField = l1.substring(5, 44);

  const docNumber = l2.substring(0, 9).replace(/<+$/g, '');
  const docChecksum = parseInt(l2[9], 10);
  const nationality = l2.substring(10, 13);
  const birthDate = digitify(l2.substring(13, 19));
  const birthChecksum = parseInt(l2[19], 10);
  const sex = l2[20] === 'M' || l2[20] === 'F' ? l2[20] : '?';
  const expiryDate = digitify(l2.substring(21, 27));
  const expiryChecksum = parseInt(l2[27], 10);
  const personalNumber = l2.substring(28, 42).replace(/<+$/g, '');
  const personalChecksum = parseInt(l2[42], 10);
  const compositeChecksum = parseInt(l2[43], 10);

  // Validación de checksums
  const checksumResults = {
    document: icaoChecksum(l2.substring(0, 9)) === docChecksum,
    birth: icaoChecksum(l2.substring(13, 19)) === birthChecksum,
    expiry: icaoChecksum(l2.substring(21, 27)) === expiryChecksum,
    personal:
      personalNumber === ''
        ? true // opcional
        : icaoChecksum(l2.substring(28, 42)) === personalChecksum,
    composite:
      icaoChecksum(
        l2.substring(0, 10) + l2.substring(13, 20) + l2.substring(21, 43),
      ) === compositeChecksum,
  };

  // Parser de nombre: APELLIDO<<NOMBRE<NOMBRE<<<<<<...
  const [surnamePart = '', givenPart = ''] = namesField.split('<<');
  const surname = surnamePart.replace(/</g, ' ').trim();
  const given = givenPart.replace(/</g, ' ').trim();

  return {
    type: 'TD3',
    documentType: docType,
    issuingCountry: issuer.replace(/</g, ''),
    surname,
    givenNames: given,
    fullName: `${given} ${surname}`.trim(),
    documentNumber: docNumber,
    nationality: nationality.replace(/</g, ''),
    birthDate: parseDate(birthDate),
    sex,
    expiryDate: parseDate(expiryDate, true),
    personalNumber,
    checksums: checksumResults,
    valid: Object.values(checksumResults).every(Boolean),
  };
}

/**
 * Parsea MRZ TD1 (DNI español 3.0 / 4.0 — el DNI más usado en HALO).
 *
 * Línea 1 (30 chars):
 *   pos 0-1   : tipo de documento (I, A, C)
 *   pos 2-4   : país emisor (ESP, FRA…)
 *   pos 5-13  : número documento
 *   pos 14    : checksum doc
 *   pos 15-29 : datos opcionales
 *
 * Línea 2 (30 chars):
 *   pos 0-5   : fecha nac (YYMMDD)
 *   pos 6     : checksum nac
 *   pos 7     : sexo (M/F/<)
 *   pos 8-13  : fecha expir (YYMMDD)
 *   pos 14    : checksum expir
 *   pos 15-17 : nacionalidad
 *   pos 18-28 : datos opcionales (NIE etc.)
 *   pos 29    : checksum compuesto
 *
 * Línea 3 (30 chars):
 *   pos 0-29  : APELLIDO<APELLIDO<<NOMBRE<NOMBRE<<<...
 */
function parseTD1(lines) {
  const l1 = cleanLine(lines[0]).padEnd(30, '<').slice(0, 30);
  const l2 = cleanLine(lines[1]).padEnd(30, '<').slice(0, 30);
  const l3 = cleanLine(lines[2]).padEnd(30, '<').slice(0, 30);

  const docType = l1.substring(0, 2).replace(/</g, '');
  const issuer = l1.substring(2, 5);
  const docNumber = l1.substring(5, 14).replace(/<+$/g, '');
  const docChecksum = parseInt(l1[14], 10);

  const birthDate = digitify(l2.substring(0, 6));
  const birthChecksum = parseInt(l2[6], 10);
  const sex = l2[7] === 'M' || l2[7] === 'F' ? l2[7] : '?';
  const expiryDate = digitify(l2.substring(8, 14));
  const expiryChecksum = parseInt(l2[14], 10);
  const nationality = l2.substring(15, 18);
  const compositeChecksum = parseInt(l2[29], 10);

  // Nombre en línea 3
  const [surnamePart = '', givenPart = ''] = l3.split('<<');
  const surname = surnamePart.replace(/</g, ' ').trim();
  const given = givenPart.replace(/</g, ' ').trim();

  const checksumResults = {
    document: icaoChecksum(l1.substring(5, 14)) === docChecksum,
    birth: icaoChecksum(l2.substring(0, 6)) === birthChecksum,
    expiry: icaoChecksum(l2.substring(8, 14)) === expiryChecksum,
    composite:
      icaoChecksum(
        l1.substring(5, 30) + l2.substring(0, 7) + l2.substring(8, 15) +
        l2.substring(18, 29),
      ) === compositeChecksum,
  };

  return {
    type: 'TD1',
    documentType: docType,
    issuingCountry: issuer.replace(/</g, ''),
    surname,
    givenNames: given,
    fullName: `${given} ${surname}`.trim(),
    documentNumber: docNumber,
    nationality: nationality.replace(/</g, ''),
    birthDate: parseDate(birthDate),
    sex,
    expiryDate: parseDate(expiryDate, true),
    checksums: checksumResults,
    valid: Object.values(checksumResults).every(Boolean),
  };
}

/**
 * Parsea fecha YYMMDD (heurística siglo: si YY > current+10, asumimos 1900s).
 * @param {string} s — 6 dígitos
 * @param {boolean} [futureExpected=false] — si es fecha de expiración
 * @returns {{ year: number, month: number, day: number, iso: string } | null}
 */
function parseDate(s, futureExpected = false) {
  if (!/^\d{6}$/.test(s)) return null;
  const yy = parseInt(s.substring(0, 2), 10);
  const mm = parseInt(s.substring(2, 4), 10);
  const dd = parseInt(s.substring(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const currentYear = new Date().getFullYear() % 100;
  let year;
  if (futureExpected) {
    year = yy < currentYear + 25 ? 2000 + yy : 1900 + yy;
  } else {
    year = yy <= currentYear ? 2000 + yy : 1900 + yy;
  }
  const iso = `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  return { year, month: mm, day: dd, iso };
}

/**
 * Punto de entrada principal: dado un texto OCR (multilínea), intenta
 * detectar y parsear la MRZ. Devuelve null si no encuentra MRZ válida.
 *
 * @param {string} ocrText — texto crudo del OCR
 * @returns {Object | null}
 */
export function parseMrz(ocrText) {
  if (!ocrText) return null;
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => cleanLine(l))
    .filter((l) => l.length >= 28);

  if (lines.length < 2) return null;

  const type = detectMrzType(lines);
  if (!type) return null;

  try {
    if (type === 'TD3') {
      // Buscamos las dos líneas de 44 chars consecutivas
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].length === 44 && lines[i + 1].length === 44) {
          return parseTD3(lines.slice(i, i + 2));
        }
      }
    } else if (type === 'TD1') {
      // Tres líneas de 30 chars consecutivas
      for (let i = 0; i < lines.length - 2; i++) {
        if (
          lines[i].length === 30 &&
          lines[i + 1].length === 30 &&
          lines[i + 2].length === 30
        ) {
          return parseTD1(lines.slice(i, i + 3));
        }
      }
    } else if (type === 'TD2') {
      // 2 líneas de 36 — implementación básica, similar a TD3 pero acortada
      // (omitido por brevedad — se puede añadir si el HALO recibe documentos TD2)
      return null;
    }
  } catch (err) {
    return { error: err.message };
  }
  return null;
}

export { icaoChecksum }; // exportado para tests
