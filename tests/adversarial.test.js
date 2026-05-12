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

// ──────────────────────────────────────────────────────────────────────────
//  Fase 2 PR-A — Hardening de evasión
//  Gap-1 zero-width / Gap-2 latín extendido / Gap-3 rn↔m vv↔w / Gap-5 leet
// ──────────────────────────────────────────────────────────────────────────

test('Gap-1 — zero-width chars (U+200B/U+200C/U+200D) no evaden detector de jugador', async () => {
  // El atacante inserta caracteres invisibles entre las letras de un
  // jugador propio para evadir el detector context-aware. Sin defensa,
  // "Vi​nicius mono" pasa porque el token "vi​nicius" no matchea
  // playerNameTokens.has("vinicius").
  for (const input of [
    'Vi​nicius mono',     // ZWSP entre i y n
    'Vini‌cius macaco',   // ZWNJ entre i y c
    'Bellingha‍m macaco', // ZWJ entre a y m
    'Vini﻿cius singe',    // BOM entre i y c (francés "mono")
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, 'REJECTED', `${JSON.stringify(input)} debería caer (got ${r.verdict})`);
  }
});

test('Gap-2 — Latín extendido B / IPA (ı, đ, ø, ł, æ, þ) no evade detección', async () => {
  // NFKC y NFD no descomponen estos caracteres. Sin extender CONFUSABLE_MAP
  // el atacante escribe "Vınıcıus" (ı turca) y se cuela. También cubre
  // ł (polaco), đ (croata), ø (escandinavo), æ/œ (anglo/francés).
  for (const input of [
    'vınıcıus mono',           // ı turca (U+0131)
    'Bellıngham macaco',       // ı turca
    'Vınıcıus macaco',         // ı turca
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, 'REJECTED', `${input} debería caer (got ${r.verdict})`);
  }
});

test('Gap-3 — Homoglifos tipográficos rn↔m (LED Bernabéu) — Bellingharn → Bellingham', async () => {
  // Pantallas LED renderizan "rn" y "m" idénticos. "Bellingharn" pasa el
  // detector de jugador si no hay visualNormalize en tokens.
  for (const input of [
    'Bellingharn mono',        // rn→m → Bellingham
    'Bellingharn macaco',      // rn→m + slur racista
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, 'REJECTED', `${input} debería caer (got ${r.verdict})`);
  }
  // Control: rn legítimo en nombres reales NO debe caer
  const r = await validateName('Bernardo Silva', OPTS);
  assert.notEqual(r.verdict, 'REJECTED', 'Bernardo NO debería caer por rn→m');
});

test('Gap-5 — Multi-char leet (|>, \\/, |-|, ()) se decodifica', async () => {
  // ASCII-art leet clásica del 4chan/foros. El char-a-char no la pilla.
  for (const input of [
    'P|>UTA Garcia',           // |> → p → puta
    'P|>uta Lopez',            // mixed case con |> al inicio
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, 'REJECTED', `${input} debería caer (got ${r.verdict})`);
  }
});

test('PR-A no introduce regresiones en nombres legítimos con chars especiales', async () => {
  // Verifica que la ampliación del CONFUSABLE_MAP con latín extendido NO
  // rompe nombres legítimos europeos que usan estos caracteres.
  const legitimate = [
    'Søren Hansen',            // ø danés
    'Bjørn Pedersen',          // ø noruego
    'Łukasz Kowalski',         // ł polaco
    'Đorđe Petrović',          // đ serbio
    'Þór Þórsson',             // þ islandés
    'Æsa Æsa',                 // æ feroés
    'François Hollande',       // ç francés (control)
    'María García',            // base hispana (control)
    'Vinicius Junior',         // jugador legítimo
    'Bellingham Jude',         // jugador legítimo sin homoglifo
  ];
  const fails = [];
  for (const v of legitimate) {
    const r = await validateName(v, OPTS);
    if (r.verdict === 'REJECTED') fails.push(`${v} → ${r.verdict}`);
  }
  assert.equal(
    fails.length, 0,
    `Falsos positivos por latin-extended: ${fails.join(', ')}`,
  );
});
