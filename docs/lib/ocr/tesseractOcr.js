// ──────────────────────────────────────────────────────────────────────────
//  Wrapper de Tesseract.js v5 — OCR del frame capturado
// ──────────────────────────────────────────────────────────────────────────
//
// Tesseract.js es el motor de OCR estándar en JavaScript. Funciona en el
// navegador via WASM. Soporta 100+ idiomas; cada modelo pesa ~5-15MB y se
// descarga la primera vez (queda cacheado).
//
// Estrategia:
//   ▸ Cargamos Tesseract via CDN (UMD) la primera vez, lazy.
//   ▸ Worker reutilizado entre escaneos (createWorker async).
//   ▸ Idiomas por defecto: spa+eng (cubre 99% del mercado HALO).
//   ▸ Para MRZ de pasaportes podemos usar 'osd' o sólo 'eng' con
//     whitelist de caracteres MRZ (A-Z 0-9 <).
//
// Doc: https://github.com/naptha/tesseract.js/blob/master/docs/api.md

const TESSERACT_CDN =
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js';

let tesseractLoadPromise = null;

/**
 * Carga Tesseract.js via CDN (UMD global). Cachea la promesa para no
 * cargar dos veces. Devuelve la global Tesseract.
 * @returns {Promise<any>} — el namespace Tesseract
 */
export function loadTesseract() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Tesseract sólo funciona en el navegador'));
  }
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractLoadPromise) return tesseractLoadPromise;

  tesseractLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TESSERACT_CDN;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (window.Tesseract) resolve(window.Tesseract);
      else reject(new Error('Tesseract cargado pero global no disponible'));
    };
    script.onerror = () =>
      reject(new Error('Fallo al cargar Tesseract.js desde CDN'));
    document.head.appendChild(script);
  });
  return tesseractLoadPromise;
}

let workerPromise = null;
let workerLanguages = '';

/**
 * Crea (o reutiliza) un Worker de Tesseract con los idiomas indicados.
 * Cambiar de idiomas requiere re-crear el worker (lo hace automático).
 *
 * @param {string} languages — string concatenado tipo 'spa+eng'
 * @param {Function} [progressCb] — opcional, recibe { status, progress 0-1 }
 */
export async function getWorker(languages = 'spa+eng', progressCb = null) {
  const Tesseract = await loadTesseract();
  if (workerPromise && workerLanguages === languages) {
    return workerPromise;
  }
  if (workerPromise) {
    // distinto idioma — terminamos el anterior
    try {
      const old = await workerPromise;
      await old.terminate();
    } catch {}
  }
  workerLanguages = languages;
  workerPromise = (async () => {
    const worker = await Tesseract.createWorker(languages, 1, {
      logger: progressCb
        ? (m) => progressCb({ status: m.status, progress: m.progress })
        : undefined,
    });
    return worker;
  })();
  return workerPromise;
}

/**
 * Reconoce texto en una imagen (Blob, dataURL, HTMLImageElement, Canvas…).
 *
 * @param {Blob|string|HTMLImageElement|HTMLCanvasElement} image
 * @param {Object} [opts]
 * @param {string} [opts.languages='spa+eng']
 * @param {string} [opts.charWhitelist]  — restringe caracteres reconocidos
 * @param {Function} [opts.onProgress]
 * @returns {Promise<{ text: string, confidence: number, lines: any[], words: any[] }>}
 */
export async function recognize(image, {
  languages = 'spa+eng',
  charWhitelist,
  onProgress,
} = {}) {
  const worker = await getWorker(languages, onProgress);
  if (charWhitelist) {
    await worker.setParameters({ tessedit_char_whitelist: charWhitelist });
  } else {
    await worker.setParameters({ tessedit_char_whitelist: '' });
  }
  const { data } = await worker.recognize(image);
  return {
    text: data.text,
    confidence: data.confidence,
    lines: data.lines || [],
    words: data.words || [],
  };
}

/**
 * Reconocimiento optimizado para zona MRZ de pasaporte/DNI ICAO. Restringe
 * el alfabeto a A-Z + 0-9 + < (mejora drásticamente la precisión).
 *
 * @param {Blob|string|HTMLImageElement} image
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export async function recognizeMrz(image, opts = {}) {
  return recognize(image, {
    languages: 'eng',
    charWhitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    ...opts,
  });
}

/**
 * Termina el worker y libera memoria. Llamar al cerrar el modal de cámara.
 */
export async function terminateWorker() {
  if (workerPromise) {
    try {
      const w = await workerPromise;
      await w.terminate();
    } catch {}
    workerPromise = null;
    workerLanguages = '';
  }
  if (schedulerPromise) {
    try {
      const s = await schedulerPromise;
      await s.terminate();
    } catch {}
    schedulerPromise = null;
    schedulerLanguages = '';
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  SCHEDULER MULTI-WORKER — pasadas en paralelo con distintos preprocesados
// ─────────────────────────────────────────────────────────────────────────
//
// Aprovecha createScheduler() de Tesseract.js para correr varias OCRs en
// paralelo (uno por preprocesado distinto: original, threshold, soft) y
// quedarnos con el resultado de mayor confianza.
//
// En navegadores con varios cores, esto es ~3× más rápido que pasadas
// secuenciales y la calidad final es mejor (el voto por confianza
// neutraliza preprocesados malos para el documento concreto).

let schedulerPromise = null;
let schedulerLanguages = '';

/**
 * Construye un scheduler con N workers (uno por core disponible, max 3).
 */
export async function getScheduler(languages = 'spa+eng', progressCb = null) {
  const Tesseract = await loadTesseract();
  if (schedulerPromise && schedulerLanguages === languages) return schedulerPromise;
  if (schedulerPromise) {
    try { (await schedulerPromise).terminate(); } catch {}
  }
  schedulerLanguages = languages;
  schedulerPromise = (async () => {
    const numWorkers = Math.min(3, navigator.hardwareConcurrency || 2);
    const scheduler = Tesseract.createScheduler();
    const workers = await Promise.all(
      Array.from({ length: numWorkers }, () =>
        Tesseract.createWorker(languages, 1, {
          logger: progressCb
            ? (m) => progressCb({ status: m.status, progress: m.progress })
            : undefined,
        }),
      ),
    );
    for (const w of workers) scheduler.addWorker(w);
    return scheduler;
  })();
  return schedulerPromise;
}

/**
 * Reconoce VARIAS imágenes en paralelo (una por cada preprocesado).
 * Devuelve el resultado del que tenga MAYOR confianza media.
 *
 * @param {Array<{label: string, image: any, charWhitelist?: string}>} jobs
 * @param {string} [languages='spa+eng']
 * @returns {Promise<{best: any, all: any[]}>}
 */
export async function recognizeMulti(jobs, { languages = 'spa+eng' } = {}) {
  if (!jobs?.length) throw new Error('recognizeMulti: jobs vacío');
  const scheduler = await getScheduler(languages);

  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const params = {};
        if (job.charWhitelist) params.tessedit_char_whitelist = job.charWhitelist;
        const { data } = await scheduler.addJob('recognize', job.image, params);
        return {
          label: job.label,
          text: data.text,
          confidence: data.confidence,
          lines: data.lines || [],
          words: data.words || [],
        };
      } catch (err) {
        return { label: job.label, text: '', confidence: 0, error: err.message };
      }
    }),
  );

  // Best = el de mayor confianza
  let best = results[0];
  for (const r of results) if (r.confidence > best.confidence) best = r;
  return { best, all: results };
}
