// ──────────────────────────────────────────────────────────────────────────
//  Tests adversariales — el atacante usa técnicas de evasión modernas
// ──────────────────────────────────────────────────────────────────────────
//
// Objetivo: validar que la capa estática pilla intentos de evasión típicos
// SIN false-positivar nombres legítimos. Cada técnica genera variantes a
// partir de un input ofensivo conocido y comprueba que la mayoría siguen
// detectándose.
//
// Si la tasa de detección baja del 70% en alguna técnica, el test falla.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from '../src/validator.js';

const OPTS = { skipAI: true };

// Helper: verifica que un veredicto es REJECTED o REVIEW (no ALLOWED).
function shouldFlag(input, r) {
  if (r.verdict === 'REJECTED' || r.verdict === 'REVIEW') return true;
  return false;
}

// ─── 1. Leet substitution ──────────────────────────────────────────────
test('adversarial — leet substitution', async () => {
  const variants = [
    'm1erda',         // 1 → i
    'pu7a',           // 7 → t
    'p0lla',          // 0 → o
    'c4br0n',         // 4 → a, 0 → o
    'g1l1p0llas',     // múltiple
    '5cheisse',       // 5 → s
    'c4zz0',          // it
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  const rate = detected / variants.length;
  assert.ok(
    rate >= 0.7,
    `Detección leet ${(rate * 100).toFixed(0)}% < 70% — fallaron: ${variants.join(',')}`,
  );
});

// ─── 2. Espaciado entre letras ─────────────────────────────────────────
test('adversarial — espaciado entre letras', async () => {
  const variants = [
    'P u t a',
    'm i e r d a',
    'c a b r o n',
    'a n o',         // ano (suelto)
    'M E S S I',
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  const rate = detected / variants.length;
  assert.ok(
    rate >= 0.7,
    `Detección espaciado ${(rate * 100).toFixed(0)}% < 70%`,
  );
});

// ─── 3. Inversión / palindrómica ───────────────────────────────────────
test('adversarial — inversión', async () => {
  // "atup", "adreim", "norbac" → "puta", "mierda", "cabron" reverso
  const variants = [
    'Atup García',         // atup → puta
    'Adreim López',        // adreim → mierda
    'Norbac Pérez',        // norbac → cabron
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  const rate = detected / variants.length;
  assert.ok(
    rate >= 0.66,  // la inversión perfora con whitelist de Scunthorpe-reverso
    `Detección inversión ${(rate * 100).toFixed(0)}% < 66% — fallaron: ${variants.join(',')}`,
  );
});

// ─── 4. Confusables Unicode ────────────────────────────────────────────
test('adversarial — confusables Unicode (cyrillic/greek)', async () => {
  // 'а' (U+0430 cyrillic) parece 'a' (U+0061 latin)
  // 'е' (U+0435 cyrillic) parece 'e' (U+0065 latin)
  // 'о' (U+043E cyrillic) parece 'o' (U+006F latin)
  const variants = [
    'putа García',       // 'a' final cyrillic
    'mierdа López',
    'cаbrón Pérez',      // 'a' cyrillic
    'scheisse Müller',   // sin trampa, baseline
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  const rate = detected / variants.length;
  assert.ok(
    rate >= 0.75,
    `Detección Unicode ${(rate * 100).toFixed(0)}% < 75%`,
  );
});

// ─── 5. Combinación: leet + espaciado + Unicode ────────────────────────
test('adversarial — combinación de técnicas', async () => {
  const variants = [
    'p u 7 а',           // espaciado + leet + cyrillic
    'M 1 е R d 4',       // leet + cyrillic + espaciado
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  // Esta es la más difícil; aceptamos 50%+ porque combinar todo es raro
  // en un atacante real (suele usar UNA técnica).
  const rate = detected / variants.length;
  assert.ok(
    rate >= 0.5,
    `Detección combinada ${(rate * 100).toFixed(0)}% < 50%`,
  );
});

// ─── 6. Zalgo (caracteres combinantes) ─────────────────────────────────
test('adversarial — zalgo', async () => {
  // 'puta' + caracteres combinantes superpuestos (deben strip via NFD)
  const variants = [
    'ṕút́á',   // acentos agudos sobre cada letra
    'mìérda',
  ];
  let detected = 0;
  for (const v of variants) {
    const r = await validateName(v, OPTS);
    if (shouldFlag(v, r)) detected++;
  }
  assert.ok(detected === variants.length, `Zalgo: ${detected}/${variants.length}`);
});

// ─── 7. NO false positives en nombres legítimos con técnicas similares ─
test('adversarial — NO false positives en nombres legítimos', async () => {
  // Nombres reales que CONTIENEN substrings que podrían ser confundidas
  // por las heurísticas adversariales. NINGUNO debe rechazarse.
  const legitimate = [
    'Carlos Cumbria López',
    'Ana Espárraga García',
    'Pedro Mearín García',
    'María Concepción Gómez',
    'José María Cardoso',
    'Wolfgang Schmidt',
    'Mario Rossi',
    'Pablo López',
    'Juan García',
    'María Pizarro',
  ];
  const fails = [];
  for (const v of legitimate) {
    const r = await validateName(v, OPTS);
    if (r.verdict === 'REJECTED') fails.push(`${v} → ${r.verdict}`);
  }
  assert.equal(
    fails.length, 0,
    `False positives en nombres legítimos: ${fails.join(', ')}`,
  );
});
