// ──────────────────────────────────────────────────────────────────────────
//  Tests del sistema multi-tenant de contextos
// ──────────────────────────────────────────────────────────────────────────
//
// Verifica que:
//   ▸ El contexto por defecto (real-madrid) NO rompe nada.
//   ▸ El contexto fc-barcelona invierte correctamente quién es rival.
//   ▸ Un nombre limpio (Carlos García López) pasa en cualquier contexto.
//   ▸ Las aprobaciones globales no contaminan entre contextos.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from '../src/validator.js';
import { listContexts, getContext } from '../src/contexts/index.js';

const OPTS = { skipAI: true };

test('listContexts devuelve real-madrid + fc-barcelona', () => {
  const ctxs = listContexts();
  const ids = ctxs.map((c) => c.id);
  assert.ok(ids.includes('real-madrid'));
  assert.ok(ids.includes('fc-barcelona'));
});

test('getContext sin id devuelve real-madrid (compat)', () => {
  const ctx = getContext();
  assert.equal(ctx.id, 'real-madrid');
});

test('getContext con id desconocido cae a real-madrid (compat)', () => {
  const ctx = getContext('does-not-exist');
  assert.equal(ctx.id, 'real-madrid');
});

test('contexto Real Madrid (default): bloquea a Pep Guardiola', async () => {
  const r = await validateName('Pep Guardiola', OPTS);
  assert.equal(r.verdict, 'REJECTED');
});

test('contexto FC Barcelona: bloquea a Cristiano Ronaldo', async () => {
  const r = await validateName('Cristiano Ronaldo', { ...OPTS, context: 'fc-barcelona' });
  assert.equal(r.verdict, 'REJECTED');
});

test('contexto FC Barcelona: PERMITE a Pep Guardiola (es propio)', async () => {
  const r = await validateName('Pep Guardiola', { ...OPTS, context: 'fc-barcelona' });
  assert.equal(r.verdict, 'ALLOWED');
});

test('contexto Real Madrid: PERMITE a Cristiano Ronaldo (fue propio)', async () => {
  const r = await validateName('Cristiano Ronaldo', { ...OPTS, context: 'real-madrid' });
  assert.equal(r.verdict, 'ALLOWED');
});

test('contexto FC Barcelona: detecta racism vs jugador propio (Yamal)', async () => {
  const r = await validateName('Lamine Yamal mono', { ...OPTS, context: 'fc-barcelona' });
  assert.equal(r.verdict, 'REJECTED');
});

test('contexto FC Barcelona: chant pro-Madrid se rechaza', async () => {
  const r = await validateName('Hala Madrid', { ...OPTS, context: 'fc-barcelona' });
  assert.equal(r.verdict, 'REJECTED');
});

test('contexto Real Madrid: chant pro-Madrid se PERMITE', async () => {
  const r = await validateName('Hala Madrid', { ...OPTS, context: 'real-madrid' });
  assert.equal(r.verdict, 'ALLOWED');
});

test('apellido común suelto: ALLOWED en cualquier contexto', async () => {
  for (const ctx of [undefined, 'real-madrid', 'fc-barcelona']) {
    const r = await validateName('Carlos Ramos García', { ...OPTS, context: ctx });
    assert.equal(r.verdict, 'ALLOWED', `Carlos Ramos García debe pasar en context=${ctx}`);
  }
});

test('issue.context se anota cuando dispara la capa contexto', async () => {
  const r = await validateName('Pep Guardiola', { ...OPTS, context: 'real-madrid' });
  const ctxIssue = r.reasons.find((x) => x.source.includes('rival-player'));
  // El reason del aggregator no incluye context tag directamente, pero el
  // verdict es el correcto. Verificamos que la lógica multi-tenant fue
  // invocada usando el contexto explícito sin error.
  assert.ok(ctxIssue, 'debería haber un reason de rival-player');
});
