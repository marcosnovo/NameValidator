#!/usr/bin/env node
// Sincroniza src/ ⇒ docs/lib/ para que GitHub Pages sirva un bundle estático
// y self-contained. Sin transpilación: los ficheros son ESM puros y los
// browsers modernos los cargan vía <script type="module">.

import { mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const DST = join(ROOT, 'docs', 'lib');

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  for (const e of entries) {
    const f = join(from, e.name);
    const t = join(to, e.name);
    if (e.isDirectory()) {
      await copyDir(f, t);
    } else if (e.isFile() && e.name.endsWith('.js')) {
      await copyFile(f, t);
    }
  }
}

await rm(DST, { recursive: true, force: true });
await copyDir(SRC, DST);
console.log(`✓ docs/lib/ regenerado desde src/`);
