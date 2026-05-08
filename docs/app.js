// HALO Name Validator — frontend GitHub Pages (standalone).
//
// Pages no expone /api/ → toda la validación corre en el navegador
// usando lib/validator.js. La capa estática cubre 19 idiomas a ≥80%.

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

healthStatus.className = 'health ok';
healthStatus.textContent = 'modo estático · 19 idiomas';

async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  button.disabled = true;
  const oldLabel = button.querySelector('.btn-label')?.textContent;
  if (button.querySelector('.btn-label')) {
    button.querySelector('.btn-label').textContent = 'Validando…';
  }

  const t0 = performance.now();
  try {
    const verdict = await validateName(name, { skipAI: true });
    const elapsed_ms = Math.round(performance.now() - t0);
    render({ ...verdict, elapsed_ms, input: name });
  } catch (err) {
    renderError(err);
  } finally {
    button.disabled = false;
    if (button.querySelector('.btn-label')) {
      button.querySelector('.btn-label').textContent = oldLabel ?? 'Validar';
    }
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

input.focus();
