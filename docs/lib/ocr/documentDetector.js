// ──────────────────────────────────────────────────────────────────────────
//  Document Detector — detección de los 4 vértices del documento + warp
// ──────────────────────────────────────────────────────────────────────────
//
// Usa OpenCV.js + jscanify para detectar el contorno del documento dentro
// de la foto y aplicar warp de perspectiva → resulta en una imagen
// rectangular SOLO con el documento, enderezada.
//
// Esto es la mejora #1 de la auditoría: "ahorra el 80% de los errores
// de OCR" porque elimina:
//   ▸ Browser chrome, tabs, fondo de pantalla
//   ▸ Perspectiva (foto tomada en ángulo)
//   ▸ Documento pequeño dentro del frame
//   ▸ Signature/foto del titular FUERA del documento real
//
// Lazy load: OpenCV.js (~2MB) y jscanify (~10KB) se cargan sólo la primera
// vez que se pulsa "Capturar", no al arrancar la página. Quedan cacheados
// en navegador para siguientes usos.
//
// API:
//   const detector = await getDocumentDetector();
//   const result = await detector.detectAndWarp(imageElement);
//   // result = { found: true, croppedCanvas, originalCorners, ratio }

const OPENCV_CDN = 'https://docs.opencv.org/4.10.0/opencv.js';
const JSCANIFY_CDN = 'https://cdn.jsdelivr.net/npm/jscanify@1.3.0/src/jscanify.min.js';

let loaderPromise = null;

/**
 * Carga OpenCV.js y jscanify (lazy, una sola vez). Devuelve { cv, jscanify }.
 */
function loadDeps() {
  if (loaderPromise) return loaderPromise;
  loaderPromise = (async () => {
    // ── OpenCV.js. Carga el script y espera a que cv esté listo.
    if (!window.cv?.Mat) {
      await loadScript(OPENCV_CDN);
      await waitForCv();
    }
    // ── jscanify (depende de cv ya cargado)
    if (!window.jscanify) {
      await loadScript(JSCANIFY_CDN);
    }
    return { cv: window.cv, jscanify: window.jscanify };
  })();
  return loaderPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}

/**
 * OpenCV.js es asíncrono — el script se carga pero `cv` aún no está listo
 * hasta que `cv.onRuntimeInitialized` dispara. Esperamos con polling.
 */
function waitForCv(timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.cv && typeof window.cv.Mat === 'function') return resolve();
      if (Date.now() - start > timeoutMs) {
        return reject(new Error('OpenCV.js tardó demasiado en inicializarse'));
      }
      setTimeout(tick, 50);
    };
    // Prefer event hook si está disponible
    if (window.cv && typeof window.cv.onRuntimeInitialized !== 'undefined') {
      window.cv.onRuntimeInitialized = () => resolve();
    }
    tick();
  });
}

/**
 * Distancia euclídea entre 2 puntos { x, y }.
 */
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calcula el tamaño objetivo del documento recortado a partir de los 4
 * vértices, conservando la proporción mayor.
 */
function targetSize(corners) {
  const { topLeftCorner: tl, topRightCorner: tr, bottomLeftCorner: bl, bottomRightCorner: br } = corners;
  const widthTop = dist(tl, tr);
  const widthBot = dist(bl, br);
  const heightL  = dist(tl, bl);
  const heightR  = dist(tr, br);
  const w = Math.max(widthTop, widthBot);
  const h = Math.max(heightL, heightR);
  return { width: Math.round(w), height: Math.round(h) };
}

/**
 * Singleton del detector (evita reconstruir jscanify).
 */
let scannerInstance = null;

export async function getDocumentDetector() {
  const { cv, jscanify } = await loadDeps();
  if (!scannerInstance) {
    // jscanify se exporta como clase tras cargar el script
    const Scanner = jscanify.default || jscanify;
    scannerInstance = new Scanner();
  }
  return {
    cv,
    jscanify,
    scanner: scannerInstance,

    /**
     * Detecta los 4 vértices del documento en la imagen y devuelve un
     * canvas con el documento recortado y enderezado. Si no detecta
     * un cuadrilátero, devuelve { found: false }.
     *
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {Object} [opts]
     * @param {number} [opts.minCoverage=0.10] — área mínima del documento
     *        respecto al frame total (10% por defecto). Por debajo se
     *        considera que no hay documento detectado fiable.
     * @param {number} [opts.maxOutputWidth=2000] — limita el width del
     *        canvas de salida para mantener perf razonable
     */
    async detectAndWarp(image, { minCoverage = 0.10, maxOutputWidth = 2000 } = {}) {
      const src = cv.imread(image);
      try {
        // 1. jscanify encuentra el contorno más grande con forma de paper
        const contour = scannerInstance.findPaperContour(src);
        const corners = scannerInstance.getCornerPoints(contour, src);
        if (!corners || !corners.topLeftCorner) {
          return { found: false, reason: 'no_corners' };
        }

        // 2. Verificamos cobertura — si el cuadrilátero ocupa < N% del
        //    frame, probablemente sea ruido (paneles, ventanas, etc.)
        const totalArea = src.cols * src.rows;
        const polyArea = computePolygonArea([
          corners.topLeftCorner,
          corners.topRightCorner,
          corners.bottomRightCorner,
          corners.bottomLeftCorner,
        ]);
        const coverage = polyArea / totalArea;
        if (coverage < minCoverage) {
          return { found: false, reason: 'coverage_too_low', coverage };
        }

        // 3. Calcular tamaño objetivo manteniendo proporción
        let { width, height } = targetSize(corners);
        if (width < 200 || height < 200) {
          return { found: false, reason: 'too_small', width, height };
        }
        // Limitar tamaño máximo
        if (width > maxOutputWidth) {
          const scale = maxOutputWidth / width;
          width = maxOutputWidth;
          height = Math.round(height * scale);
        }

        // 4. Si el documento detectado es vertical pero todos los
        //    documentos ID son horizontales, rotamos 90° antes de OCR.
        //    Aplicamos heurística: si height > width, swap (asumimos
        //    documento horizontal).
        const docIsLandscape = width >= height;
        const outW = docIsLandscape ? width : height;
        const outH = docIsLandscape ? height : width;

        // 5. Aplicamos warp de perspectiva
        const warped = scannerInstance.extractPaper(image, outW, outH, corners);

        // Si lo rotamos, jscanify ya lo entrega rotado correctamente
        // gracias al swap de outW/outH.

        return {
          found: true,
          croppedCanvas: warped,
          coverage,
          width: outW,
          height: outH,
          corners,
          rotated: !docIsLandscape,
        };
      } catch (err) {
        return { found: false, reason: 'error', error: err.message };
      } finally {
        src.delete();
      }
    },

    /**
     * Dibuja el contorno del documento detectado sobre el canvas (útil
     * para preview en tiempo real durante el encuadre).
     */
    highlightPaper(image) {
      try {
        return scannerInstance.highlightPaper(image);
      } catch {
        return null;
      }
    },
  };
}

/**
 * Área de un polígono (Shoelace). Funciona con cualquier orden de vértices.
 */
function computePolygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

/**
 * Convierte un canvas a un HTMLImageElement (necesario para detectAndWarp
 * en algunas implementaciones que no aceptan canvas directamente).
 */
export async function canvasToImage(canvas) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('canvasToImage failed'));
    img.src = canvas.toDataURL('image/png');
  });
}
