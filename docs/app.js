// HALO Name Validator — frontend para GitHub Pages.
// Importa el validador desde docs/lib/ (copia de src/ vía build:docs).

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
const apiKeyInput = $('#api-key-input');
const saveApiKey = $('#save-api-key');
const clearApiKey = $('#clear-api-key');
const keyStatus = $('#key-status');

// ── API key storage (sessionStorage = se borra al cerrar la pestaña) ────
const KEY_STORE = 'halo-anthropic-key';

function getStoredKey() {
  try { return sessionStorage.getItem(KEY_STORE) || ''; }
  catch { return ''; }
}
function setStoredKey(value) {
  try { sessionStorage.setItem(KEY_STORE, value); } catch {}
}
function clearStoredKey() {
  try { sessionStorage.removeItem(KEY_STORE); } catch {}
}

function refreshKeyStatus() {
  const k = getStoredKey();
  if (k) {
    keyStatus.textContent =
      `✓ Clave cargada (sk-ant-…${k.slice(-6)}). La capa AI está activa para esta sesión.`;
    keyStatus.style.color = 'var(--ok)';
  } else {
    keyStatus.textContent = 'Sin clave — la capa AI está deshabilitada.';
    keyStatus.style.color = 'var(--fg-dim)';
  }
}

// ── Validación ──────────────────────────────────────────────────────────
async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = 'Validando…';

  try {
    const apiKey = getStoredKey() || null;
    const data = await validateName(name, {
      skipAI: skipAI.checked,
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
    `ai=${ls.ai_run ? '✓' : ls.ai_skipped_due_to_static_block ? '⏭ (saltado por hit estático)' : '✗'}`;

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

// ── Wiring ──────────────────────────────────────────────────────────────
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

toggleSettings.addEventListener('click', () => {
  settingsPanel.classList.toggle('hidden');
  if (!settingsPanel.classList.contains('hidden')) {
    apiKeyInput.value = getStoredKey();
    apiKeyInput.focus();
  }
});

saveApiKey.addEventListener('click', () => {
  const v = apiKeyInput.value.trim();
  if (!v) return;
  if (!v.startsWith('sk-ant-')) {
    if (!confirm('La clave no empieza por "sk-ant-". ¿Guardar igualmente?')) return;
  }
  setStoredKey(v);
  apiKeyInput.value = '';
  refreshKeyStatus();
});

clearApiKey.addEventListener('click', () => {
  clearStoredKey();
  apiKeyInput.value = '';
  refreshKeyStatus();
});

refreshKeyStatus();
input.focus();
