// HALO Name Validator — frontend para GitHub Pages.
//
// 3 modos para la capa AI:
//   ① PROXY   — URL backend en localStorage. Key vive en servidor.
//   ② DIRECT  — clave en sessionStorage (sólo demos).
//   ③ STATIC  — sólo capas estáticas.
//
// + Validación humana: un revisor (cuyo nombre se guarda en localStorage)
// puede aprobar manualmente cualquier nombre. Las aprobaciones se guardan
// en localStorage como `humanApprovals[normalizedKey] = { name, approvers[]}`.

import { validateName } from './lib/validator.js';
import { buildVariants } from './lib/normalize.js';
import { DocumentCamera } from './lib/ocr/camera.js';
import { DocumentScanner } from './lib/ocr/documentScanner.js';
import { terminateWorker } from './lib/ocr/tesseractOcr.js';

const $ = (sel) => document.querySelector(sel);

// ── DOM ─────────────────────────────────────────────────────────────────
const input = $('#name-input');
const validateBtn = $('#validate-btn');
const result = $('#result');
const verdictBig = $('#verdict-big');
const doubtTag = $('#doubt-tag');
const meterFill = $('#meter-fill');
const reasonsList = $('#reasons-list');
const humanInfo = $('#human-info');
const approveBtn = $('#approve-btn');
const metaConcat = $('#meta-concat');
const metaLayers = $('#meta-layers');
const rawJson = $('#raw-json');

const aiModePill = $('#ai-mode-pill');
const aiModeDetail = $('#ai-mode-detail');
const proxyUrlInput = $('#proxy-url-input');
const saveProxyBtn = $('#save-proxy');
const testProxyBtn = $('#test-proxy');
const clearProxyBtn = $('#clear-proxy');
const proxyStatus = $('#proxy-status');
const apiKeyInput = $('#api-key-input');
const saveApiKeyBtn = $('#save-api-key');
const clearApiKeyBtn = $('#clear-api-key');
const keyStatus = $('#key-status');

const reviewerInput = $('#reviewer-input');
const saveReviewerBtn = $('#save-reviewer');
const reviewerStatus = $('#reviewer-status');
const examplesBody = $('#examples-body');
const approvalsList = $('#approvals-list');

// ── Storage helpers ─────────────────────────────────────────────────────
const PROXY_STORE = 'halo-proxy-url';
const KEY_STORE = 'halo-anthropic-key';
const REVIEWER_STORE = 'halo-reviewer-name';
const APPROVALS_STORE = 'halo-human-approvals';

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

const getProxyUrl   = () => safe(() => localStorage.getItem(PROXY_STORE) || '', '');
const setProxyUrl   = (v) => safe(() => localStorage.setItem(PROXY_STORE, v));
const clearProxyUrl = () => safe(() => localStorage.removeItem(PROXY_STORE));

const getStoredKey  = () => safe(() => sessionStorage.getItem(KEY_STORE) || '', '');
const setStoredKey  = (v) => safe(() => sessionStorage.setItem(KEY_STORE, v));
const clearStoredKey = () => safe(() => sessionStorage.removeItem(KEY_STORE));

const getReviewer = () => safe(() => localStorage.getItem(REVIEWER_STORE) || '', '');
const setReviewer = (v) => safe(() => localStorage.setItem(REVIEWER_STORE, v));

function getApprovals() {
  return safe(() => JSON.parse(localStorage.getItem(APPROVALS_STORE) || '{}'), {});
}
function setApprovals(obj) {
  safe(() => localStorage.setItem(APPROVALS_STORE, JSON.stringify(obj)));
}
function approvalKeyFor(name) {
  // Clave normalizada: case-insensitive, sin acentos, sin espacios, sin
  // puntuación. Así "Aitor Tilla" y "AITOR  TILLA." y "aitortilla" comparten
  // la misma entrada de aprobación.
  return buildVariants(name).concatNoSpaces || name.toLowerCase();
}

// ── Mode UI ─────────────────────────────────────────────────────────────
function activeMode() {
  if (getProxyUrl()) return 'proxy';
  if (getStoredKey()) return 'direct';
  return 'static';
}

function refreshAIModeUI() {
  const mode = activeMode();
  aiModePill.classList.remove('proxy', 'direct', 'staticonly');
  if (mode === 'proxy') {
    aiModePill.classList.add('proxy');
    aiModePill.textContent = '🟢 Proxy activo';
    aiModeDetail.textContent = 'La capa de IA usa el proxy. La clave reside en el servidor.';
  } else if (mode === 'direct') {
    aiModePill.classList.add('direct');
    aiModePill.textContent = '🟡 Llamada directa';
    aiModeDetail.textContent = 'IA activa con clave guardada en este navegador. Sólo para demos.';
  } else {
    aiModePill.classList.add('staticonly');
    aiModePill.textContent = '⚪ Sólo listas estáticas';
    aiModeDetail.textContent = 'Sin IA. Configura un proxy o pega una clave para activarla.';
  }

  proxyStatus.textContent = getProxyUrl()
    ? `✓ ${getProxyUrl()}`
    : 'Sin proxy configurado.';
  proxyStatus.style.color = getProxyUrl() ? 'var(--ok)' : 'var(--fg-dim)';

  const k = getStoredKey();
  keyStatus.textContent = k
    ? `✓ Clave cargada (…${k.slice(-6)}). Sólo válida en esta pestaña.`
    : 'Sin clave directa.';
  keyStatus.style.color = k ? 'var(--warn)' : 'var(--fg-dim)';

  const reviewer = getReviewer();
  reviewerStatus.textContent = reviewer
    ? `✓ Validador: ${reviewer}`
    : 'Sin validador configurado.';
  reviewerStatus.style.color = reviewer ? 'var(--ok)' : 'var(--fg-dim)';
}

// ── Validación principal ────────────────────────────────────────────────
async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  validateBtn.disabled = true;
  validateBtn.textContent = '…';

  try {
    const proxyUrl = getProxyUrl() || null;
    const apiKey = proxyUrl ? null : (getStoredKey() || null);
    const data = await validateName(name, { proxyUrl, apiKey });
    render(name, data);
  } catch (err) {
    renderError(err);
  } finally {
    validateBtn.disabled = false;
    validateBtn.textContent = 'Validar';
  }
}

function verdictLabel(v) {
  return v === 'ALLOWED' ? 'PERMITIDO'
    : v === 'REVIEW' ? 'REVISAR'
    : v === 'REJECTED' ? 'RECHAZADO'
    : v ?? '—';
}

function render(originalName, data) {
  result.classList.remove('hidden');

  const verdict = data.verdict;
  verdictBig.className = `verdict-big ${verdict}`;
  verdictBig.textContent = verdictLabel(verdict);

  const doubt = Math.max(0, Math.min(100, data.doubt_percent ?? 0));
  doubtTag.textContent = `duda ${doubt}%`;
  meterFill.style.width = `${doubt}%`;

  // Razones
  reasonsList.innerHTML = '';
  for (const r of data.reasons ?? []) {
    const li = document.createElement('li');
    li.className = r.severity ?? 'low';
    li.textContent = r.message;
    reasonsList.appendChild(li);
  }
  if (!(data.reasons ?? []).length) {
    const li = document.createElement('li');
    li.className = 'low';
    li.textContent = 'Sin observaciones — el nombre está limpio.';
    reasonsList.appendChild(li);
  }

  // Detalle técnico
  metaConcat.textContent = data.normalized?.concatNoSpaces ?? '—';
  const ls = data.layer_summary ?? {};
  metaLayers.textContent =
    `formato=${ls.format_issues ?? 0} · ` +
    `estática=${ls.static_issues ?? 0} · ` +
    `ia=${ls.ai_run ? '✓' : ls.ai_skipped_due_to_static_block ? '⏭' : '✗'} · ` +
    `modo=${activeMode()}`;
  rawJson.textContent = JSON.stringify(data, null, 2);

  // Validación humana
  renderHumanBox(originalName, verdict);

  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderError(err) {
  result.classList.remove('hidden');
  verdictBig.className = 'verdict-big REJECTED';
  verdictBig.textContent = 'ERROR';
  doubtTag.textContent = '—';
  meterFill.style.width = '0%';
  reasonsList.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'high';
  li.textContent = err?.message ?? String(err);
  reasonsList.appendChild(li);
  rawJson.textContent = String(err?.stack ?? err);
  humanInfo.innerHTML = '';
  approveBtn.classList.add('hidden');
}

// ── Validación humana ──────────────────────────────────────────────────
function renderHumanBox(originalName, verdict) {
  const key = approvalKeyFor(originalName);
  const approvals = getApprovals();
  const entry = approvals[key];

  // Mostrar info de aprobaciones previas si existen
  humanInfo.innerHTML = '';
  if (entry && entry.approvers?.length) {
    const last = entry.approvers[entry.approvers.length - 1];
    const count = entry.approvers.length;
    const approverNames = [...new Set(entry.approvers.map(a => a.name))].join(', ');
    const badge = document.createElement('div');
    badge.className = 'human-badge';
    badge.innerHTML = `
      <strong>✅ Aprobado manualmente ${count}× — última: ${escapeHtml(last.name)}</strong>
      <span class="approvers">por ${escapeHtml(approverNames)}</span>
    `;
    humanInfo.appendChild(badge);
  }

  // Botón de aprobación: visible cuando el sistema NO permite (REVIEW o REJECTED)
  if (verdict === 'REVIEW' || verdict === 'REJECTED') {
    approveBtn.classList.remove('hidden');
    approveBtn.onclick = () => approveManually(originalName);
  } else {
    approveBtn.classList.add('hidden');
  }
}

function approveManually(name) {
  let reviewer = getReviewer();
  if (!reviewer) {
    reviewer = (prompt('Antes de aprobar, dinos tu nombre o ID (se guardará para próximas aprobaciones):') || '').trim();
    if (!reviewer) return;
    setReviewer(reviewer);
    refreshAIModeUI();
  }
  const reason = (prompt('¿Razón de la aprobación? (opcional)') || '').trim();
  const key = approvalKeyFor(name);
  const approvals = getApprovals();
  const entry = approvals[key] || { name, approvers: [] };
  entry.name = name; // actualiza la grafía a la última usada
  entry.approvers.push({
    name: reviewer,
    timestamp: new Date().toISOString(),
    reason: reason || null,
  });
  approvals[key] = entry;
  setApprovals(approvals);

  renderHumanBox(name, /* re-render en estado actual */ verdictBig.textContent === 'PERMITIDO' ? 'ALLOWED' : verdictBig.textContent === 'REVISAR' ? 'REVIEW' : 'REJECTED');
  refreshApprovalsList();
  // Feedback visual
  const oldText = approveBtn.textContent;
  approveBtn.textContent = '✓ Registrada';
  setTimeout(() => { approveBtn.textContent = oldText; }, 1500);
}

function refreshApprovalsList() {
  const approvals = getApprovals();
  const entries = Object.entries(approvals);
  approvalsList.innerHTML = '';
  if (!entries.length) {
    approvalsList.innerHTML = '<p class="hint">Aún no hay aprobaciones registradas en este navegador.</p>';
    return;
  }
  // Ordena por nº de aprobaciones desc.
  entries.sort((a, b) => b[1].approvers.length - a[1].approvers.length);
  for (const [, entry] of entries) {
    const row = document.createElement('div');
    row.className = 'approval-row';
    const last = entry.approvers[entry.approvers.length - 1];
    const allNames = [...new Set(entry.approvers.map(a => a.name))].join(', ');
    row.innerHTML = `
      <strong>${escapeHtml(entry.name)}</strong>
      <span class="approvers-line">
        ${entry.approvers.length}× · última: ${escapeHtml(last.name)} (${new Date(last.timestamp).toLocaleString('es-ES')}) · revisores: ${escapeHtml(allNames)}
      </span>
    `;
    approvalsList.appendChild(row);
  }
}

// ── Examples (inyectados por JS para que el HTML quede limpio) ──────────
const EXAMPLES = [
  {
    title: 'Nombres legítimos y piropos',
    cls: 'ok',
    items: [
      'Vinicius Jr.', 'Jude Bellingham', 'María Hernández', 'Cristiano Ronaldo',
      'Hala Madrid', 'Ángela Guardiola Guardiola', 'Léa Seydoux', 'Joao Silva',
      'Vinicius crack', 'Vinicius rey', 'Bellingham campeón',
    ],
  },
  {
    title: '🚨 Insultos a jugadores (racismo + físicos + homofobia)',
    cls: 'bad',
    items: [
      'Vinicius mono', 'Mbappé mono', 'Vinicius monkey', 'Vinicius singe',
      'Vinicius macaco', 'Camavinga macaco', 'Pogba monkey', 'Pelé negro',
      'Vinicius gordo', 'Bellingham viejo', 'Modric viejo', 'Cristiano feo',
      'Messi enano', 'Vinicius gay',
    ],
  },
  {
    title: 'Apellidos rivales legítimos (CRÍTICOS — deben pasar)',
    cls: 'ok',
    items: [
      'Marta Iniesta', 'Pedro Piqué López', 'Juan Puyol', 'Carlos Messi García',
      'María Mearín',
    ],
  },
  {
    title: 'Trampas castellanas (h muda, b↔v, w→gu)',
    cls: 'bad',
    items: [
      'Carlos Gil Hipoyas', 'Mar Higuan Arica', 'Mecago Entumadre',
      'Prin Gado', 'Warra', 'Pepo Yadura', 'Esther Colero',
      'Doli Dadelano', 'Carmen Abo Duro', 'Carme Gustaela Nal',
      'Eugenio Dela Lampara',
    ],
  },
  {
    title: 'Re-segmentaciones generativas (ideal para probar la IA)',
    cls: 'bad',
    items: [
      'Kepa Jote Mecho',
      'María Unpajote',
      'Ione Cesi Tomear',
      'María Tepajote',
      'Pepe Necesitomear',
      'Ana Comemelapolla',
    ],
  },
  {
    title: 'Apellidos sospechosos pero LEGÍTIMOS (INE) — deben pasar',
    cls: 'ok',
    items: [
      'Carlos Gay López',
      'María Gay Sánchez',
      'Juan Gay',
      'María Mearín',
      'Sergio Iniesta García',
    ],
  },
  {
    title: 'Trampas de espaciado / leet / inversión',
    cls: 'bad',
    items: ['M E S S I', 'F.U.C.K', 'pu7a', 'atup', 'ANO'],
  },
  {
    title: 'Trampas Unicode (cirílico, griego, fullwidth, Math Bold, Zalgo)',
    cls: 'bad',
    items: [
      'Аitor Тilla',                       // cirílico А, Т
      'Виniciυs mono',                     // mezcla cirílico+griego
      'Mіke Hunt',                         // и cirílica
      'Ｖｉｎｉｃｉｕｓ ｍｏｎｏ',                  // fullwidth
      '𝐕𝐢𝐧𝐢𝐜𝐢𝐮𝐬 𝐦𝐨𝐧𝐨',                          // Mathematical Bold
      '𝓥𝓲𝓷𝓲𝓬𝓲𝓾𝓼 𝓶𝓸𝓷𝓸',                          // Mathematical Script
    ],
  },
  {
    title: 'Nombres-broma ES',
    cls: 'bad',
    items: ['Aitor Tilla', 'Susana Oria', 'Mario Neta', 'Lola Mento', 'Helio Cóptero'],
  },
  {
    title: 'Nombres-broma EN',
    cls: 'bad',
    items: ['Mike Hunt', 'Hugh Jass', 'Ben Dover', 'Phil McCavity', 'Phil Mecavity'],
  },
  {
    title: 'Nombres-broma FR',
    cls: 'bad',
    items: ['Jean Bon', 'Paul Ochon', 'Sacha Touille', 'Anne Culé', 'Vive le barca'],
  },
  {
    title: 'Vulgar PT (BR + EU)',
    cls: 'bad',
    items: ['Cu Doce', 'Maria Calça-Cu', 'Vai Tomar No Cu', 'Filho da Puta'],
  },
  {
    title: 'Apellidos rivales únicos solos',
    cls: 'bad',
    items: ['Messi', 'Cruyff', 'Lewandowski', 'Ronaldinho'],
  },
  {
    title: 'Apellidos rivales comunes (revisión humana)',
    cls: 'sus',
    items: ['Iniesta', 'Guardiola', 'Puyol', 'Piqué'],
  },
  {
    title: 'Anti-Madrid: chants pro-Barça',
    cls: 'bad',
    items: ['Blaugrana', 'Viva el Barça', 'Hala Barça', 'Madrid de mierda'],
  },
];

function renderExamples() {
  examplesBody.innerHTML = '';
  for (const group of EXAMPLES) {
    const wrap = document.createElement('div');
    wrap.className = 'examples-group';
    const title = document.createElement('h5');
    title.textContent = group.title;
    wrap.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'examples-grid';
    for (const item of group.items) {
      const btn = document.createElement('button');
      btn.className = `ex ${group.cls}`;
      btn.textContent = item;
      btn.addEventListener('click', () => {
        input.value = item;
        validate();
      });
      grid.appendChild(btn);
    }
    wrap.appendChild(grid);
    examplesBody.appendChild(wrap);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Wiring ──────────────────────────────────────────────────────────────
validateBtn.addEventListener('click', validate);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') validate(); });

saveProxyBtn.addEventListener('click', () => {
  const v = proxyUrlInput.value.trim();
  if (!v) return;
  if (!/^https?:\/\//i.test(v)) {
    alert('La URL debe comenzar por http:// o https://');
    return;
  }
  setProxyUrl(v);
  refreshAIModeUI();
});
testProxyBtn.addEventListener('click', async () => {
  const v = proxyUrlInput.value.trim() || getProxyUrl();
  if (!v) { alert('Introduce primero una URL.'); return; }
  proxyStatus.textContent = '⏳ Probando…';
  proxyStatus.style.color = 'var(--fg-dim)';
  const healthUrl = v.replace(/\/api\/ai-check\/?$/, '/api/health');
  try {
    const r = await fetch(healthUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    proxyStatus.textContent =
      `✓ Conectado · modelo=${data.model ?? '?'} · IA=${data.ai_layer ? '✓' : '✗'}`;
    proxyStatus.style.color = 'var(--ok)';
  } catch (err) {
    proxyStatus.textContent = `✗ No accesible: ${err?.message ?? err}`;
    proxyStatus.style.color = 'var(--bad)';
  }
});
clearProxyBtn.addEventListener('click', () => {
  clearProxyUrl();
  proxyUrlInput.value = '';
  refreshAIModeUI();
});

saveApiKeyBtn.addEventListener('click', () => {
  const v = apiKeyInput.value.trim();
  if (!v) return;
  if (!v.startsWith('sk-ant-')) {
    if (!confirm('La clave no comienza por "sk-ant-". ¿Guardar de todos modos?')) return;
  }
  setStoredKey(v);
  apiKeyInput.value = '';
  refreshAIModeUI();
});
clearApiKeyBtn.addEventListener('click', () => {
  clearStoredKey();
  apiKeyInput.value = '';
  refreshAIModeUI();
});

saveReviewerBtn.addEventListener('click', () => {
  const v = reviewerInput.value.trim();
  if (!v) return;
  setReviewer(v);
  reviewerInput.value = '';
  refreshAIModeUI();
});

// ──────────────────────────────────────────────────────────────────────
//  Escáner de documento (cámara + Tesseract + MRZ + DNI)
// ──────────────────────────────────────────────────────────────────────
const scanBtn = $('#scan-btn');
const scanModal = $('#scan-modal');
const scanClose = $('#scan-close');
const scanVideo = $('#scan-video');
const scanCapture = $('#scan-capture');
const scanFile = $('#scan-file');
const scanPreviewImg = $('#scan-preview-img');
const scanPreviewImg2 = $('#scan-preview-img-2');
const scanProgressFill = $('#scan-progress-fill');
const scanProgressText = $('#scan-progress-text');
const scanExtractedData = $('#scan-extracted-data');
const scanAuthenticity = $('#scan-authenticity');
const scanRawText = $('#scan-raw-text');
const scanUseName = $('#scan-use-name');
const scanRetry = $('#scan-retry');
const scanErrorMsg = $('#scan-error-msg');
const scanErrorRetry = $('#scan-error-retry');

const stages = {
  camera: $('#scan-stage-camera'),
  processing: $('#scan-stage-processing'),
  result: $('#scan-stage-result'),
  error: $('#scan-stage-error'),
};

function showStage(name) {
  for (const [n, el] of Object.entries(stages)) {
    el.classList.toggle('hidden', n !== name);
  }
}

let camera = null;
let lastResult = null;

async function openScanner() {
  scanModal.classList.remove('hidden');
  showStage('camera');
  if (!camera) camera = new DocumentCamera(scanVideo);
  try {
    await camera.start({ facingMode: 'environment' });
  } catch (err) {
    showError(err?.message ?? String(err));
  }
}

function closeScanner() {
  if (camera) {
    camera.stop();
  }
  scanModal.classList.add('hidden');
  // Termina el worker tras cerrar para liberar ~30MB de RAM
  terminateWorker().catch(() => {});
}

function showError(msg) {
  showStage('error');
  scanErrorMsg.textContent = msg;
}

function setProgress(progress, text) {
  scanProgressFill.style.width = `${Math.round(progress * 100)}%`;
  if (text) scanProgressText.textContent = text;
}

function progressLabel(stage, status) {
  const stageLabel = {
    'analyze': 'Analizando imagen',
    'detect-document': 'Detectando bordes del documento',
    'quality': 'Evaluando calidad',
    'preprocess': 'Preprocesando imagen',
    'ocr-pass-1': 'OCR pasada 1 (recortado)',
    'ocr-pass-2': 'OCR pasada 2 (preprocesado)',
    'ocr-multi': 'OCR multi-pass',
    'ocr-general': 'Reconociendo texto',
    'ocr-mrz-zone': 'Reconociendo zona MRZ',
    'mrz-parse': 'Parseando MRZ',
    'detect-type': 'Identificando tipo de documento',
    'dni-front': 'Parsing DNI español frontal',
    'passport-front': 'Parsing pasaporte',
    'driving-license': 'Parsing carnet de conducir',
    'dni-spain': 'Detectando DNI/NIE',
    // Camino Claude Vision
    'ai-vision-probe': 'Comprobando proxy AI',
    'ai-vision-prepare': 'Preparando imagen para Claude',
    'ai-vision-encode': 'Codificando imagen',
    'ai-vision-request': 'Enviando a Claude Vision (3-6s)',
    'ai-vision-parse': 'Procesando respuesta de Claude',
    'ai-vision-done': 'Claude Vision completado',
    'ai-vision-fallback': 'Claude no disponible — usando OCR local',
  }[stage] || stage;
  return status ? `${stageLabel}: ${status}` : stageLabel;
}

async function processImage(imageSource) {
  showStage('processing');
  scanPreviewImg.src = imageSource.dataUrl;
  scanPreviewImg2.src = imageSource.dataUrl;
  setProgress(0, 'Cargando OCR…');

  // Detener cámara mientras procesamos (libera la cámara para otros usos)
  if (camera) camera.stop();

  const scanner = new DocumentScanner();
  try {
    const result = await scanner.scan(imageSource.blob, {
      proxyUrl: getProxyUrl() || null,
      onProgress: ({ stage, status, progress }) => {
        setProgress(progress ?? 0, progressLabel(stage, status));
      },
    });
    lastResult = result;
    // Si jscanify recortó+enderezó el documento, mostramos esa imagen
    // en el preview de resultado (más útil que la foto cruda).
    if (result.croppedDataUrl) {
      scanPreviewImg2.src = result.croppedDataUrl;
    }
    renderResult(result);
  } catch (err) {
    showError(err?.message ?? String(err));
  }
}

function renderResult(result) {
  showStage('result');

  // ── Indicador de modo (Claude Vision vs OCR local) ─────────────────────
  const modeBadge = $('#scan-mode-badge');
  if (modeBadge) {
    if (result.mode === 'claude-vision') {
      modeBadge.className = 'mode-badge mode-ai';
      modeBadge.textContent = `⚡ Claude Vision · ${result.modelUsed ?? 'sonnet-4-6'}`;
    } else {
      modeBadge.className = 'mode-badge mode-local';
      modeBadge.textContent = '🔧 OCR local (Tesseract)';
    }
    modeBadge.classList.remove('hidden');
  }

  // ── Calidad de foto (visible al inicio para feedback rápido)
  const qBox = $('#scan-quality');
  if (result.photoQuality) {
    const q = result.photoQuality;
    qBox.className = `quality-box ${q.quality}`;
    const label = { good: '✓ Foto buena', fair: '⚠ Foto regular', poor: '🚨 Foto mala' }[q.quality];
    const hintsHtml = q.hints?.length
      ? '<ul>' + q.hints.map((h) => `<li>${escapeHtml(h)}</li>`).join('') + '</ul>'
      : '';
    qBox.innerHTML = `<div class="q-title">${label} · calidad ${q.score}/100</div>${hintsHtml}`;
    qBox.classList.remove('hidden');
  } else {
    qBox.classList.add('hidden');
  }

  // ── Detalle técnico de las pasadas OCR
  const ocrDetail = $('#scan-ocr-detail');
  if (result.passes?.length) {
    ocrDetail.innerHTML = result.passes
      .map(
        (p) =>
          `<dt>Pasada ${escapeHtml(p.label)}</dt>` +
          `<dd>conf ${p.confidence?.toFixed?.(1) ?? '?'}% · ${p.length} chars</dd>`,
      )
      .join('');
  } else {
    ocrDetail.innerHTML = '';
  }

  // Si la foto fue rechazada por calidad mala, no seguimos
  if (result.qualityRejected) {
    $('#scan-extracted-data').innerHTML =
      '<dt>—</dt><dd>Foto rechazada por calidad. Sigue las sugerencias arriba y reintenta.</dd>';
    $('#scan-authenticity').classList.add('hidden');
    $('#scan-use-name').disabled = true;
    return;
  }
  $('#scan-authenticity').classList.remove('hidden');

  // Datos extraídos
  scanExtractedData.innerHTML = '';
  const docTypeLabel = {
    'TD3': 'Pasaporte (MRZ)',
    'TD1': 'DNI/ID (MRZ)',
    'TD2': 'Documento ICAO TD2',
    'DNI': 'DNI español',
    'NIE': 'NIE español',
    'PASSPORT': 'Pasaporte',
    'DRIVING_LICENSE': 'Carnet de conducir',
    'unknown': '—',
  }[result.documentType] || result.documentType;
  const rows = [
    ['Nombre completo', result.fullName, 'value-name'],
    ['Tipo de documento', `${docTypeLabel} · ${result.issuingCountry ?? '?'}`],
    ['Número', result.documentNumber || '—'],
    ['Fecha de nacimiento', result.birthDate?.iso ?? '—'],
    ['Fecha de expiración', result.expiryDate?.iso ?? '—'],
    ['Sexo', result.mrz?.sex ?? result.passportFront?.sex ?? '—'],
    ['Categorías (carnet)', result.categories?.join(', ') ?? '—'],
  ];
  for (const [label, value, cls] of rows) {
    if (!value || value === '—') continue;
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    if (cls) dd.classList.add(cls);
    scanExtractedData.appendChild(dt);
    scanExtractedData.appendChild(dd);
  }

  // Autenticidad
  const auth = result.authenticity;
  scanAuthenticity.className = 'authenticity-box ' + (auth.passed ? 'ok' : auth.suspectedFake ? 'bad' : 'warn');
  const verdict = auth.passed
    ? `✓ Aparenta ser auténtico (${auth.score}/100)`
    : auth.suspectedFake
      ? `⚠ Sospechoso de falsificación (${auth.score}/100)`
      : `? Resultado parcial (${auth.score}/100)`;
  const detailParts = [];
  if (auth.checks.mrzChecksums) {
    detailParts.push(`MRZ ${auth.checks.mrzChecksums.passed}/${auth.checks.mrzChecksums.total}`);
  }
  if (auth.checks.dniLetter) {
    detailParts.push(`Letra DNI ${auth.checks.dniLetter.valid ? '✓' : '✗'}`);
  }
  if (auth.checks.dates?.expired === true) {
    detailParts.push('expirado');
  }
  scanAuthenticity.innerHTML = `
    <div class="auth-title">${escapeHtml(verdict)}</div>
    <div class="auth-detail">${escapeHtml(detailParts.join(' · '))}</div>
  `;

  // Raw text
  scanRawText.textContent = result.rawText || '(sin texto)';

  // Si no extrajo nada, lo decimos
  if (!result.fullName) {
    scanAuthenticity.className = 'authenticity-box bad';
    scanAuthenticity.innerHTML = `
      <div class="auth-title">No se pudo extraer un nombre</div>
      <div class="auth-detail">Prueba con mejor iluminación, encuadre o foto más nítida.</div>
    `;
    scanUseName.disabled = true;
  } else {
    scanUseName.disabled = false;
  }
}

scanBtn.addEventListener('click', openScanner);
scanClose.addEventListener('click', closeScanner);

scanCapture.addEventListener('click', async () => {
  if (!camera) return;
  try {
    const captured = await camera.captureWithPreview();
    await processImage(captured);
  } catch (err) {
    showError(err?.message ?? String(err));
  }
});

scanFile.addEventListener('change', async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  if (camera) camera.stop();
  const reader = new FileReader();
  reader.onload = () => {
    processImage({ blob: f, dataUrl: reader.result });
  };
  reader.readAsDataURL(f);
});

scanRetry.addEventListener('click', async () => {
  showStage('camera');
  if (camera) await camera.start({ facingMode: 'environment' });
});
scanErrorRetry.addEventListener('click', async () => {
  showStage('camera');
  if (camera) await camera.start({ facingMode: 'environment' });
});

scanUseName.addEventListener('click', () => {
  if (lastResult?.fullName) {
    input.value = lastResult.fullName;
    closeScanner();
    validate();
  }
});

// Cierre del modal con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !scanModal.classList.contains('hidden')) closeScanner();
});

// ── Boot ────────────────────────────────────────────────────────────────
refreshAIModeUI();
renderExamples();
refreshApprovalsList();
input.focus();
