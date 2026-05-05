// HALO Name Validator — frontend para GitHub Pages.
//
// 3 modos posibles para la capa AI (de mejor a peor para producción):
//   ① PROXY     — la URL del proxy backend está configurada en localStorage.
//                 La key vive en el servidor. Modo recomendado.
//   ② DIRECT    — sólo hay API key en sessionStorage. El browser llama a
//                 api.anthropic.com directamente. Sólo para demos.
//   ③ STATIC    — ni proxy ni key. Sólo capas estáticas (formato + listas
//                 + concat). Sigue siendo útil: pilla ~80% de los casos.

import { validateName } from './lib/validator.js';

const $ = (sel) => document.querySelector(sel);

// ── DOM refs ────────────────────────────────────────────────────────────
const input = $('#name-input');
const button = $('#validate-btn');
const skipAI = $('#skip-ai');
const result = $('#result');
const verdictPill = $('#verdict-pill');
const doubtPill = $('#doubt-pill');
const elapsedPill = $('#elapsed-pill');
const meterFill = $('#meter-fill');
const reasonsList = $('#reasons-list');
const metaInput = $('#meta-input');
const metaConcat = $('#meta-concat');
const metaDeleeted = $('#meta-deleeted');
const metaLayers = $('#meta-layers');
const rawJson = $('#raw-json');

const settingsPanel = $('#settings-panel');
const toggleSettings = $('#toggle-settings');
const aiModePill = $('#ai-mode-pill');
const aiModeDetail = $('#ai-mode-detail');

// Proxy
const proxyUrlInput = $('#proxy-url-input');
const saveProxy = $('#save-proxy');
const testProxy = $('#test-proxy');
const clearProxy = $('#clear-proxy');
const proxyStatus = $('#proxy-status');

// Direct API key
const apiKeyInput = $('#api-key-input');
const saveApiKey = $('#save-api-key');
const clearApiKey = $('#clear-api-key');
const keyStatus = $('#key-status');

// ── Storage helpers ─────────────────────────────────────────────────────
// Proxy URL → localStorage (persiste entre sesiones; no es secreto).
// API key   → sessionStorage (se borra al cerrar pestaña; sí es secreto).
const PROXY_STORE = 'halo-proxy-url';
const KEY_STORE   = 'halo-anthropic-key';

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

const getProxyUrl = () => safe(() => localStorage.getItem(PROXY_STORE) || '', '');
const setProxyUrl = (v) => safe(() => localStorage.setItem(PROXY_STORE, v));
const clearProxyUrl = () => safe(() => localStorage.removeItem(PROXY_STORE));

const getStoredKey = () => safe(() => sessionStorage.getItem(KEY_STORE) || '', '');
const setStoredKey = (v) => safe(() => sessionStorage.setItem(KEY_STORE, v));
const clearStoredKey = () => safe(() => sessionStorage.removeItem(KEY_STORE));

// ── Mode detection & UI ─────────────────────────────────────────────────
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
    aiModeDetail.textContent = 'Capa AI vía proxy backend. La API key vive en el servidor.';
  } else if (mode === 'direct') {
    aiModePill.classList.add('direct');
    aiModePill.textContent = '🟡 Browser-direct';
    aiModeDetail.textContent = 'Capa AI activa, pero la key se envía desde este navegador. Sólo demos.';
  } else {
    aiModePill.classList.add('staticonly');
    aiModePill.textContent = '⚪ Sólo capas estáticas';
    aiModeDetail.textContent = 'Configura un backend proxy o una API key para activar la capa semántica.';
  }

  // Per-section hints
  const url = getProxyUrl();
  if (url) {
    proxyStatus.textContent = `✓ Proxy configurado: ${url}`;
    proxyStatus.style.color = 'var(--ok)';
  } else {
    proxyStatus.textContent = 'Sin proxy configurado.';
    proxyStatus.style.color = 'var(--fg-dim)';
  }

  const k = getStoredKey();
  if (k) {
    keyStatus.textContent = `✓ Key cargada (sk-ant-…${k.slice(-6)}). Sólo válida en esta pestaña.`;
    keyStatus.style.color = 'var(--warn)';
  } else {
    keyStatus.textContent = 'Sin clave directa.';
    keyStatus.style.color = 'var(--fg-dim)';
  }
}

// ── Validation ──────────────────────────────────────────────────────────
async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = 'Validando…';

  try {
    const proxyUrl = getProxyUrl() || null;
    const apiKey = proxyUrl ? null : (getStoredKey() || null);
    // Precedencia: proxy > direct > static-only
    const data = await validateName(name, {
      skipAI: skipAI.checked,
      proxyUrl,
      apiKey,
    });
    render(data);
  } catch (err) {
    renderError(err);
  } finally {
    button.disabled = false;
    button.textContent = 'Validar';
  }
}

function render(data) {
  result.classList.remove('hidden');

  verdictPill.className = `verdict ${data.verdict}`;
  verdictPill.textContent =
    data.verdict === 'ALLOWED' ? 'PERMITIDO' :
    data.verdict === 'REVIEW' ? 'REVISAR' :
    data.verdict === 'REJECTED' ? 'RECHAZADO' :
    data.verdict ?? '—';

  const doubt = Math.max(0, Math.min(100, data.doubt_percent ?? 0));
  doubtPill.textContent = `duda ${doubt}%`;
  elapsedPill.textContent = `${data.elapsed_ms ?? 0} ms`;
  meterFill.style.width = `${doubt}%`;

  reasonsList.innerHTML = '';
  for (const reason of data.reasons ?? []) {
    const li = document.createElement('li');
    li.className = reason.severity ?? 'low';
    li.innerHTML = `
      <span class="src">${escapeHtml(reason.source)}</span>
      ${escapeHtml(reason.message)}
    `;
    reasonsList.appendChild(li);
  }
  if (!(data.reasons ?? []).length) {
    const li = document.createElement('li');
    li.className = 'low';
    li.textContent = 'Sin observaciones — input limpio.';
    reasonsList.appendChild(li);
  }

  metaInput.textContent = data.input ?? '—';
  metaConcat.textContent = data.normalized?.concatNoSpaces ?? '—';
  metaDeleeted.textContent = data.normalized?.deLeeted ?? '—';
  const ls = data.layer_summary ?? {};
  metaLayers.textContent =
    `format=${ls.format_issues ?? 0} · ` +
    `static=${ls.static_issues ?? 0} · ` +
    `ai=${ls.ai_run ? '✓' : ls.ai_skipped_due_to_static_block ? '⏭ (saltado por hit estático)' : '✗'}` +
    ` · mode=${activeMode()}`;

  rawJson.textContent = JSON.stringify(data, null, 2);
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderError(err) {
  result.classList.remove('hidden');
  verdictPill.className = 'verdict REJECTED';
  verdictPill.textContent = 'ERROR';
  doubtPill.textContent = 'duda ?';
  elapsedPill.textContent = '–';
  meterFill.style.width = '0%';
  reasonsList.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'high';
  li.textContent = err?.message ?? String(err);
  reasonsList.appendChild(li);
  rawJson.textContent = String(err?.stack ?? err);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Wiring: validate ────────────────────────────────────────────────────
button.addEventListener('click', validate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validate();
});
document.querySelectorAll('.ex').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.textContent;
    validate();
  });
});

// ── Wiring: settings panel toggle ───────────────────────────────────────
toggleSettings.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
  if (!settingsPanel.classList.contains('hidden')) {
    proxyUrlInput.value = getProxyUrl();
    apiKeyInput.value = getStoredKey();
  }
});

// ── Wiring: proxy URL ───────────────────────────────────────────────────
saveProxy.addEventListener('click', () => {
  const v = proxyUrlInput.value.trim();
  if (!v) return;
  if (!/^https?:\/\//i.test(v)) {
    alert('La URL debe empezar por http:// o https://');
    return;
  }
  setProxyUrl(v);
  refreshAIModeUI();
});

testProxy.addEventListener('click', async () => {
  const v = proxyUrlInput.value.trim() || getProxyUrl();
  if (!v) {
    alert('Pega primero una URL.');
    return;
  }
  proxyStatus.textContent = '⏳ Probando…';
  proxyStatus.style.color = 'var(--fg-dim)';
  // El endpoint health vive en el path raíz del proxy, no en /api/ai-check
  const healthUrl = v.replace(/\/api\/ai-check\/?$/, '/api/health');
  try {
    const r = await fetch(healthUrl, { method: 'GET' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    proxyStatus.textContent =
      `✓ Conectado · model=${data.model ?? '?'} · ` +
      `ai_layer=${data.ai_layer ? '✓' : '✗'}` +
      (data.mode ? ` · ${data.mode}` : '');
    proxyStatus.style.color = 'var(--ok)';
  } catch (err) {
    proxyStatus.textContent = `✗ No accesible: ${err?.message ?? err}`;
    proxyStatus.style.color = 'var(--bad)';
  }
});

clearProxy.addEventListener('click', () => {
  clearProxyUrl();
  proxyUrlInput.value = '';
  refreshAIModeUI();
});

// ── Wiring: API key directa ─────────────────────────────────────────────
saveApiKey.addEventListener('click', () => {
  const v = apiKeyInput.value.trim();
  if (!v) return;
  if (!v.startsWith('sk-ant-')) {
    if (!confirm('La clave no empieza por "sk-ant-". ¿Guardar igualmente?')) return;
  }
  setStoredKey(v);
  apiKeyInput.value = '';
  refreshAIModeUI();
});

clearApiKey.addEventListener('click', () => {
  clearStoredKey();
  apiKeyInput.value = '';
  refreshAIModeUI();
});

// ── Boot ────────────────────────────────────────────────────────────────
refreshAIModeUI();
input.focus();
