// Capa estática: busca cada palabra prohibida como subcadena en TODAS las
// vistas del input (concatenado sin espacios, invertido, deleeted, fonética
// del idioma…). Es la primera defensa: rapidísima, determinista, y atrapa
// el grueso de los casos sin gastar tokens de IA.
//
// Cambio clave vs versión anterior:
//   ▸ El matching fonético ahora se aplica a TODAS las listas (profanity,
//     joke names, jugadores rivales y chants), no sólo a joke names.
//     Esto es lo que arregla "Carlos Gil Hipoyas" → "gilipollas",
//     "Mar Higuan Arica" → "marihuana", "Warra" → "guarra", etc.

import { spanishProfanity, spanishJokeNames, spanishExactOnly } from '../blocklists/spanish.js';
import { englishProfanity, englishJokeNames, englishExactOnly } from '../blocklists/english.js';
import { frenchProfanity, frenchJokeNames, frenchExactOnly } from '../blocklists/french.js';
import { portugueseProfanity, portugueseJokeNames, portugueseExactOnly } from '../blocklists/portuguese.js';
import { spanishExternal } from '../blocklists/external/es.js';
import { englishExternal } from '../blocklists/external/en.js';
import { frenchExternal } from '../blocklists/external/fr.js';
import { portugueseExternal } from '../blocklists/external/pt.js';
import {
  rivalPlayerFullNames,
  antiMadridChants,
  uniqueAloneSurnames,
  commonAloneSurnames,
} from '../blocklists/realMadrid.js';
import { playerNameTokens, contextSensitiveSlurs } from '../blocklists/sensitiveContexts.js';
import { applyScunthorpeWhitelist } from '../blocklists/scunthorpeWhitelist.js';
import { phoneticEs, phoneticEn, phoneticFr, phoneticPt } from '../normalize.js';
import { buildAhoCorasick } from '../lib/ahoCorasick.js';
import { fuzzyContains } from '../lib/fuzzyMatch.js';

// Selecciona el transformador fonético según el idioma de la entrada.
const PHONETIC_FN = {
  es: phoneticEs,
  en: phoneticEn,
  fr: phoneticFr,
  pt: phoneticPt,
};

// Aplana todas las palabras-broma a sus formas concatenadas y precalcula
// también su versión fonética (en su idioma). Hacerlo al cargar el módulo
// significa que cada validación es O(N) lookups con strings ya normalizados.
const jokeForms = [
  ...spanishJokeNames.map(([form, why]) => ({ form, why, lang: 'es', phonetic: phoneticEs(form) })),
  ...englishJokeNames.map(([form, why]) => ({ form, why, lang: 'en', phonetic: phoneticEn(form) })),
  ...frenchJokeNames.map(([form, why]) => ({ form, why, lang: 'fr', phonetic: phoneticFr(form) })),
  ...portugueseJokeNames.map(([form, why]) => ({ form, why, lang: 'pt', phonetic: phoneticPt(form) })),
];

const realMadridForms = [
  ...rivalPlayerFullNames.map(([form, why]) => ({ form, why, category: 'rival-player', phonetic: phoneticEs(form) })),
  ...antiMadridChants.map(([form, why]) => ({ form, why, category: 'anti-madrid', phonetic: phoneticEs(form) })),
];

// ─── Aho-Corasick: pre-construido al cargar el módulo ─────────────────────
//
// Sustituimos los O(N×M) substring loops por un autómata O(n+m+matches).
// Construimos UN AC por idioma con la unión de profanity + external,
// MÁS un AC dedicado para joke names y otro para Real Madrid forms (que
// llevan razón legible distinta).
//
// Sólo metemos los términos NO marcados como exact-only (esos van por el
// path de tokens) y filtramos los que tienen espacios (van por path de
// frase, ya que el concat los aplana).
function buildLangAC(profanity, external, exactSet) {
  return buildAhoCorasick(
    [...profanity, ...external]
      .filter((w) => typeof w === 'string')
      .filter((w) => !exactSet.has(w))
      .filter((w) => w.length >= 3)
      .map((w) => [w.replace(/\s/g, ''), w])
  );
}

const acES = buildLangAC(spanishProfanity, spanishExternal, spanishExactOnly);
const acEN = buildLangAC(englishProfanity, englishExternal, englishExactOnly);
const acFR = buildLangAC(frenchProfanity, frenchExternal, frenchExactOnly);
const acPT = buildLangAC(portugueseProfanity, portugueseExternal, portugueseExactOnly);

// AC fonético (mismas listas pero con cada palabra transformada)
const acESPhonetic = buildAhoCorasick(
  [...spanishProfanity, ...spanishExternal]
    .filter((w) => typeof w === 'string' && !spanishExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticEs(w.replace(/\s/g, '')), w])
);
const acENPhonetic = buildAhoCorasick(
  [...englishProfanity, ...englishExternal]
    .filter((w) => typeof w === 'string' && !englishExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticEn(w.replace(/\s/g, '')), w])
);
const acFRPhonetic = buildAhoCorasick(
  [...frenchProfanity, ...frenchExternal]
    .filter((w) => typeof w === 'string' && !frenchExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticFr(w.replace(/\s/g, '')), w])
);
const acPTPhonetic = buildAhoCorasick(
  [...portugueseProfanity, ...portugueseExternal]
    .filter((w) => typeof w === 'string' && !portugueseExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticPt(w.replace(/\s/g, '')), w])
);

const acByLang = { es: acES, en: acEN, fr: acFR, pt: acPT };
const acPhoneticByLang = { es: acESPhonetic, en: acENPhonetic, fr: acFRPhonetic, pt: acPTPhonetic };

// AC para joke names (todos los idiomas en uno, con metadata del idioma)
const acJokes = buildAhoCorasick(
  jokeForms.map(({ form, why, lang }) => [form.replace(/\s/g, ''), { why, lang }])
);
const acJokesPhonetic = buildAhoCorasick(
  jokeForms.map(({ form, why, lang, phonetic }) => [
    phonetic || form.replace(/\s/g, ''),
    { why, lang },
  ])
);

// AC para Real Madrid: full-name combinations + chants
const acRealMadrid = buildAhoCorasick(
  realMadridForms.map(({ form, why, category }) => [form.replace(/\s/g, ''), { why, category }])
);
const acRealMadridPhonetic = buildAhoCorasick(
  realMadridForms.map(({ form, why, category, phonetic }) => [
    phonetic || form.replace(/\s/g, ''),
    { why, category },
  ])
);

// Profanity precomputed para fuzzy matching (palabras "core" >= 5 chars,
// vulgaridades inequívocas — no joke names, no real madrid)
const fuzzyTargetsES = [...spanishProfanity, ...spanishExternal]
  .filter((w) => typeof w === 'string' && !spanishExactOnly.has(w))
  .filter((w) => !w.includes(' ') && w.length >= 5)
  .slice(0, 200); // top 200 para mantener latencia razonable

const aloneRivalSurnames = [
  ...uniqueAloneSurnames.map(([form, why]) => ({ form, why, severity: 'high' })),
  ...commonAloneSurnames.map(([form, why]) => ({ form, why, severity: 'medium' })),
];

function findHitInTokens(tokens, needle) {
  for (const t of tokens) if (t === needle) return t;
  if (needle.includes(' ')) {
    const joined = ' ' + tokens.join(' ') + ' ';
    if (joined.includes(' ' + needle + ' ')) return needle;
  }
  return null;
}

function findHitAsSubstring(haystacks, needle) {
  for (const view of haystacks) {
    if (!view) continue;
    if (view.includes(needle)) return view;
  }
  return null;
}

function checkProfanityList(list, exactOnlySet, lang, variants, issues) {
  // ── PASO 1: Tokens — palabras exactas (e.g. 'ano' suelto, no como
  // subcadena). Esto NO usa Scunthorpe porque ya es match a token aislado.
  for (const word of exactOnlySet) {
    const hit = findHitInTokens(variants.tokens, word);
    if (hit) {
      issues.push({
        layer: 'static',
        lang,
        category: 'profanity',
        match: word,
        view: hit,
        severity: 'high',
      });
    }
  }

  // ── PASO 2: Aho-Corasick sobre vistas raw + Scunthorpe whitelist
  // Aplicamos la whitelist Scunthorpe sobre cada vista para "perforar" las
  // palabras legítimas con substring vulgar (Cumbria, classic, esparrago…)
  // ANTES de buscar profanidad. Así "Cumbria López" no matchea 'cum'.
  const ac = acByLang[lang];
  const acPhonetic = acPhoneticByLang[lang];

  const rawHaystacks = [
    variants.concatNoSpaces,
    variants.dedupedConcat,
    variants.reversedConcat,
    variants.deLeeted,
    variants.noDiacritics,
  ];

  let foundInRaw = false;
  for (const view of rawHaystacks) {
    if (!view) continue;
    const punched = applyScunthorpeWhitelist(view);
    const m = ac.firstMatch(punched);
    if (m) {
      issues.push({
        layer: 'static',
        lang,
        category: 'profanity',
        match: m.meta,
        view,
        severity: 'high',
      });
      foundInRaw = true;
      break;
    }
  }

  // ── PASO 3: Aho-Corasick fonético — sólo si raw no matcheó.
  // Pasamos la función fonética para que la whitelist Scunthorpe se
  // transforme también (e.g. "cockburn" se vuelve "coburn" y neutraliza
  // el match "cok" derivado de "cock").
  if (!foundInRaw && acPhonetic) {
    const phoneticView = variants[`phonetic${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
    const phoneticFn = PHONETIC_FN[lang];
    if (phoneticView) {
      const punched = applyScunthorpeWhitelist(phoneticView, phoneticFn);
      const m = acPhonetic.firstMatch(punched);
      if (m) {
        issues.push({
          layer: 'static',
          lang,
          category: 'profanity',
          match: m.meta,
          view: phoneticView,
          reason: `Match fonético (${lang})`,
          severity: 'high',
        });
      }
    }
  }
}

export function staticCheck(variants) {
  const issues = [];

  // ── Profanity ES/EN/FR/PT con matching directo Y fonético ──────────────
  checkProfanityList(spanishProfanity,    spanishExactOnly,    'es', variants, issues);
  checkProfanityList(englishProfanity,    englishExactOnly,    'en', variants, issues);
  checkProfanityList(frenchProfanity,     frenchExactOnly,     'fr', variants, issues);
  checkProfanityList(portugueseProfanity, portugueseExactOnly, 'pt', variants, issues);

  // ── Nombres-broma conocidos — Aho-Corasick directo + fonético ───────────
  // O(n+matches) en vez de iterar 700 patrones. Sin Scunthorpe whitelist
  // porque los joke names son frases construidas, no palabras civiles.
  {
    const directView = variants.concatNoSpaces;
    let m = acJokes.firstMatch(directView);
    if (!m) {
      // Match fonético — buscamos en cada vista fonética con el AC del
      // idioma original del nombre (los joke names ES → phoneticEs, etc.)
      // Como acJokesPhonetic mezcla idiomas, intentamos en cada vista.
      for (const lang of ['es', 'en', 'fr', 'pt']) {
        const view = variants[`phonetic${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
        if (!view) continue;
        m = acJokesPhonetic.firstMatch(view);
        if (m && m.meta.lang === lang) break;
        m = null;
      }
    }
    if (m) {
      issues.push({
        layer: 'static',
        lang: m.meta.lang,
        category: 'joke-name',
        match: m.pattern,
        view: directView,
        reason: m.meta.why,
        severity: 'high',
      });
    }
  }

  // ── Real Madrid: full-name combinations + chants — Aho-Corasick ────────
  {
    let m = acRealMadrid.firstMatch(variants.concatNoSpaces);
    if (!m) m = acRealMadrid.firstMatch(variants.dedupedConcat);
    if (!m) m = acRealMadridPhonetic.firstMatch(variants.phoneticEs);
    if (m) {
      issues.push({
        layer: 'static',
        lang: 'es',
        category: m.meta.category,
        match: m.pattern,
        view: variants.concatNoSpaces,
        reason: m.meta.why,
        severity: 'high',
      });
    }
  }

  // ── Apellidos rivales SOLOS — match exact-equals al concat ──────────────
  for (const { form, why, severity } of aloneRivalSurnames) {
    if (
      variants.concatNoSpaces === form ||
      variants.dedupedConcat === form ||
      variants.phoneticEs === form
    ) {
      issues.push({
        layer: 'static',
        lang: 'es',
        category: 'rival-surname-alone',
        match: form,
        view: variants.concatNoSpaces,
        reason: why,
        severity,
      });
    }
  }

  // ── Insulto a jugador (racism-context) ──────────────────────────────────
  // Si el input contiene un token de jugador conocido + un término sensible
  // de cualquier idioma, lo marcamos como racism-context con severity:high.
  // Esto cubre "Vinicius mono", "Mbappé macaco", "Bellingham viejo", etc.,
  // donde la combinación es ofensiva aunque cada palabra suelta sea ambigua.
  detectPlayerInsultContext(variants, issues);

  return issues;
}

function detectPlayerInsultContext(variants, issues) {
  const tokens = variants.tokens;
  if (!tokens || tokens.length < 2) return;

  // ¿Hay algún token que sea un jugador famoso?
  const playerToken = tokens.find((t) => playerNameTokens.has(t));
  if (!playerToken) return;

  // ¿Hay algún token que sea un slur contextual en cualquier idioma?
  for (const [lang, slurs] of Object.entries(contextSensitiveSlurs)) {
    for (const t of tokens) {
      if (t === playerToken) continue; // mismo token no cuenta
      if (slurs.has(t)) {
        issues.push({
          layer: 'static',
          lang,
          category: 'racism-context',
          match: `${playerToken} + ${t}`,
          view: tokens.join(' '),
          reason: `Insulto a jugador: combinación "${playerToken}" + "${t}" (${lang}). Inaceptable en el HALO.`,
          severity: 'high',
        });
        return; // sólo emitimos un issue por input
      }
    }
  }
}
