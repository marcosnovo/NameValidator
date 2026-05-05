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

async function checkHealth() {
  try {
    const r = await fetch('/api/health');
    const j = await r.json();
    if (!j.ok) throw new Error('not ok');
    if (j.ai_layer) {
      healthStatus.className = 'health ok';
      healthStatus.textContent = `AI: ${j.model}`;
    } else {
      healthStatus.className = 'health warn';
      healthStatus.textContent = 'AI: deshabilitada (falta API key)';
    }
  } catch {
    healthStatus.className = 'health bad';
    healthStatus.textContent = 'servidor no responde';
  }
}

async function validate() {
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = 'Validando…';

  try {
    const r = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skipAI: skipAI.checked }),
    });
    const data = await r.json();
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

  // Verdict pill
  verdictPill.className = `verdict ${data.verdict}`;
  verdictPill.textContent =
    data.verdict === 'ALLOWED' ? 'PERMITIDO' :
    data.verdict === 'REVIEW' ? 'REVISAR' :
    data.verdict === 'REJECTED' ? 'RECHAZADO' :
    data.verdict ?? '—';

  // Doubt + elapsed
  const doubt = Math.max(0, Math.min(100, data.doubt_percent ?? 0));
  doubtPill.textContent = `duda ${doubt}%`;
  elapsedPill.textContent = `${data.elapsed_ms ?? 0} ms`;
  meterFill.style.width = `${doubt}%`;

  // Reasons
  reasonsList.innerHTML = '';
  for (const reason of data.reasons ?? []) {
    const li = document.createElement('li');
    li.className = reason.severity ?? 'low';
    li.innerHTML = `
      <span class="src">${reason.source}</span>
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

  // Meta
  metaInput.textContent = data.input ?? '—';
  metaConcat.textContent = data.normalized?.concatNoSpaces ?? '—';
  metaDeleeted.textContent = data.normalized?.deLeeted ?? '—';
  const ls = data.layer_summary ?? {};
  metaLayers.textContent =
    `format=${ls.format_issues ?? 0} · ` +
    `static=${ls.static_issues ?? 0} · ` +
    `ai=${ls.ai_run ? '✓' : ls.ai_skipped_due_to_static_block ? '⏭ (saltado por hit estático)' : '✗'}`;

  rawJson.textContent = JSON.stringify(data, null, 2);
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

// Wire up
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

checkHealth();
input.focus();
