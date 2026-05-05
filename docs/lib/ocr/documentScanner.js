// ──────────────────────────────────────────────────────────────────────────
//  Document Scanner — Orquestador del OCR + parsing + validación
// ──────────────────────────────────────────────────────────────────────────
//
// API:
//   const scanner = new DocumentScanner();
//   const result = await scanner.scan(imageBlob, { onProgress });
//
//   result = {
//     ok: true|false,
//     documentType: 'TD3'|'TD1'|'DNI'|'NIE'|'unknown',
//     fullName: 'Juan García Pérez',
//     given: 'Juan',
//     surname: 'García Pérez',
//     documentNumber: '12345678Z' | '...',
//     issuingCountry: 'ESP' | 'FRA' | …,
//     birthDate: { iso: '1990-01-15' },
//     expiryDate: { iso: '2030-01-15' },
//     authenticity: {
//       score: 0..100,            // % de confianza de "es auténtico"
//       passed: true|false,        // pasa los checks básicos
//       checks: { ... },           // detalle de cada validación
//       suspectedFake: true|false, // si el score es bajo
//     },
//     ocrConfidence: 0..100,       // confianza del OCR
//     rawText: '...',              // texto OCR crudo (debug)
//   }
//
// Pipeline:
//   1. OCR pasada 1 (idiomas spa+eng, sin restricción) — texto general
//   2. Detectar si hay MRZ → parsear con checksums
//   3. Si no hay MRZ, buscar DNI/NIE español visible → validar letra
//   4. Si no hay nada, fallback: extraer nombres por heurística
//   5. Calcular score de autenticidad combinando todas las señales

import { recognize, recognizeMrz, recognizeMulti } from './tesseractOcr.js';
import { parseMrz } from './mrz.js';
import { findDniNieInText, validateDniNie } from './dniSpain.js';
import { parseDniSpainFront } from './dniSpainFront.js';
import { parsePassportFront } from './passportFront.js';
import { parseDrivingLicense } from './drivingLicense.js';
import { detectDocumentType } from './identityLabels.js';
import {
  imageToCanvas,
  preprocessForOcr,
  preprocessForOcrSoft,
  estimatePhotoQuality,
} from './imagePreprocess.js';
import { getDocumentDetector, canvasToImage } from './documentDetector.js';

export class DocumentScanner {
  /**
   * @param {Blob|string|HTMLImageElement} image
   * @param {Object} [opts]
   * @param {Function} [opts.onProgress] — callback({status, progress, stage})
   * @returns {Promise<Object>}
   */
  async scan(image, { onProgress = () => {} } = {}) {
    const result = {
      ok: false,
      documentType: 'unknown',
      fullName: '',
      given: '',
      surname: '',
      documentNumber: '',
      issuingCountry: '',
      birthDate: null,
      expiryDate: null,
      authenticity: { score: 0, passed: false, checks: {}, suspectedFake: false },
      ocrConfidence: 0,
      rawText: '',
      mrz: null,
      dniNie: null,
    };

    // ── PASO 0: Convertir a canvas + estimar calidad de foto ──────────────
    onProgress({ stage: 'analyze', progress: 0.05 });
    const originalCanvas = await imageToCanvas(image);

    // ── PASO 1: DETECTAR documento y RECORTAR + ENDEREZAR ───────────────
    // Esta es la mejora más impactante: si la foto tiene el documento como
    // una pequeña parte rodeada de browser chrome / fondo / signature
    // duplicada, jscanify localiza los 4 vértices, recorta y endereza
    // mediante warp de perspectiva. Lo que llega al OCR es SÓLO el
    // documento, sin ruido y sin perspectiva.
    onProgress({ stage: 'detect-document', progress: 0.1 });
    let workingCanvas = originalCanvas;
    let detection = null;
    try {
      const detector = await getDocumentDetector();
      const imgEl = image instanceof HTMLImageElement
        ? image
        : await canvasToImage(originalCanvas);
      detection = await detector.detectAndWarp(imgEl, { minCoverage: 0.10 });
      if (detection.found) {
        workingCanvas = detection.croppedCanvas;
        result.documentDetected = {
          coverage: detection.coverage,
          width: detection.width,
          height: detection.height,
          rotated: detection.rotated,
        };
        // Exponemos el dataURL del documento recortado para que la UI
        // lo muestre en lugar de la foto cruda.
        try {
          result.croppedDataUrl = workingCanvas.toDataURL('image/jpeg', 0.85);
        } catch {}
      } else {
        result.documentDetected = { found: false, reason: detection.reason };
      }
    } catch (err) {
      // Si OpenCV/jscanify falla (red, dispositivo viejo…), seguimos con
      // la imagen original. El sistema sigue funcionando, sólo peor.
      result.documentDetected = { found: false, reason: 'detector_error', error: err.message };
    }

    // ── PASO 2: Estimar calidad sobre la imagen TRABAJADA ─────────────────
    onProgress({ stage: 'quality', progress: 0.2 });
    const quality = estimatePhotoQuality(workingCanvas);
    result.photoQuality = quality;
    if (quality.quality === 'poor' && quality.score < 30) {
      result.ok = false;
      result.qualityRejected = true;
      result.authenticity = { score: 0, passed: false, suspectedFake: false, checks: {} };
      return result;
    }

    // ── PASO 3: 2-PASS OCR SECUENCIAL ─────────────────────────────────────
    // Reducimos de 3 paralelo a 2 secuencial: en móviles los workers
    // paralelos compiten por CPU y la latencia real es peor. Con 2
    // pasadas secuenciales tenemos mejor rendimiento real:
    //   A) imagen recortada (workingCanvas) — para texto general y MRZ
    //   B) preprocessed HARD (Sauvola threshold) — sólo si A no encontró
    //      ningún campo (ahorro: si A funciona, no gastamos B)
    onProgress({ stage: 'preprocess', progress: 0.3 });
    let preprocessedHard;
    try {
      preprocessedHard = preprocessForOcr(workingCanvas);
    } catch {
      preprocessedHard = workingCanvas;
    }

    onProgress({ stage: 'ocr-pass-1', progress: 0.4 });
    const passOriginal = await recognize(workingCanvas, {
      languages: 'spa+eng',
      onProgress: (p) =>
        onProgress({ stage: 'ocr-pass-1', status: p.status, progress: 0.4 + (p.progress ?? 0) * 0.25 }),
    });

    // ¿Pasada 1 ya encontró algo? Si MRZ con buenos checksums o número
    // DNI válido están en passOriginal.text, podemos saltarnos la 2ª pasada.
    const quickMrz = parseMrz(passOriginal.text);
    const quickDniValid = !!quickMrz?.valid ||
      Object.values(quickMrz?.checksums || {}).filter(Boolean).length >= 3;
    let passHard = null;
    if (!quickDniValid) {
      onProgress({ stage: 'ocr-pass-2', progress: 0.65 });
      passHard = await recognize(preprocessedHard, {
        languages: 'spa+eng',
        onProgress: (p) =>
          onProgress({ stage: 'ocr-pass-2', status: p.status, progress: 0.65 + (p.progress ?? 0) * 0.25 }),
      });
    }

    const passes = [
      { label: 'recortado', confidence: passOriginal.confidence, length: passOriginal.text.length },
    ];
    if (passHard) passes.push({
      label: 'preprocesado',
      confidence: passHard.confidence,
      length: passHard.text.length,
    });

    const combinedText = passHard
      ? passOriginal.text + '\n' + passHard.text
      : passOriginal.text;
    result.rawText = combinedText;
    result.ocrConfidence = Math.max(passOriginal.confidence, passHard?.confidence ?? 0);
    result.passes = passes;

    const ocr = { text: combinedText, confidence: result.ocrConfidence };

    // ── PASO 2: ¿Hay MRZ? Lo intentamos directo con texto general
    onProgress({ stage: 'mrz-parse', progress: 0 });
    let mrz = parseMrz(ocr.text);

    // Si la primera pasada no encontró MRZ válida, repetimos con whitelist
    // de caracteres MRZ — suele mejorar la precisión.
    if (!mrz || (mrz && mrz.checksums && !Object.values(mrz.checksums).every(Boolean))) {
      onProgress({ stage: 'ocr-mrz-zone', progress: 0 });
      try {
        const mrzOcr = await recognizeMrz(image, {
          onProgress: (p) =>
            onProgress({
              stage: 'ocr-mrz-zone',
              status: p.status,
              progress: p.progress,
            }),
        });
        const mrz2 = parseMrz(mrzOcr.text);
        // Nos quedamos con el que más checksums pase
        if (mrz2) {
          const score = (m) =>
            m && m.checksums ? Object.values(m.checksums).filter(Boolean).length : 0;
          if (score(mrz2) > score(mrz)) mrz = mrz2;
        }
      } catch (e) {
        // OCR MRZ no pudo, seguimos con lo que teníamos
      }
    }

    if (mrz) {
      result.mrz = mrz;
      result.documentType = mrz.type;
      result.fullName = mrz.fullName;
      result.given = mrz.givenNames;
      result.surname = mrz.surname;
      result.documentNumber = mrz.documentNumber;
      result.issuingCountry = mrz.issuingCountry;
      result.birthDate = mrz.birthDate;
      result.expiryDate = mrz.expiryDate;
    }

    // ── PASO 3: Detectar TIPO de documento por hints multi-idioma.
    // Esto guía el orden de los parsers que probaremos.
    onProgress({ stage: 'detect-type', progress: 0 });
    const detection = detectDocumentType(ocr.text);
    result.detectedType = detection;

    // ── PASO 4: Parser de DNI ESPAÑOL (frontal con labels).
    onProgress({ stage: 'dni-front', progress: 0 });
    const front = parseDniSpainFront(ocr.text);
    if (front && front.fullName) {
      result.dniFront = front;
      if (!result.fullName) {
        result.fullName = front.fullName;
        result.given = front.given;
        result.surname = [front.surname1, front.surname2].filter(Boolean).join(' ');
        result.documentType = 'DNI';
        result.issuingCountry = front.nationality || 'ESP';
        if (front.birthDate) result.birthDate = front.birthDate;
        if (front.expiryDate) result.expiryDate = front.expiryDate;
        if (front.dniNumber) result.documentNumber = front.dniNumber;
      } else if (mrz && front.dniNumber && !result.documentNumber) {
        result.documentNumber = front.dniNumber;
      }
    }

    // ── PASO 5: Parser PASAPORTE FRONTAL (cuando MRZ no se leyó bien).
    // Útil porque la MRZ falla con frecuencia (glare, foto torcida).
    onProgress({ stage: 'passport-front', progress: 0 });
    if (!result.fullName || (mrz && Object.values(mrz.checksums || {}).filter(Boolean).length < 2)) {
      const passportFront = parsePassportFront(ocr.text);
      if (passportFront && passportFront.fullName) {
        result.passportFront = passportFront;
        if (!result.fullName) {
          result.fullName = passportFront.fullName;
          result.given = passportFront.given;
          result.surname = passportFront.surname;
          result.documentType = 'PASSPORT';
          result.issuingCountry = passportFront.nationality || result.issuingCountry;
          if (passportFront.birthDate) result.birthDate = passportFront.birthDate;
          if (passportFront.expiryDate) result.expiryDate = passportFront.expiryDate;
          if (passportFront.documentNumber) result.documentNumber = passportFront.documentNumber;
        }
      }
    }

    // ── PASO 6: Parser CARNET DE CONDUCIR (UE armonizado / USA / UK).
    onProgress({ stage: 'driving-license', progress: 0 });
    if (!result.fullName) {
      const license = parseDrivingLicense(ocr.text);
      if (license && license.fullName) {
        result.drivingLicense = license;
        result.fullName = license.fullName;
        result.given = license.given;
        result.surname = license.surname;
        result.documentType = 'DRIVING_LICENSE';
        if (license.birthDate) result.birthDate = license.birthDate;
        if (license.expiryDate) result.expiryDate = license.expiryDate;
        if (license.documentNumber) result.documentNumber = license.documentNumber;
        result.categories = license.categories;
      }
    }

    // ── PASO 7: Búsqueda DNI/NIE genérica (regex global) — sólo para
    // complementar el documentNumber si los pasos anteriores no lo dieron.
    onProgress({ stage: 'dni-spain', progress: 0 });
    const dniMatch = findDniNieInText(ocr.text);
    if (dniMatch) {
      result.dniNie = dniMatch;
      if (!result.documentType || result.documentType === 'unknown') {
        result.documentType = dniMatch.validation.type;
        result.documentNumber = dniMatch.validation.given;
        result.issuingCountry = 'ESP';
      } else if (!result.documentNumber) {
        result.documentNumber = dniMatch.validation.given;
      }
    }

    // ── PASO 8: Heurística genérica como ÚLTIMO recurso
    if (!result.fullName) {
      const heuristic = heuristicNameExtraction(ocr.text);
      if (heuristic) {
        result.fullName = heuristic.fullName;
        result.given = heuristic.given;
        result.surname = heuristic.surname;
      }
    }

    // ── PASO 9: Score de autenticidad combinado de TODAS las señales.
    result.authenticity = computeAuthenticityScore({
      mrz,
      dniNie: dniMatch,
      dniFront: front,
      passportFront: result.passportFront,
      drivingLicense: result.drivingLicense,
      ocrConfidence: ocr.confidence,
      result,
    });

    result.ok = !!result.fullName;
    return result;
  }
}

/**
 * Heurística de extracción de nombre cuando no hay MRZ ni DNI:
 * último recurso. Busca líneas con apariencia de nombre y aplica filtros
 * para evitar ruido OCR (firma, rúbrica, números, garabatos).
 */
function heuristicNameExtraction(text) {
  if (!text) return null;
  // Palabras-trampa frecuentes en DNI/pasaporte que NO son nombres
  const TRAP_WORDS = /\b(documento|nacional|identidad|espana|españa|ministerio|interior|sexo|nacionalidad|fecha|nacimiento|valido|hasta|primer|segundo|apellido|nombre|firma|titular|surname|given|name|date|birth|sex|national|number|num|idesp|dni|nie|passport|pasaporte)\b/i;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const seen = new Set(); // dedup
  const candidates = [];

  for (const l of lines) {
    if (l.length < 3 || l.length > 50) continue;
    if (/\d/.test(l)) continue;          // sin dígitos
    if (TRAP_WORDS.test(l)) continue;    // sin labels
    const cleaned = l.replace(/[^A-ZÁÉÍÓÚÑa-záéíóúñ' -]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length < 3) continue;
    const words = cleaned.split(/\s+/);
    if (words.length < 1 || words.length > 5) continue;
    if (!words.every((w) => /^[A-ZÁÉÍÓÚÑa-záéíóúñ'-]{2,}$/.test(w))) continue;
    const upper = cleaned.toUpperCase();
    if (seen.has(upper)) continue;
    seen.add(upper);
    candidates.push(cleaned);
  }

  if (!candidates.length) return null;

  // Estrategia: busca patrón típico de DNI español = 3 líneas seguidas
  // con APELLIDO1, APELLIDO2, NOMBRE (cada uno es una línea independiente).
  // Si encontramos 2-3 candidatos consecutivos, los combinamos.
  if (candidates.length >= 3) {
    // Asumimos: candidates[0]=APE1, [1]=APE2, [2]=NOMBRE
    const ape1 = candidates[0];
    const ape2 = candidates[1];
    const nom = candidates[2];
    // El nombre suele tener 1-3 palabras
    if (nom.split(/\s+/).length <= 3) {
      return {
        fullName: `${nom} ${ape1} ${ape2}`,
        given: nom,
        surname: `${ape1} ${ape2}`,
      };
    }
  }

  // Si no, la primera "frase" más larga
  const best = candidates.sort((a, b) => b.length - a.length)[0];
  const words = best.split(/\s+/);
  return {
    fullName: best,
    given: words[0],
    surname: words.slice(1).join(' '),
  };
}

/**
 * Calcula el score de autenticidad (0-100). Combinación de:
 *   ▸ 40 pts — MRZ checksums (5 checksums × 8 pts)
 *   ▸ 30 pts — letra DNI válida (si aplica)
 *   ▸ 15 pts — fechas coherentes (no expirado, edad razonable)
 *   ▸ 10 pts — confianza OCR (sólo cuenta si > 70)
 *   ▸  5 pts — coherencia entre MRZ y DNI visible
 *
 * threshold para "passed": ≥ 60.
 * threshold para "suspectedFake": < 30.
 */
function computeAuthenticityScore({
  mrz, dniNie, dniFront, passportFront, drivingLicense, ocrConfidence, result,
}) {
  const checks = {};
  let score = 0;

  // ── DNI FRONT (parser por labels) — buen indicio de DNI español auténtico
  if (dniFront) {
    const pts = dniFront.score;
    score += pts;
    checks.dniFront = {
      labelsFound: dniFront.evidence?.labelsFound,
      dniHints: dniFront.evidence?.dniHints,
      validNumber: dniFront.valid,
      pts: Math.round(pts),
    };
  }

  // ── PASAPORTE FRONT (cuando MRZ no leyó bien)
  if (passportFront) {
    const pts = Math.min(passportFront.score, 50);
    score += pts;
    checks.passportFront = {
      labelsFound: passportFront.evidence?.labelsFound,
      pts: Math.round(pts),
    };
  }

  // ── CARNET DE CONDUCIR (UE armonizado / labels)
  if (drivingLicense) {
    const pts = Math.min(drivingLicense.score, 60);
    score += pts;
    checks.drivingLicense = {
      categories: drivingLicense.categories?.length ?? 0,
      euFormat: drivingLicense.evidence?.numCategories >= 3,
      pts: Math.round(pts),
    };
  }

  // ── MRZ checksums (40 pts máx)
  if (mrz && mrz.checksums) {
    const total = Object.keys(mrz.checksums).length;
    const passed = Object.values(mrz.checksums).filter(Boolean).length;
    const pts = (passed / total) * 40;
    score += pts;
    checks.mrzChecksums = {
      total,
      passed,
      detail: mrz.checksums,
      pts: Math.round(pts),
    };
  }

  // ── Letra DNI (30 pts)
  if (dniNie?.validation) {
    const pts = dniNie.validation.valid ? 30 : 0;
    score += pts;
    checks.dniLetter = {
      valid: dniNie.validation.valid,
      reason: dniNie.validation.reason,
      pts,
    };
  }

  // ── Fechas coherentes (15 pts)
  let datesOk = true;
  const datesDetail = {};
  const today = new Date();
  if (result.expiryDate) {
    const exp = new Date(result.expiryDate.iso);
    datesDetail.expired = exp < today;
    if (exp < today) datesOk = false;
  }
  if (result.birthDate) {
    const b = new Date(result.birthDate.iso);
    const ageYears = (today - b) / (365.25 * 24 * 3600 * 1000);
    datesDetail.age = Math.floor(ageYears);
    if (ageYears < 0 || ageYears > 130) datesOk = false;
  }
  if (datesOk) {
    score += 15;
    checks.dates = { valid: true, ...datesDetail, pts: 15 };
  } else {
    checks.dates = { valid: false, ...datesDetail, pts: 0 };
  }

  // ── Confianza OCR (10 pts si > 70)
  if (ocrConfidence >= 70) {
    score += 10;
    checks.ocrConfidence = { conf: ocrConfidence, pts: 10 };
  } else {
    checks.ocrConfidence = { conf: ocrConfidence, pts: 0 };
  }

  // ── Coherencia MRZ/DNI (5 pts)
  if (mrz && dniNie?.validation?.valid) {
    const mrzNum = mrz.documentNumber.replace(/<+$/g, '').toUpperCase();
    const dniNum = dniNie.validation.given.toUpperCase();
    // Si el número MRZ contiene los 8 dígitos del DNI, coherente
    const dniDigits = dniNum.match(/^\d+/)?.[0] ?? '';
    if (dniDigits && mrzNum.includes(dniDigits)) {
      score += 5;
      checks.coherence = { mrzMatchesDni: true, pts: 5 };
    } else {
      checks.coherence = { mrzMatchesDni: false, pts: 0 };
    }
  }

  const finalScore = Math.round(score);
  return {
    score: finalScore,
    passed: finalScore >= 60,
    suspectedFake: finalScore < 30 && (mrz || dniNie),
    checks,
  };
}
