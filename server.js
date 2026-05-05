import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateName } from './src/validator.js';
import { aiCheck } from './src/layers/aiCheck.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// CORS_ORIGINS: lista separada por comas. Soporta "*" para permitir todo
// (útil sólo en local). En producción usa la URL exacta de tu Pages, p. ej.:
//   CORS_ORIGINS=https://marcosnovo.github.io
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function corsMiddleware(req, res, next) {
  const origin = req.get('Origin');
  if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
}

app.use(corsMiddleware);
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ai_layer: !!process.env.ANTHROPIC_API_KEY,
    model: 'claude-opus-4-7',
    cors_origins: allowedOrigins,
  });
});

// Validación completa: el server hace TODA la orquestación (formato + listas
// + AI). Útil cuando el cliente delega el trabajo al backend.
app.post('/api/validate', async (req, res) => {
  const { name, skipAI } = req.body ?? {};
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Campo "name" (string) requerido.' });
  }
  try {
    const result = await validateName(name, {
      skipAI: !!skipAI,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    res.json(result);
  } catch (err) {
    console.error('[validate] error:', err);
    res.status(500).json({
      error: 'Error interno validando el nombre.',
      detail: err?.message,
    });
  }
});

// Modo PROXY: sólo la capa AI. El cliente (browser de GitHub Pages, app
// móvil…) ejecuta las capas estáticas localmente y delega únicamente la
// llamada a Claude. La API key vive aquí, NO en el cliente.
app.post('/api/ai-check', async (req, res) => {
  const { input } = req.body ?? {};
  if (typeof input !== 'string') {
    return res.status(400).json({ error: 'Campo "input" (string) requerido.' });
  }
  try {
    const result = await aiCheck(input, {
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    res.json(result);
  } catch (err) {
    console.error('[ai-check] error:', err);
    res.status(500).json({
      error: 'Error interno llamando a Claude.',
      detail: err?.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`▶ HALO Name Validator listening on http://localhost:${PORT}`);
  console.log(`▶ CORS allowed origins: ${allowedOrigins.join(', ')}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY no configurada — capa semántica AI desactivada.');
  }
});
