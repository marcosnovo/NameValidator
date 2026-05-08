// HALO Name Validator — frontend GitHub Pages (standalone).
//
// Features:
//   ▸ Validación cliente (lib/validator.js, sin backend)
//   ▸ Share por URL: ?name=… autocompleta y valida al cargar
//   ▸ Historial localStorage: últimas 10 validaciones
//   ▸ Copiar JSON al portapapeles
//   ▸ Atajos: / enfoca · Esc limpia · Cmd/Ctrl+K abre historial
//   ▸ BYO API key: Anthropic / OpenAI / Gemini en sessionStorage
//     (se borra al cerrar la pestaña; nunca sale del navegador)

import { validateName } from './lib/validator.js';

const $ = (sel) => document.querySelector(sel);

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
const healthStatus = $('#health-status');
const historyBtn = $('#history-btn');
const historyPanel = $('#history-panel');
const historyList = $('#history-list');
const historyClear = $('#history-clear');
const shareBtn = $('#share-btn');
const copyJsonBtn = $('#copy-json-btn');
const settingsBtn = $('#settings-btn');
const settingsPanel = $('#settings-panel');
const settingsClose = $('#settings-close');
const settingsWarn = $('#settings-warn');
const aiProvider = $('#ai-provider');
const aiKey = $('#ai-key');
const aiKeyToggle = $('#ai-key-toggle');
const aiSave = $('#ai-save');
const aiClear = $('#ai-clear');

const HISTORY_KEY = 'halo.history.v1';
const HISTORY_MAX = 10;
const AI_KEY = 'halo.aikey.v1';

let lastResult = null;
let aiCfg = loadAiCfg();
updateHealthBadge();

// ── Validation flow ─────────────────────────────────────
async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  button.disabled = true;
  const labelEl = button.querySelector('.btn-label');
  const oldLabel = labelEl?.textContent;
  if (labelEl) labelEl.textContent = 'Validando…';

  const t0 = performance.now();
  try {
    const opts = aiCfg?.apiKey
      ? { skipAI: skipAI.checked, apiKey: aiCfg.apiKey, provider: aiCfg.provider === 'auto' ? undefined : aiCfg.provider }
      : { skipAI: true };
    const verdict = await validateName(name, opts);
    const elapsed_ms = Math.round(performance.now() - t0);
    const data = { ...verdict, elapsed_ms, input: name };
    lastResult = data;
    render(data);
    pushHistory({ name, verdict: data.verdict, ts: Date.now() });
    updateUrl(name);
  } catch (err) {
    renderError(err);
  } finally {
    button.disabled = false;
    if (labelEl) labelEl.textContent = oldLabel ?? 'Validar';
  }
}

function render(data) {
  result.classList.remove('hidden');

  verdictPill.className = `verdict ${data.verdict}`;
  verdictPill.textContent =
    data.verdict === 'ALLOWED' ? 'Permitido' :
    data.verdict === 'REVIEW' ? 'Revisar' :
    data.verdict === 'REJECTED' ? 'Rechazado' :
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
      <span class="src">${escapeHtml(reason.source ?? '')}</span>
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
  if (metaDeleeted) {
    metaDeleeted.textContent = data.normalized?.deLeeted ?? '—';
  }
  const ls = data.layer_summary ?? {};
  const aiErrored = (data.reasons ?? []).some((r) => r.source === 'ai.error');
  const aiSym = ls.ai_run ? '✓' : aiErrored ? '✗' : '—';
  metaLayers.textContent =
    `format=${ls.format_issues ?? 0} · static=${ls.static_issues ?? 0} · ai=${aiSym}`;

  rawJson.textContent = JSON.stringify(data, null, 2);
}

function renderError(err) {
  result.classList.remove('hidden');
  verdictPill.className = 'verdict REJECTED';
  verdictPill.textContent = 'Error';
  doubtPill.textContent = 'duda ?';
  elapsedPill.textContent = '–';
  meterFill.style.width = '0%';
  reasonsList.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'high';
  li.textContent = err?.message ?? String(err);
  reasonsList.appendChild(li);
  rawJson.textContent = String(err);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Share por URL ───────────────────────────────────────
function updateUrl(name) {
  const url = new URL(window.location.href);
  url.searchParams.set('name', name);
  history.replaceState(null, '', url.toString());
}

function shareUrl() {
  if (!lastResult) return;
  const url = new URL(window.location.href);
  url.searchParams.set('name', lastResult.input);
  const link = url.toString();
  copyToClipboard(link, shareBtn);
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  if (name && name.trim()) {
    input.value = name.trim();
    validate();
  }
}

// ── Copiar al portapapeles ──────────────────────────────
async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    flashCopied(btn);
  } catch {
    // Fallback (legacy / inseguro)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashCopied(btn); } catch {}
    document.body.removeChild(ta);
  }
}

function flashCopied(btn) {
  if (!btn) return;
  const old = btn.textContent;
  btn.classList.add('copied');
  btn.textContent = '✓ copiado';
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.textContent = old;
  }, 1500);
}

function copyResultJson() {
  if (!lastResult) return;
  copyToClipboard(JSON.stringify(lastResult, null, 2), copyJsonBtn);
}

// ── Historial ───────────────────────────────────────────
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  } catch {}
}

function pushHistory(entry) {
  const list = loadHistory().filter((e) => e.name !== entry.name);
  list.unshift(entry);
  saveHistory(list);
  renderHistory();
}

function clearHistory() {
  saveHistory([]);
  renderHistory();
}

function renderHistory() {
  const list = loadHistory();
  historyList.innerHTML = '';
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Sin validaciones recientes.';
    historyList.appendChild(li);
    return;
  }
  for (const entry of list) {
    const li = document.createElement('li');
    li.dataset.verdict = entry.verdict;
    li.setAttribute('role', 'option');
    const sym =
      entry.verdict === 'ALLOWED' ? '✓' :
      entry.verdict === 'REJECTED' ? '✗' :
      entry.verdict === 'REVIEW' ? '?' : '·';
    li.innerHTML = `
      <span class="h-verdict">${sym}</span>
      <span class="h-name">${escapeHtml(entry.name)}</span>
      <span class="h-time">${formatRelative(entry.ts)}</span>
    `;
    li.addEventListener('click', () => {
      input.value = entry.name;
      toggleHistory(false);
      validate();
    });
    historyList.appendChild(li);
  }
}

function formatRelative(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function toggleHistory(force) {
  const willOpen = typeof force === 'boolean' ? force : historyPanel.classList.contains('hidden');
  if (willOpen) {
    renderHistory();
    historyPanel.classList.remove('hidden');
    historyBtn.setAttribute('aria-expanded', 'true');
  } else {
    historyPanel.classList.add('hidden');
    historyBtn.setAttribute('aria-expanded', 'false');
  }
}

// ── Settings (BYO API key) ──────────────────────────────
function loadAiCfg() {
  try {
    const raw = sessionStorage.getItem(AI_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.apiKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveAiCfg(cfg) {
  try { sessionStorage.setItem(AI_KEY, JSON.stringify(cfg)); } catch {}
}

function clearAiCfg() {
  try { sessionStorage.removeItem(AI_KEY); } catch {}
}

function detectProviderForUi(key) {
  if (!key) return 'auto';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-')) return 'openai';
  return 'google';
}

function providerLabel(p) {
  return p === 'anthropic' ? 'Claude'
    : p === 'openai' ? 'GPT'
    : p === 'google' ? 'Gemini'
    : 'IA';
}

function updateHealthBadge() {
  if (aiCfg?.apiKey) {
    const p = aiCfg.provider && aiCfg.provider !== 'auto'
      ? aiCfg.provider
      : detectProviderForUi(aiCfg.apiKey);
    healthStatus.className = 'health ok';
    healthStatus.textContent = `IA · ${providerLabel(p)} activa`;
    skipAI.parentElement.classList.remove('disabled');
    skipAI.disabled = false;
  } else {
    healthStatus.className = 'health ok';
    healthStatus.textContent = 'modo estático · 19 idiomas';
    skipAI.checked = true;
    skipAI.disabled = true;
    skipAI.parentElement.classList.add('disabled');
  }
}

function showSettingsWarn(text, kind) {
  if (!text) {
    settingsWarn.hidden = true;
    settingsWarn.textContent = '';
    return;
  }
  settingsWarn.hidden = false;
  settingsWarn.textContent = text;
  settingsWarn.classList.toggle('ok', kind === 'ok');
}

function toggleSettings(force) {
  const willOpen = typeof force === 'boolean' ? force : settingsPanel.classList.contains('hidden');
  if (willOpen) {
    if (aiCfg) {
      aiKey.value = aiCfg.apiKey;
      aiProvider.value = aiCfg.provider ?? 'auto';
    } else {
      aiKey.value = '';
      aiProvider.value = 'auto';
    }
    showSettingsWarn(null);
    settingsPanel.classList.remove('hidden');
    settingsBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => aiKey.focus(), 50);
  } else {
    settingsPanel.classList.add('hidden');
    settingsBtn.setAttribute('aria-expanded', 'false');
  }
}

function handleAiSave() {
  const key = aiKey.value.trim();
  if (!key) {
    showSettingsWarn('Introduce una API key.');
    return;
  }
  if (key.length < 16) {
    showSettingsWarn('La clave parece demasiado corta.');
    return;
  }
  aiCfg = { apiKey: key, provider: aiProvider.value };
  saveAiCfg(aiCfg);
  updateHealthBadge();
  skipAI.checked = false;
  showSettingsWarn(`Clave guardada en sessionStorage. Proveedor: ${providerLabel(
    aiCfg.provider === 'auto' ? detectProviderForUi(key) : aiCfg.provider,
  )}.`, 'ok');
  setTimeout(() => toggleSettings(false), 1200);
}

function handleAiClearCfg() {
  aiCfg = null;
  clearAiCfg();
  aiKey.value = '';
  aiProvider.value = 'auto';
  updateHealthBadge();
  showSettingsWarn('Clave olvidada.', 'ok');
}

function toggleAiKeyVisibility() {
  const show = aiKey.type === 'password';
  aiKey.type = show ? 'text' : 'password';
  aiKeyToggle.textContent = show ? 'ocultar' : 'ver';
}

// ── Atajos de teclado ───────────────────────────────────
function handleShortcut(e) {
  // Cmd/Ctrl + K → toggle historial
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    toggleHistory();
    return;
  }
  // Esc → limpia input o cierra paneles
  if (e.key === 'Escape') {
    if (!settingsPanel.classList.contains('hidden')) {
      toggleSettings(false);
    } else if (!historyPanel.classList.contains('hidden')) {
      toggleHistory(false);
    } else if (document.activeElement === input) {
      input.value = '';
      result.classList.add('hidden');
      const url = new URL(window.location.href);
      url.searchParams.delete('name');
      history.replaceState(null, '', url.toString());
    }
    return;
  }
  // / → enfoca input (sólo si no estás escribiendo en otro input)
  if (e.key === '/' && document.activeElement !== input) {
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      input.focus();
      input.select();
    }
  }
}

// ── Wire-up ─────────────────────────────────────────────
button.addEventListener('click', validate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validate();
});
document.querySelectorAll('.ex').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.textContent.trim();
    validate();
  });
});
historyBtn.addEventListener('click', () => {
  toggleSettings(false);
  toggleHistory();
});
historyClear.addEventListener('click', (e) => {
  e.stopPropagation();
  clearHistory();
});

settingsBtn.addEventListener('click', () => {
  toggleHistory(false);
  toggleSettings();
});
settingsClose.addEventListener('click', () => toggleSettings(false));
aiSave.addEventListener('click', handleAiSave);
aiClear.addEventListener('click', handleAiClearCfg);
aiKeyToggle.addEventListener('click', toggleAiKeyVisibility);
aiKey.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAiSave();
  }
});
shareBtn?.addEventListener('click', shareUrl);
copyJsonBtn?.addEventListener('click', (e) => {
  // Evita que el click colapse/expanda el <details>.
  e.preventDefault();
  e.stopPropagation();
  copyResultJson();
});
document.addEventListener('keydown', handleShortcut);
document.addEventListener('click', (e) => {
  if (!historyPanel.classList.contains('hidden')) {
    if (!historyPanel.contains(e.target) && !historyBtn.contains(e.target)) {
      toggleHistory(false);
    }
  }
  if (!settingsPanel.classList.contains('hidden')) {
    if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
      toggleSettings(false);
    }
  }
});

input.focus();
loadFromUrl();
