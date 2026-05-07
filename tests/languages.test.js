// ──────────────────────────────────────────────────────────────────────────
//  Tests de cobertura idiomática extendida (RU, PL, AR)
// ──────────────────────────────────────────────────────────────────────────

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from '../src/validator.js';

const OPTS = { skipAI: true };

test('ruso — profanidad detectada', async () => {
  const cases = [
    ['Ivan Suka',           'REJECTED'],
    ['Vladimir Pizdets',    'REJECTED'],
    ['Putin Huilo',         'REJECTED'],     // chant ucraniano vs Putin
    ['Krymnash García',     'REJECTED'],     // apología invasión Crimea
    ['Sergei Mudak',        'REJECTED'],
  ];
  for (const [input, expected] of cases) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('ruso — nombres legítimos pasan', async () => {
  const clean = ['Anna Sergeeva', 'Vladimir Petrov', 'Dmitri Ivanov', 'Olga Smirnova'];
  for (const v of clean) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('polaco — profanidad detectada', async () => {
  const cases = [
    ['Jan Kurwa',           'REJECTED'],
    ['Marek Skurwysyn',     'REJECTED'],
    ['Jebanyrot López',     'REJECTED'],
    ['Pojebany García',     'REJECTED'],
  ];
  for (const [input, expected] of cases) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('polaco — nombres legítimos pasan', async () => {
  const clean = ['Anna Kowalski', 'Tomasz Nowak', 'Piotr Kaczmarek'];
  for (const v of clean) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('árabe transliterado — profanidad detectada', async () => {
  const cases = [
    ['Ahmed Sharmoot',      'REJECTED'],
    ['Khalid Kosomak',      'REJECTED'],
    ['Ibn Elkalb',          'REJECTED'],
    ['Daesh Fanboy',        'REJECTED'],
  ];
  for (const [input, expected] of cases) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('árabe — nombres legítimos pasan (NO bloqueamos religious mainstream)', async () => {
  const clean = [
    'Mohammed Hassan', 'Fatima Al-Sayed', 'Ali Khalid',
    'Mohammed Ali',    // nombre de boxeador / nombre genérico súper común
    'Abdul Rahman',
  ];
  for (const v of clean) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('Arabizi — el "3" se trata como "a" (transliteración fonética)', async () => {
  // "All3yl3nak" debería detectarse como variante de "Allayl3anak"
  // (maldición religiosa árabe).
  const r = await validateName('Carlos All3yl3nak', OPTS);
  assert.notEqual(r.verdict, 'ALLOWED', 'Arabizi numérico debería caer fonético');
});

test('griego — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Yanis Malakas',   'REJECTED'],
    ['Spyros Vlakas',   'REJECTED'],
    ['Kostas Gamoto',   'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('griego — nombres legítimos pasan (Christos NO es blasfemia)', async () => {
  for (const v of ['Christos Georgiou', 'Maria Papadopoulou', 'Yannis Antoniou']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('griego — Junta militar y Aurora Dorada → REVIEW', async () => {
  for (const [input, expected] of [
    ['Yannis Papadopoulos',   'REVIEW'],
    ['Ioannis Metaxas',       'REVIEW'],
    ['Nikolaos Michaloliakos','REVIEW'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('turco — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Ahmet Orospucocugu', 'REJECTED'],
    ['Mehmet Siktir',      'REJECTED'],
    ['Hasan Amk',          'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('turco — nombres legítimos pasan (Mustafa Kemal NO se bloquea)', async () => {
  for (const v of ['Mehmet Yilmaz', 'Ayse Demir', 'Mustafa Kemal']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('turco — genocidio armenio + golpistas → REVIEW', async () => {
  for (const [input, expected] of [
    ['Talat Pasha', 'REVIEW'],
    ['Enver Pasha', 'REVIEW'],
    ['Kenan Evren', 'REVIEW'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('rumano — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Andrei Sugipula', 'REJECTED'],
    ['Ion Futuimata',   'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('rumano — nombres legítimos pasan', async () => {
  for (const v of ['Ion Popescu', 'Maria Ionescu', 'Andrei Vasilescu']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('rumano — Iron Guard fascista → REVIEW', async () => {
  const r = await validateName('Corneliu Codreanu', OPTS);
  assert.equal(r.verdict, 'REVIEW');
});

test('religiosos polémicos: Khomeini → REVIEW (Atatürk pasa)', async () => {
  let r = await validateName('Ayatollah Khomeini', OPTS);
  assert.equal(r.verdict, 'REVIEW');
  r = await validateName('Mustafa Kemal Atatürk', OPTS);
  assert.equal(r.verdict, 'ALLOWED', 'Atatürk no es polémico');
});
