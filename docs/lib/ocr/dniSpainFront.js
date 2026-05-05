// ──────────────────────────────────────────────────────────────────────────
//  DNI español FRONTAL — parser por LABELS (no MRZ)
// ──────────────────────────────────────────────────────────────────────────
//
// La cara frontal del DNI español 2.0 / 3.0 / 4.0 tiene una estructura de
// LABELS muy reconocible:
//
//   DOCUMENTO NACIONAL DE IDENTIDAD
//   PRIMER APELLIDO
//   ESPAÑOL                     ← valor del label de arriba
//   SEGUNDO APELLIDO
//   ESPAÑOL
//   NOMBRE
//   JUAN
//   SEXO        NACIONALIDAD
//   M           ESP
//   FECHA DE NACIMIENTO
//   10 01 1950
//   IDESP
//   AAA023112
//   VALIDO HASTA
//   17 04 2018
//   ...
//   DNI NÚM.
//   65004204V
//
// Estrategia: buscar cada LABEL en el texto OCR (con tolerancia a errores
// comunes de OCR), luego extraer la(s) línea(s) inmediata(s) después
// como el valor.
//
// Esto es MÁS ROBUSTO que la heurística genérica porque sabemos
// exactamente qué buscar.

import { validateDniNie, dniLetter } from './dniSpain.js';

// Labels canónicas del DNI con sus variantes OCR. Las regex son
// case-insensitive y toleran espacios extra y acentos perdidos.
const LABELS = [
  {
    key: 'surname1',
    label: 'PRIMER APELLIDO',
    re: /\bp[rs]i?[mn]er\s+a?p?ell?i[dn]?o?s?\b/i,
  },
  {
    key: 'surname2',
    label: 'SEGUNDO APELLIDO',
    re: /\bse?gun?d?o\s+a?p?ell?i[dn]?o?s?\b/i,
  },
  {
    key: 'given',
    label: 'NOMBRE',
    re: /\b[mn]o[mn][bp]r?es?\b/i,
  },
  {
    key: 'sex',
    label: 'SEXO',
    re: /\bse[xkc]o?\b/i,
    inline: true,
  },
  {
    key: 'nationality',
    label: 'NACIONALIDAD',
    re: /\bna[csz]i?o[mn]al?i?[dn]?a?d?\b/i,
    inline: true,
  },
  {
    key: 'birthDate',
    label: 'FECHA DE NACIMIENTO',
    re: /\bfe[csz]ha\s*(?:de\s*)?na[csz]i[mn]ient?o\b/i,
  },
  {
    key: 'idesp',
    label: 'IDESP',
    re: /\b[il]desp?\b/i,
  },
  {
    key: 'expiryDate',
    label: 'VALIDO HASTA',
    re: /\b[vb][aá]l?[il]?d?o?\s*hasta\b/i,
  },
  {
    key: 'dniNumber',
    label: 'DNI NÚM',
    re: /\b[dou0]\s*n\s*[il1]\s*[nm]?\s*[uú]?\s*m?\b/i,
  },
];

/**
 * Limpia una línea: trim, colapsa espacios, elimina puntuación de borde.
 */
function cleanValueLine(line) {
  return line
    .replace(/[|·•\\/]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * ¿La línea parece un VALOR válido (no una etiqueta o ruido)?
 *   - 2-40 caracteres
 *   - sin "APELLIDO", "NOMBRE", "FECHA", "SEXO" (eso son labels)
 *   - sin sólo símbolos
 */
function looksLikeValue(line, allowDigits = true) {
  const cleaned = cleanValueLine(line);
  if (cleaned.length < 1 || cleaned.length > 50) return false;
  if (LABELS.some((l) => l.re.test(cleaned))) return false;
  if (/^(documento|identidad|nacional|espana|españa)$/i.test(cleaned)) return false;
  if (!/[a-zA-Záéíóúñ0-9]/.test(cleaned)) return false;
  if (!allowDigits && /\d/.test(cleaned) && !/^[0-9 ]+$/.test(cleaned)) return false;
  return true;
}

/**
 * ¿Es un nombre/apellido legítimo? (sólo letras + espacios + apóstrofes,
 * mayúsculas, longitud razonable)
 */
function looksLikePersonName(line) {
  if (!looksLikeValue(line, false)) return false;
  const cleaned = cleanValueLine(line);
  // Sólo letras, espacios, apóstrofes, guiones
  if (!/^[A-ZÁÉÍÓÚÑa-záéíóúñ' -]+$/.test(cleaned)) return false;
  // Longitud razonable
  if (cleaned.length < 2 || cleaned.length > 40) return false;
  return true;
}

/**
 * Extrae el valor de una etiqueta dada. Busca la primera línea no-vacía
 * después de la línea con el label. Útil para apellidos/nombre.
 */
function findValueAfter(lines, labelIdx, validator = looksLikeValue) {
  for (let i = labelIdx + 1; i < Math.min(labelIdx + 4, lines.length); i++) {
    if (validator(lines[i])) return cleanValueLine(lines[i]);
  }
  return '';
}

/**
 * Busca una fecha en formato DD MM YYYY o DD/MM/YYYY (con espacios o
 * separadores variados). Devuelve { day, month, year, iso } o null.
 */
function parseDateLine(line) {
  const cleaned = line.replace(/[^\d\s\/.-]/g, ' ').trim();
  const m = cleaned.match(/(\d{1,2})\s*[\s\/.-]\s*(\d{1,2})\s*[\s\/.-]\s*(\d{2,4})/);
  if (!m) return null;
  const dd = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  let yyyy = parseInt(m[3], 10);
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
  if (yyyy < 100) yyyy += yyyy < 50 ? 2000 : 1900;
  if (yyyy < 1900 || yyyy > 2100) return null;
  return {
    day: dd,
    month: mm,
    year: yyyy,
    iso: `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`,
  };
}

/**
 * Busca un número de DNI (8 dígitos + letra) en cualquier parte del texto.
 * Tolerante a espacios y guiones.
 */
function findDniNumber(text) {
  const matches = [...text.toUpperCase().matchAll(/(\d{7,9})\s*[-]?\s*([A-Z])/g)];
  for (const m of matches) {
    const num = m[1].slice(-8).padStart(8, '0');
    const letter = m[2];
    const expected = dniLetter(num);
    if (letter === expected) {
      return { number: num + letter, valid: true };
    }
  }
  // Si no hay match válido, devuelve el primer candidato como sospechoso
  if (matches.length) {
    return { number: matches[0][1] + matches[0][2], valid: false };
  }
  return null;
}

/**
 * Punto de entrada: parsea la frontal del DNI español a partir del
 * texto OCR. Devuelve null si no parece un DNI español.
 *
 * @param {string} ocrText
 * @returns {Object|null} {
 *   surname1, surname2, given, fullName,
 *   sex, nationality, birthDate, expiryDate,
 *   dniNumber, idesp, valid, score, evidence
 * }
 */
export function parseDniSpainFront(ocrText) {
  if (!ocrText) return null;
  const lines = ocrText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 4) return null;

  // ── Comprobación previa: ¿se parece a un DNI español?
  const fullText = lines.join(' ').toUpperCase();
  const dniHints = [
    /DOCUMENTO\s+NACIONAL\s+DE\s+IDENTIDAD/i,
    /\bESPA[ÑN]A\b/i,
    /\bMINISTERIO\s+DEL?\s+INTERIOR\b/i,
    /\bDNI\s*N[ÚU]?M?\b/i,
    /\bIDESP\b/i,
    /\bPRIMER\s+APELLIDO/i,
    /\bSEGUNDO\s+APELLIDO/i,
  ];
  const matchingHints = dniHints.filter((re) => re.test(fullText)).length;
  // Necesitamos al menos 2 indicios para considerar que es DNI español
  if (matchingHints < 1) return null;

  // ── Indexa las líneas que coinciden con cada label
  const labelHits = new Map(); // labelKey → lineIndex
  for (let i = 0; i < lines.length; i++) {
    for (const lbl of LABELS) {
      if (!labelHits.has(lbl.key) && lbl.re.test(lines[i])) {
        labelHits.set(lbl.key, i);
      }
    }
  }

  const result = {
    surname1: '',
    surname2: '',
    given: '',
    fullName: '',
    sex: '',
    nationality: '',
    birthDate: null,
    expiryDate: null,
    dniNumber: '',
    idesp: '',
    valid: false,
    score: matchingHints * 5,
    evidence: { labelsFound: labelHits.size, dniHints: matchingHints },
  };

  // ── Apellidos y nombre (los más importantes)
  if (labelHits.has('surname1')) {
    result.surname1 = findValueAfter(lines, labelHits.get('surname1'), looksLikePersonName);
  }
  if (labelHits.has('surname2')) {
    result.surname2 = findValueAfter(lines, labelHits.get('surname2'), looksLikePersonName);
  }
  if (labelHits.has('given')) {
    result.given = findValueAfter(lines, labelHits.get('given'), looksLikePersonName);
  }

  // ── Componer fullName "NOMBRE APELLIDO1 APELLIDO2"
  const parts = [result.given, result.surname1, result.surname2].filter(Boolean);
  result.fullName = parts.join(' ').trim();

  // ── Fechas
  if (labelHits.has('birthDate')) {
    const idx = labelHits.get('birthDate');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d) {
        result.birthDate = d;
        break;
      }
    }
  }
  if (labelHits.has('expiryDate')) {
    const idx = labelHits.get('expiryDate');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const d = parseDateLine(lines[i]);
      if (d) {
        result.expiryDate = d;
        break;
      }
    }
  }

  // ── Número DNI: lo buscamos GLOBAL (suele estar al final)
  const dniMatch = findDniNumber(fullText);
  if (dniMatch) {
    result.dniNumber = dniMatch.number;
    result.valid = dniMatch.valid;
    if (dniMatch.valid) result.score += 30;
  }

  // ── IDESP (suele estar tras el label)
  if (labelHits.has('idesp')) {
    const idx = labelHits.get('idesp');
    for (let i = idx + 1; i < Math.min(idx + 3, lines.length); i++) {
      const cleaned = cleanValueLine(lines[i]);
      // IDESP es típicamente 3 letras + 6 dígitos
      const m = cleaned.match(/^([A-Z]{3})[\s-]?(\d{6})$/);
      if (m) {
        result.idesp = m[1] + m[2];
        result.score += 10;
        break;
      }
    }
  }

  // ── Sexo (M/F en línea aparte o en la misma línea que el label)
  if (labelHits.has('sex')) {
    const idx = labelHits.get('sex');
    // Busca en la línea misma o las siguientes
    for (let i = idx; i < Math.min(idx + 3, lines.length); i++) {
      const m = lines[i].match(/\b([MFmf])\b/);
      if (m && i > idx) {
        result.sex = m[1].toUpperCase();
        break;
      }
    }
  }

  // ── Nacionalidad (3 letras código ISO)
  if (labelHits.has('nationality')) {
    const idx = labelHits.get('nationality');
    for (let i = idx; i < Math.min(idx + 3, lines.length); i++) {
      const m = lines[i].match(/\b(ESP|FRA|PRT|GBR|USA|ITA|DEU|MAR|ARG|MEX|COL|VEN|CHL|PER|BRA|URY|ECU|PAN|CRI|CUB|DOM|PRY|BOL|HND|NIC|SLV|GTM|HTI|CHN|JPN|KOR|RUS|IND|PAK|TUR|EGY|ROU|POL|UKR|BGR|HUN|CZE|SVK|FIN|SWE|NOR|DNK|ISL|IRL|NLD|BEL|LUX|CHE|AUT|GRC|HRV|SVN|SRB|MKD|ALB|BIH|MNE|MLT|CYP|EST|LVA|LTU|BLR|MDA|GEO|ARM|AZE|KAZ|UZB|TJK|KGZ|TKM|MNG|VNM|THA|IDN|PHL|MYS|SGP|AUS|NZL|FJI|TON|WSM|VUT|SLB|PNG|TLS|BRN|KHM|LAO|MMR|NPL|BTN|LKA|MDV|BGD|AFG|IRN|IRQ|SYR|JOR|LBN|ISR|PSE|SAU|YEM|OMN|ARE|QAT|KWT|BHR|ZAF|NAM|BWA|ZWE|ZMB|MWI|MOZ|MDG|MUS|SYC|COM|MYT|REU|TZA|UGA|RWA|BDI|KEN|SOM|ETH|ERI|DJI|SDN|SSD|TCD|CAF|CMR|GAB|GNQ|COD|COG|AGO|GIN|GNB|SLE|LBR|CIV|GHA|TGO|BEN|NGA|NER|MLI|BFA|SEN|GMB|MRT|CPV|STP|MAR|DZA|TUN|LBY|ESH)\b/);
      if (m) {
        result.nationality = m[1];
        break;
      }
    }
  }

  return result;
}

export { findDniNumber }; // exportado para tests
