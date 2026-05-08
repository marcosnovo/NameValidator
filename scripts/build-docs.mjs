#!/usr/bin/env node
// Sincroniza src/ ⇒ docs/lib/ para que GitHub Pages sirva un bundle estático
// y self-contained. Sin transpilación: los ficheros son ESM puros y los
// browsers modernos los cargan vía <script type="module">.
//
// Además: cache-busting de los 3 assets frontend (app.js, styles.css,
// e index.html via referencias internas). Calculamos un hash MD5 de 8
// chars sobre el contenido de app.js + styles.css y lo inyectamos como
// `?v=<hash>` en docs/index.html y public/index.html. Cualquier cambio
// real en app.js o styles.css fuerza al navegador a re-fetchear.

import { mkdir, copyFile, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const DST_DOCS = join(ROOT, 'docs', 'lib');
const DST_PUBLIC = join(ROOT, 'public', 'lib');

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

for (const dst of [DST_DOCS, DST_PUBLIC]) {
  await rm(dst, { recursive: true, force: true });
  await copyDir(SRC, dst);
}
console.log(`✓ docs/lib/ y public/lib/ regenerados desde src/`);

// ── Cache-busting ────────────────────────────────────────────────────────
async function md5Short(path) {
  const buf = await readFile(path);
  return createHash('md5').update(buf).digest('hex').slice(0, 8);
}

async function injectCacheBust(htmlPath, assetsDir) {
  const appHash = await md5Short(join(assetsDir, 'app.js'));
  const cssHash = await md5Short(join(assetsDir, 'styles.css'));
  let html = await readFile(htmlPath, 'utf8');
  html = html
    .replace(
      /href="\.\/styles\.css(?:\?v=[^"]*)?"/g,
      `href="./styles.css?v=${cssHash}"`,
    )
    .replace(
      /src="\.\/app\.js(?:\?v=[^"]*)?"/g,
      `src="./app.js?v=${appHash}"`,
    );
  await writeFile(htmlPath, html);
  return { appHash, cssHash };
}

const docsHtml = join(ROOT, 'docs', 'index.html');
const publicHtml = join(ROOT, 'public', 'index.html');
const docsHashes = await injectCacheBust(docsHtml, join(ROOT, 'docs'));
console.log(
  `✓ docs/index.html cache-bust: app.js?v=${docsHashes.appHash}` +
    ` · styles.css?v=${docsHashes.cssHash}`,
);
const publicHashes = await injectCacheBust(publicHtml, join(ROOT, 'public'));
console.log(
  `✓ public/index.html cache-bust: app.js?v=${publicHashes.appHash}` +
    ` · styles.css?v=${publicHashes.cssHash}`,
);
