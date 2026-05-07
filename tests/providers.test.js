/// Tests del routing multi-provider (Anthropic / OpenAI / Google).
///
/// No hacen llamadas reales — sólo verifican la auto-detección por
/// prefijo de la API key.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectProvider } from '../src/layers/aiCheck.js';

test('detectProvider — Anthropic por prefijo sk-ant-', () => {
  assert.equal(detectProvider('sk-ant-api03-abcdef123456'), 'anthropic');
  assert.equal(detectProvider('sk-ant-foo'), 'anthropic');
});

test('detectProvider — OpenAI por prefijo sk- (no sk-ant-)', () => {
  assert.equal(detectProvider('sk-proj-abcdef123456'), 'openai');
  assert.equal(detectProvider('sk-abc123'), 'openai');
});

test('detectProvider — Google por defecto (resto)', () => {
  assert.equal(detectProvider('AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567'), 'google');
  assert.equal(detectProvider('random-google-key'), 'google');
});

test('detectProvider — override explícito tiene prioridad', () => {
  assert.equal(detectProvider('sk-ant-foo', 'openai'), 'openai');
  assert.equal(detectProvider('sk-foo', 'google'), 'google');
  assert.equal(detectProvider('AIza-foo', 'anthropic'), 'anthropic');
});

test('detectProvider — key vacía/null cae a anthropic (compat)', () => {
  assert.equal(detectProvider(''), 'anthropic');
  assert.equal(detectProvider(null), 'anthropic');
  assert.equal(detectProvider(undefined), 'anthropic');
});
