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

// ──────────────────────────────────────────────────────────────────────────
//  Cobertura ampliada — DE / IT / NL / HU / CS / ZH / JA / KO / HE
//  ──────────────────────────────────────────────────────────────────────
//  Para cada idioma: ≥4 nombres con vulgaridad (REJECTED), ≥3 nombres
//  legítimos reales (ALLOWED), y cuando aplique ≥1 figura histórica
//  problemática (REVIEW).
// ──────────────────────────────────────────────────────────────────────────

test('alemán — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Klaus Scheisse',     'REJECTED'],
    ['Hans Arschloch',     'REJECTED'],
    ['Peter Hurensohn',    'REJECTED'],
    ['Otto Wichser',       'REJECTED'],
    ['Wolfgang Schwanz',   'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('alemán — nombres legítimos pasan', async () => {
  for (const v of ['Hans Müller', 'Anna Schmidt', 'Klaus Weber', 'Thomas Becker']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('italiano — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Giovanni Cazzo',     'REJECTED'],
    ['Marco Minchia',      'REJECTED'],
    ['Luca Stronzo',       'REJECTED'],
    ['Antonio Bocchino',   'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('italiano — nombres legítimos pasan', async () => {
  for (const v of ['Marco Rossi', 'Giulia Bianchi', 'Luca Ferrari', 'Sofia Romano']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('holandés — profanidad detectada (kanker, tyfus, hoer)', async () => {
  for (const [input, expected] of [
    ['Jan Kanker',         'REJECTED'],
    ['Piet Tyfus',         'REJECTED'],
    ['Hans Klootzak',      'REJECTED'],
    ['Lisa Kankerhoer',    'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('holandés — nombres legítimos pasan', async () => {
  for (const v of ['Jan de Vries', 'Sophie Bakker', 'Lars Visser']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('húngaro — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['István Kurva',       'REJECTED'],
    ['Gábor Fasz',         'REJECTED'],
    ['László Baszott',     'REJECTED'],
    ['Tamás Faszfej',      'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('húngaro — nombres legítimos pasan', async () => {
  for (const v of ['István Kovács', 'Mária Nagy', 'Péter Tóth']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('checo — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Jan Pica',           'REJECTED'],
    ['Pavel Kurva',        'REJECTED'],
    ['Tomáš Hovno',        'REJECTED'],
    ['Petr Curak',         'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('checo — nombres legítimos pasan', async () => {
  for (const v of ['Jan Novák', 'Petr Svoboda', 'Pavel Černý']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('chino (pinyin) — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Wang Caonima',       'REJECTED'],
    ['Li Shabi',           'REJECTED'],
    ['Chen Jiba',          'REJECTED'],   // 鸡巴 (pene vulgar)
    ['Zhang Caoniba',      'REJECTED'],   // 操你逼 — vulgar
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('chino (pinyin) — nombres legítimos pasan', async () => {
  for (const v of ['Wang Wei', 'Li Xiaoming', 'Chen Hua', 'Zhang Yong']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('japonés (rōmaji) — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Tanaka Kuso',        'REJECTED'],
    ['Sato Manko',         'REJECTED'],
    ['Suzuki Chinpo',      'REJECTED'],
    ['Watanabe Bakayarou', 'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('japonés — nombres legítimos pasan', async () => {
  for (const v of ['Tanaka Hiroshi', 'Yamada Akiko', 'Suzuki Kenji', 'Sato Yuki']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('coreano (romanized) — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['Kim Shibal',         'REJECTED'],
    ['Park Sibalnom',      'REJECTED'],
    ['Lee Jiral',          'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('coreano — nombres legítimos pasan', async () => {
  for (const v of ['Kim Minjun', 'Park Sooyoung', 'Lee Jiho']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

test('hebreo (transliterado) — profanidad detectada', async () => {
  for (const [input, expected] of [
    ['David Zayin',        'REJECTED'],
    ['Yossi Kus',          'REJECTED'],
    ['Avi Kusemek',        'REJECTED'],
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('hebreo — nombres legítimos pasan', async () => {
  for (const v of ['David Cohen', 'Sarah Levy', 'Daniel Friedman']) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `${v} debería pasar (got ${r.verdict})`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
//  Cobertura Fase 1 — joke-names nuevos (re-segmentación fonética)
//  ──────────────────────────────────────────────────────────────────────
//  Verifica que los nuevos joke names compuestos (nombre + vulgaridad
//  concatenada) se detectan correctamente. 1-2 muestras por idioma.
// ──────────────────────────────────────────────────────────────────────────

test('joke-names Fase 1 — DE/NL/HU/CS', async () => {
  for (const [input, expected] of [
    ['Klaus Pferdsohn',     'REJECTED'],   // DE
    ['Hans Dummkopf',       'REJECTED'],   // DE
    ['Jan Kankerhond',      'REJECTED'],   // NL
    ['Willem Klootzak',     'REJECTED'],   // NL
    ['Lajos Kurvajo',       'REJECTED'],   // HU
    ['Tibor Baszottul',     'REJECTED'],   // HU
    ['Pavel Kokothlavy',    'REJECTED'],   // CS
    ['Jan Kurvasyn',        'REJECTED'],   // CS
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('joke-names Fase 1 — IT/RO/EL', async () => {
  for (const [input, expected] of [
    ['Marco Sucami',         'REJECTED'],  // IT
    ['Luca Pisaminchia',     'REJECTED'],  // IT
    ['Ion Muieta',           'REJECTED'],  // RO
    ['Florin Pulamea',       'REJECTED'],  // RO
    ['Yannis Malakopanas',   'REJECTED'],  // EL
    ['Nikos Paparxidas',     'REJECTED'],  // EL
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('joke-names Fase 1 — PL/RU/TR/AR/HE', async () => {
  for (const [input, expected] of [
    ['Jan Kurwicki',          'REJECTED'],  // PL
    ['Maria Pizdowska',       'REJECTED'],  // PL
    ['Ivan Pizdatov',         'REJECTED'],  // RU
    ['Olga Suchkina',         'REJECTED'],  // RU
    ['Mehmet Sikerim',        'REJECTED'],  // TR
    ['Ali Yarrakov',          'REJECTED'],  // TR
    ['Khalid Ibnelhmir',      'REJECTED'],  // AR
    ['Walid Ibnelqahba',      'REJECTED'],  // AR
    ['Yossi Benkalba',        'REJECTED'],  // HE
    ['David Zayinov',         'REJECTED'],  // HE
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('joke-names Fase 1 — ZH/JA/KO', async () => {
  for (const [input, expected] of [
    ['Wang Caonima',         'REJECTED'],  // ZH
    ['Liu Shabide',          'REJECTED'],  // ZH
    ['Tanaka Manko',         'REJECTED'],  // JA
    ['Yamada Chinpo',        'REJECTED'],  // JA
    ['Kim Ssibal',           'REJECTED'],  // KO
    ['Park Jiral',           'REJECTED'],  // KO
  ]) {
    const r = await validateName(input, OPTS);
    assert.equal(r.verdict, expected, `${input} → ${r.verdict}`);
  }
});

test('joke-names Fase 1 — no rompe nombres legítimos cercanos', async () => {
  // Después de añadir ~280 joke names, verificamos que no creamos falsos
  // positivos con nombres reales cuyos componentes están en blocklists.
  const legitimate = [
    'Klaus Müller',         // DE — Klaus es legítimo, Müller también
    'Hans Schmidt',         // DE
    'Jan de Vries',         // NL
    'Pavel Novák',          // CS
    'Marco Rossi',          // IT
    'Ion Popescu',          // RO
    'Yannis Antoniou',      // EL
    'Anna Kowalski',        // PL
    'Olga Smirnova',        // RU
    'Mehmet Yilmaz',        // TR
    'Ahmed Hassan',         // AR
    'David Cohen',          // HE
    'Wang Wei',             // ZH
    'Tanaka Hiroshi',       // JA
    'Kim Min-jun',          // KO
  ];
  for (const v of legitimate) {
    const r = await validateName(v, OPTS);
    assert.equal(r.verdict, 'ALLOWED', `FP en "${v}" (got ${r.verdict})`);
  }
});
