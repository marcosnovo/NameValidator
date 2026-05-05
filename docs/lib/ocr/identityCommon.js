// ──────────────────────────────────────────────────────────────────────────
//  Helpers comunes para parsers de documentos identificativos
// ──────────────────────────────────────────────────────────────────────────
//
// Funciones reutilizables entre los parsers DNI, pasaporte, carnet de
// conducir, TIE, etc. Toda la lógica genérica de "encontrar valor tras
// label" y "parsear fecha tolerante" vive aquí.

/**
 * Limpia una línea: quita ruido, colapsa espacios, normaliza puntuación.
 */
export function cleanLine(line) {
  return String(line || '')
    .replace(/[|·•\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trap-words que NUNCA son valor (son siempre etiquetas o ruido del fondo).
 * Lista común a todos los documentos.
 */
export const TRAP_WORDS = /\b(documento|nacional|identidad|espana|españa|ministerio|interior|sexo|sex|nacionalidad|nationality|fecha|nacimiento|birth|born|valido|valida|hasta|until|expiry|primer|segundo|first|family|surname|given|nombre|nom|firma|signature|titular|holder|name|date|number|num|nr|idesp|dni|nie|tie|passport|passeport|pasaporte|passaporto|reisepass|carteira|categoria|categories|class|classes|permiso|licence|license|permis|patente|fuhrerschein|führerschein|autoridad|authority|emisora|issued|issuing|delivre|delivré|delivrance|expedicion|expedición|residence|residencia|sejour|séjour|aufenthalt|soggiorno|specimen)\b/i;

/**
 * ¿La línea parece un VALOR válido (no etiqueta, no ruido)?
 */
export function looksLikeValue(line, opts = {}) {
  const { allowDigits = true, minLen = 1, maxLen = 50 } = opts;
  const cleaned = cleanLine(line);
  if (cleaned.length < minLen || cleaned.length > maxLen) return false;
  if (TRAP_WORDS.test(cleaned)) return false;
  if (!/[a-zA-Záéíóúñü0-9]/i.test(cleaned)) return false;
  if (!allowDigits && /\d/.test(cleaned) && !/^[0-9 ]+$/.test(cleaned)) return false;
  return true;
}

/**
 * ¿Línea con apariencia de NOMBRE PROPIO?
 *   - Sólo letras (UTF-8), espacios, apóstrofes, guiones
 *   - 2-50 caracteres
 *   - 1-5 palabras
 *   - cada palabra ≥2 chars
 */
export function looksLikePersonName(line) {
  const cleaned = cleanLine(line);
  if (cleaned.length < 2 || cleaned.length > 50) return false;
  if (/\d/.test(cleaned)) return false;
  if (TRAP_WORDS.test(cleaned)) return false;
  // Letras Unicode + espacios + apóstrofes + guiones
  if (!/^[\p{L}\p{M} '\-]+$/u.test(cleaned)) return false;
  const words = cleaned.split(/\s+/);
  if (words.length < 1 || words.length > 5) return false;
  if (!words.every((w) => w.length >= 2)) return false;
  return true;
}

/**
 * Encuentra el VALOR en las 1-3 líneas posteriores a un label dado.
 *
 * @param {string[]} lines — array de líneas
 * @param {number} labelIdx — índice de la línea con el label
 * @param {Function} [validator=looksLikeValue] — cuándo aceptar la línea
 * @param {number} [maxLookahead=4] — cuántas líneas mirar tras el label
 */
export function findValueAfter(
  lines,
  labelIdx,
  validator = looksLikeValue,
  maxLookahead = 4,
) {
  for (let i = labelIdx + 1; i < Math.min(labelIdx + 1 + maxLookahead, lines.length); i++) {
    if (validator(lines[i])) return cleanLine(lines[i]);
  }
  return '';
}

/**
 * Encuentra el VALOR en la MISMA línea que el label (después del label),
 * útil para campos cortos como "Sexo: M" o "Nacionalidad: ESP".
 */
export function findValueInline(line, labelRegex) {
  const cleaned = cleanLine(line);
  // Quita el label de la línea y devuelve lo que queda
  const stripped = cleaned.replace(labelRegex, '').replace(/^[\s:.-]+/, '').trim();
  return stripped;
}

/**
 * Parsea una fecha en formato variable.
 * Soporta:
 *   ▸ DD MM YYYY (con espacios)         "10 01 1950"
 *   ▸ DD/MM/YYYY                         "10/01/1950"
 *   ▸ DD-MM-YYYY                         "10-01-1950"
 *   ▸ DD.MM.YYYY                         "10.01.1950"
 *   ▸ YYYY-MM-DD (ISO)                   "1950-01-10"
 *   ▸ DDMMMYYYY (3-letter month)         "10JAN1950"
 *
 * @returns {{ day, month, year, iso } | null}
 */
export function parseDateLine(line) {
  if (!line) return null;
  const cleaned = String(line).replace(/[^\d\sA-Za-z\/.-]/g, ' ').trim();

  // ISO YYYY-MM-DD
  let m = cleaned.match(/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (m) {
    const yyyy = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const dd = parseInt(m[3], 10);
    return validDate(dd, mm, yyyy);
  }

  // DD MM YYYY (separadores varios)
  m = cleaned.match(/(\d{1,2})\s*[-\s\/.]\s*(\d{1,2})\s*[-\s\/.]\s*(\d{2,4})/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    let yyyy = parseInt(m[3], 10);
    if (yyyy < 100) yyyy += yyyy < 50 ? 2000 : 1900;
    return validDate(dd, mm, yyyy);
  }

  // DD MMM YYYY (mes en 3 letras)
  m = cleaned.match(/(\d{1,2})\s*([A-Z]{3})\s*(\d{2,4})/i);
  if (m) {
    const months = {
      JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
      JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
      ENE: 1, ABR: 4, AGO: 8, DIC: 12, // ES
      JANV: 1, FEVR: 2, AVR: 4, MAI: 5, JUIN: 6, JUIL: 7, AOUT: 8, SEPT: 9, OCT: 10, NOV: 11, DEC: 12, // FR
    };
    const dd = parseInt(m[1], 10);
    const mm = months[m[2].toUpperCase().slice(0, 3)];
    let yyyy = parseInt(m[3], 10);
    if (yyyy < 100) yyyy += yyyy < 50 ? 2000 : 1900;
    if (mm) return validDate(dd, mm, yyyy);
  }

  return null;
}

function validDate(dd, mm, yyyy) {
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
  if (yyyy < 1900 || yyyy > 2100) return null;
  return {
    day: dd,
    month: mm,
    year: yyyy,
    iso: `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
  };
}

/**
 * Indexa las líneas que matchean cada label.
 * @param {string[]} lines
 * @param {Object<string, RegExp>} labelRegexByField
 * @returns {Map<string, number>} fieldKey → línea
 */
export function indexLabels(lines, labelRegexByField) {
  const found = new Map();
  for (let i = 0; i < lines.length; i++) {
    for (const [key, regex] of Object.entries(labelRegexByField)) {
      if (!found.has(key) && regex.test(lines[i])) {
        found.set(key, i);
      }
    }
  }
  return found;
}

/**
 * Detecta un código de país ISO 3166-1 alpha-3 en una línea.
 * Útil para "NACIONALIDAD: ESP", "NATIONALITY: USA", etc.
 */
const ISO_ALPHA3_RE = /\b(ESP|FRA|PRT|GBR|USA|ITA|DEU|MAR|ARG|MEX|COL|VEN|CHL|PER|BRA|URY|ECU|PAN|CRI|CUB|DOM|PRY|BOL|HND|NIC|SLV|GTM|HTI|CHN|JPN|KOR|RUS|IND|PAK|TUR|EGY|ROU|POL|UKR|BGR|HUN|CZE|SVK|FIN|SWE|NOR|DNK|ISL|IRL|NLD|BEL|LUX|CHE|AUT|GRC|HRV|SVN|SRB|MKD|ALB|BIH|MNE|MLT|CYP|EST|LVA|LTU|BLR|MDA|GEO|ARM|AZE|KAZ|UZB|TJK|KGZ|TKM|MNG|VNM|THA|IDN|PHL|MYS|SGP|AUS|NZL|FJI|TON|WSM|VUT|SLB|PNG|TLS|BRN|KHM|LAO|MMR|NPL|BTN|LKA|MDV|BGD|AFG|IRN|IRQ|SYR|JOR|LBN|ISR|PSE|SAU|YEM|OMN|ARE|QAT|KWT|BHR|ZAF|NAM|BWA|ZWE|ZMB|MWI|MOZ|MDG|MUS|SYC|COM|MYT|REU|TZA|UGA|RWA|BDI|KEN|SOM|ETH|ERI|DJI|SDN|SSD|TCD|CAF|CMR|GAB|GNQ|COD|COG|AGO|GIN|GNB|SLE|LBR|CIV|GHA|TGO|BEN|NGA|NER|MLI|BFA|SEN|GMB|MRT|CPV|STP|DZA|TUN|LBY|ESH|UTO)\b/;

export function findIsoCountryCode(line) {
  const m = String(line || '').toUpperCase().match(ISO_ALPHA3_RE);
  return m ? m[1] : '';
}

/**
 * Búsqueda global en TODO el texto. Útil para campos que pueden estar en
 * cualquier parte del documento (número visible, ISO de país…).
 */
export function findInText(text, regex) {
  const m = String(text || '').match(regex);
  return m ? m[0] : '';
}

/**
 * Splittea texto OCR en líneas limpias y filtradas.
 */
export function toLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);
}
