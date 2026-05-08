// HALO Name Validator — frontend GitHub Pages (standalone).
//
// Features:
//   ▸ Validación cliente (lib/validator.js, sin backend)
//   ▸ Share por URL: ?name=… autocompleta y valida al cargar
//   ▸ Historial localStorage: últimas 10 validaciones
//   ▸ Copiar JSON al portapapeles
//   ▸ Atajos: / enfoca · Esc limpia · Cmd/Ctrl+K abre historial

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

const HISTORY_KEY = 'halo.history.v1';
const HISTORY_MAX = 10;

healthStatus.className = 'health ok';
healthStatus.textContent = 'modo estático · 19 idiomas';

let lastResult = null;

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
    const verdict = await validateName(name, { skipAI: true });
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
  metaLayers.textContent =
    `format=${ls.format_issues ?? 0} · static=${ls.static_issues ?? 0} · ai=${ls.ai_run ? '✓' : '—'}`;

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

// ── Atajos de teclado ───────────────────────────────────
function handleShortcut(e) {
  // Cmd/Ctrl + K → toggle historial
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    toggleHistory();
    return;
  }
  // Esc → limpia input o cierra historial
  if (e.key === 'Escape') {
    if (!historyPanel.classList.contains('hidden')) {
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
historyBtn.addEventListener('click', () => toggleHistory());
historyClear.addEventListener('click', (e) => {
  e.stopPropagation();
  clearHistory();
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
  if (historyPanel.classList.contains('hidden')) return;
  if (historyPanel.contains(e.target)) return;
  if (historyBtn.contains(e.target)) return;
  toggleHistory(false);
});

input.focus();
loadFromUrl();
