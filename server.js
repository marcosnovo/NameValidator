import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateName } from './src/validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ai_layer: !!process.env.ANTHROPIC_API_KEY,
    model: 'claude-opus-4-7',
  });
});

app.post('/api/validate', async (req, res) => {
  const { name, skipAI } = req.body ?? {};
  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Campo "name" (string) requerido.' });
  }
  try {
    const result = await validateName(name, { skipAI: !!skipAI });
    res.json(result);
  } catch (err) {
    console.error('[validate] error:', err);
    res.status(500).json({
      error: 'Error interno validando el nombre.',
      detail: err?.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`▶ HALO Name Validator listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY no configurada — capa semántica AI desactivada.');
  }
});
