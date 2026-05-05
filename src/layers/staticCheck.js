// Capa estática: busca cada palabra prohibida como subcadena en TODAS las
// vistas del input (concatenado sin espacios, invertido, deleeted, fonética
// castellana…). Es la primera defensa: rapidísima, determinista, y atrapa
// el grueso de los casos sin gastar tokens de IA.

import { spanishProfanity, spanishJokeNames, spanishExactOnly } from '../blocklists/spanish.js';
import { englishProfanity, englishJokeNames, englishExactOnly } from '../blocklists/english.js';
import { frenchProfanity, frenchJokeNames, frenchExactOnly } from '../blocklists/french.js';
import {
  rivalPlayerFullNames,
  antiMadridChants,
  uniqueAloneSurnames,
  commonAloneSurnames,
} from '../blocklists/realMadrid.js';
import { phoneticEs } from '../normalize.js';

// Aplana todas las palabras-broma a sus formas concatenadas y precalcula su
// versión fonética castellana, para que la búsqueda sea O(1) lookup en cada
// pase.
const jokeForms = [
  ...spanishJokeNames.map(([form, why]) => ({ form, why, lang: 'es', phonetic: phoneticEs(form) })),
  ...englishJokeNames.map(([form, why]) => ({ form, why, lang: 'en', phonetic: null })),
  ...frenchJokeNames.map(([form, why]) => ({ form, why, lang: 'fr', phonetic: null })),
];

const realMadridForms = [
  ...rivalPlayerFullNames.map(([form, why]) => ({ form, why, category: 'rival-player', phonetic: phoneticEs(form) })),
  ...antiMadridChants.map(([form, why]) => ({ form, why, category: 'anti-madrid', phonetic: phoneticEs(form) })),
];

// Apellidos rivales SOLOS — la comparación es exact-equals contra la
// concatenación normalizada (no substring). Eso permite que "Carlos Messi
// García" pase (concat: carlosmessigarcia ≠ messi) pero "M E S S I" no
// (concat: messi == messi).
const aloneRivalSurnames = [
  ...uniqueAloneSurnames.map(([form, why]) => ({ form, why, severity: 'high' })),
  ...commonAloneSurnames.map(([form, why]) => ({ form, why, severity: 'medium' })),
];

function findHitInTokens(tokens, needle) {
  // Match a token completo o frase completa entre espacios.
  for (const t of tokens) if (t === needle) return t;
  // Frase: si la palabra contiene espacios, comparamos tokens consecutivos.
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
  const haystacks = [
    variants.concatNoSpaces,
    variants.dedupedConcat,
    variants.reversedConcat,
    variants.deLeeted,
    variants.noDiacritics,
    variants.phoneticEs,   // ← matches "devora melo" ↔ "deboramelo"
  ];

  for (const word of list) {
    const exactOnly = exactOnlySet.has(word);
    const cleaned = word.replace(/\s/g, '');
    let hit;
    if (exactOnly) {
      hit = findHitInTokens(variants.tokens, word);
    } else {
      hit = findHitAsSubstring(haystacks, cleaned);
    }
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

  // Pase aparte: las palabras de exactOnlySet que NO están en la lista
  // principal (ej. 'ano', que no metemos en spanishProfanity para evitar
  // falsos positivos en "Ana", pero sí queremos pillar como token aislado).
  for (const word of exactOnlySet) {
    if (list.includes(word)) continue;
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
}

export function staticCheck(variants) {
  const issues = [];

  // ── Profanity ES/EN/FR ──────────────────────────────────────────────────
  checkProfanityList(spanishProfanity, spanishExactOnly, 'es', variants, issues);
  checkProfanityList(englishProfanity, englishExactOnly, 'en', variants, issues);
  checkProfanityList(frenchProfanity, frenchExactOnly, 'fr', variants, issues);

  // ── Nombres-broma conocidos (con matching fonético en español) ──────────
  for (const { form, why, lang, phonetic } of jokeForms) {
    const cleaned = form.replace(/\s/g, '');

    // Match directo en concat / dedupe
    const directHit =
      variants.concatNoSpaces.includes(cleaned) ||
      variants.dedupedConcat.includes(cleaned);

    // Match fonético (sólo ES, donde aplica b↔v / h muda / ll↔y)
    const phoneticHit =
      lang === 'es' &&
      phonetic &&
      variants.phoneticEs.includes(phonetic);

    if (directHit || phoneticHit) {
      issues.push({
        layer: 'static',
        lang,
        category: 'joke-name',
        match: form,
        view: variants.concatNoSpaces,
        reason: why + (phoneticHit && !directHit ? ' (match fonético b↔v / h muda)' : ''),
        severity: 'high',
      });
    }
  }

  // ── Real Madrid: full-name combinations + chants ────────────────────────
  for (const { form, why, category, phonetic } of realMadridForms) {
    const cleaned = form.replace(/\s/g, '');
    const directHit =
      variants.concatNoSpaces.includes(cleaned) ||
      variants.dedupedConcat.includes(cleaned);
    const phoneticHit =
      phonetic && variants.phoneticEs.includes(phonetic);

    if (directHit || phoneticHit) {
      issues.push({
        layer: 'static',
        lang: 'es',
        category,
        match: form,
        view: variants.concatNoSpaces,
        reason: why,
        severity: 'high',
      });
    }
  }

  // ── Apellidos rivales SOLOS — match exact-equals al concat ──────────────
  // "M E S S I" → concat "messi" → match.
  // "Carlos Messi García" → concat "carlosmessigarcia" → no match.
  // Severity high para apellidos foráneos únicos (Messi, Cruyff…) que
  // bloquean. Severity medium para apellidos comunes (Iniesta, Guardiola…)
  // que mandan a REVIEW para que un humano confirme.
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

  return issues;
}
