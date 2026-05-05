#!/usr/bin/env node
// Fusiona listas externas (chucknorris, Alexmnzlms/Insultos, safetext) con
// las nuestras. Genera src/blocklists/external/<idioma>.js con las
// entradas únicas que aún no tenemos.
//
// Reglas:
//   ▸ Normalización: lowercase + NFD (sin acentos) + sólo letras + trim
//   ▸ Dedup contra spanish.js, english.js, french.js, portuguese.js
//   ▸ Filtro de longitud < 4 (ambiguas como subcadena)
//   ▸ Filtro de entradas con espacios (van a la lista de frases)
//   ▸ Comentario en cada fichero indicando origen y licencia

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXTERNAL_DIR = '/tmp/external';
const OUT_DIR = join(ROOT, 'src/blocklists/external');

function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Lista de "no incluir" — entradas que generan falsos positivos. Estas
// aparecen en safetext / chucknorris pero como substring rompen apellidos
// o palabras civiles muy comunes. Se mantienen en la lista de exact-only
// si las queremos detectar como token aislado.
const TOXIC_SHORT_PATTERNS = new Set([
  // Inglés
  'asses',     // → assess, lasses, glasses, masses
  'asse',      // → similares
  'tits',      // → titanic, titles
  'cock',      // → cockpit, cockburn (mantener como exact si interesa)
  'fag',       // → fagus, faggot ya catched
  'cum',       // ya en exactOnly
  'fart',
  'gay',       // apellido legítimo INE — confirmado
  // Francés (safetext es muy agresivo)
  'lope',      // → López, antílope, esperanza-lope
  'coch',      // → Hitchcock, peluche
  'culo',      // → cultura, culebra…  (ya en spanish exactOnly)
  'cul',       // → cultura, cult, particular
  'pute',      // OK pero corta — necesita whitelist (Putagán?)
  'sale',      // → salgar, salem, sale (venta)
  'tape',      // → tapete, tapeta, tapera
  'bute',      // → butaca, butifarra
  'bait',      // → bautismo
  'cane',      // → canela, canesú
  'nick',      // → Nicolás, Nicaragua
  'race',      // → demasiado polisémico
  'bath',
  'foot',
  'porn',      // → poco civil pero "Porno" como apellido podría existir
  'oral',      // → demasiado polisémico
  'anal',      // → demasiado polisémico (analista, análisis)
  // Apellidos comunes en castellano que safetext bloquea
  'reto',      // → retorno, retoño…
  'rosa',      // nombre legítimo
  // Cualquier entrada de 3 letras
]);
const MIN_LENGTH = 5;
const MIN_LENGTH_INSULTOS = 4;

async function loadFile(path) {
  try {
    const text = await readFile(path, 'utf-8');
    return text;
  } catch (e) {
    console.error(`Skipping ${path}: ${e.message}`);
    return '';
  }
}

function lines(text) {
  return text.split(/\r?\n/);
}

// Chucknorris: una palabra por línea, comments empiezan con #
function parseChucknorris(text) {
  return lines(text)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(normalize)
    .filter(Boolean);
}

// Safetext: igual que chucknorris
const parseSafetext = parseChucknorris;

// Alexmnzlms/Insultos: markdown, una palabra por línea (con primera letra
// mayúscula). Se descartan headers (#), índices (- [X]), separadores.
function parseInsultos(text) {
  return lines(text)
    .map(l => l.trim())
    .filter(l => /^[A-ZÑÁÉÍÓÚa-z]/.test(l))   // empieza por letra
    .filter(l => !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('|'))
    .filter(l => l.length > 1 && l.length < 40)
    .map(normalize)
    .filter(Boolean);
}

// Carga las listas existentes (formato: const X = [...])
async function loadExistingLanguage(lang) {
  const path = join(ROOT, 'src/blocklists', `${lang}.js`);
  const text = await readFile(path, 'utf-8');
  // Busca todas las strings literales (cobertura ~suficiente para dedup)
  const strings = new Set();
  const re = /['"`]([^'"`\n]+)['"`]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    strings.add(normalize(m[1]));
  }
  return strings;
}

const lang2name = { es: 'spanish', en: 'english', fr: 'french', pt: 'portuguese' };

async function buildLang(lang) {
  const existing = await loadExistingLanguage(lang2name[lang]);

  const sources = {};
  const ck = parseChucknorris(await loadFile(`${EXTERNAL_DIR}/chucknorris-${lang}.txt`));
  const st = parseSafetext(await loadFile(`${EXTERNAL_DIR}/safetext-${lang}.txt`));
  sources.chucknorris = ck;
  sources.safetext = st;

  if (lang === 'es') {
    sources.insultos = parseInsultos(await loadFile(`${EXTERNAL_DIR}/insultos.md`));
  }

  const all = new Map(); // word → array of sources
  for (const [src, words] of Object.entries(sources)) {
    const minLen = src === 'insultos' ? MIN_LENGTH_INSULTOS : MIN_LENGTH;
    for (const w of words) {
      if (!w || w.length < minLen) continue;
      if (w.includes(' ')) continue;
      if (existing.has(w)) continue;
      if (TOXIC_SHORT_PATTERNS.has(w)) continue;   // genera falsos positivos
      if (!all.has(w)) all.set(w, []);
      if (!all.get(w).includes(src)) all.get(w).push(src);
    }
  }

  const sorted = [...all.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const header = `// AUTO-GENERADO por scripts/merge-external-lists.mjs
// NO EDITAR a mano — re-ejecutar el script para regenerar.
//
// Fuentes externas fusionadas para idioma "${lang}" (${lang2name[lang]}):
//   - chucknorris-io/swear-words (CC-BY-4.0)
//   - viddexa/safetext (MIT)
${lang === 'es' ? '//   - Alexmnzlms/Insultos (insultos peninsulares)\n' : ''}//
// Filtros aplicados al cargar:
//   - normalización NFD + lowercase + sólo letras
//   - longitud >= 4 (ambiguas excluidas)
//   - frases con espacios excluidas
//   - dedup contra ${lang2name[lang]}.js

`;

  const exportName = `${lang2name[lang]}External`;
  const body = `export const ${exportName} = [\n` +
    sorted.map(([w, srcs]) => `  ${JSON.stringify(w)}, // ${srcs.join(', ')}`).join('\n') +
    `\n];\n`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, `${lang}.js`), header + body);
  console.log(`✓ ${lang}: ${sorted.length} entradas únicas externas`);
  return sorted.length;
}

let total = 0;
for (const lang of ['es', 'en', 'fr', 'pt']) {
  total += await buildLang(lang);
}
console.log(`\nTotal entradas externas añadidas: ${total}`);
