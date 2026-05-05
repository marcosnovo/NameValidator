// Capa estática: busca cada palabra prohibida como subcadena en TODAS las
// vistas del input (concatenado sin espacios, invertido, deleeted, etc.).
// Es la primera defensa: rapidísima, determinista, y atrapa el 80% de los
// casos obvios sin gastar un solo token de IA.

import { spanishProfanity, spanishJokeNames, spanishExactOnly } from '../blocklists/spanish.js';
import { englishProfanity, englishJokeNames, englishExactOnly } from '../blocklists/english.js';
import { frenchProfanity, frenchJokeNames, frenchExactOnly } from '../blocklists/french.js';
import { rivalPlayerFullNames, antiMadridChants } from '../blocklists/realMadrid.js';

// Aplana todas las palabras-broma a sus formas concatenadas.
const jokeForms = [
  ...spanishJokeNames.map(([form, why]) => ({ form, why, lang: 'es' })),
  ...englishJokeNames.map(([form, why]) => ({ form, why, lang: 'en' })),
  ...frenchJokeNames.map(([form, why]) => ({ form, why, lang: 'fr' })),
];

// Patrones específicos del contexto Real Madrid (jugadores rivales con
// nombre+apellido completo + chants antimadridistas).
const realMadridForms = [
  ...rivalPlayerFullNames.map(([form, why]) => ({ form, why, category: 'rival-player' })),
  ...antiMadridChants.map(([form, why]) => ({ form, why, category: 'anti-madrid' })),
];

function findHit(haystacks, needle, exactOnly) {
  for (const view of haystacks) {
    if (!view) continue;
    if (exactOnly) {
      if (view === needle) return view;
      // también se acepta como token aislado entre espacios:
      if ((' ' + view + ' ').includes(' ' + needle + ' ')) return view;
    } else {
      if (view.includes(needle)) return view;
    }
  }
  return null;
}

export function staticCheck(variants) {
  const issues = [];

  // Set de "vistas" donde buscamos subcadenas.
  const haystacks = [
    variants.concatNoSpaces,
    variants.dedupedConcat,
    variants.reversedConcat,
    variants.deLeeted,
    variants.noDiacritics,
  ];

  // Set de "vistas" tokenizadas para los exactos.
  const tokenViews = variants.tokens;

  // ── ES profanity
  for (const word of spanishProfanity) {
    const exactOnly = spanishExactOnly.has(word);
    const hit = exactOnly
      ? findHit(tokenViews, word, true)
      : findHit(haystacks, word.replace(/\s/g, ''), false);
    if (hit) {
      issues.push({
        layer: 'static',
        lang: 'es',
        category: 'profanity',
        match: word,
        view: hit,
        severity: 'high',
      });
    }
  }

  // ── EN profanity
  for (const word of englishProfanity) {
    const exactOnly = englishExactOnly.has(word);
    const hit = exactOnly
      ? findHit(tokenViews, word, true)
      : findHit(haystacks, word.replace(/\s/g, ''), false);
    if (hit) {
      issues.push({
        layer: 'static',
        lang: 'en',
        category: 'profanity',
        match: word,
        view: hit,
        severity: 'high',
      });
    }
  }

  // ── FR profanity
  for (const word of frenchProfanity) {
    const exactOnly = frenchExactOnly.has(word);
    const hit = exactOnly
      ? findHit(tokenViews, word, true)
      : findHit(haystacks, word.replace(/\s/g, ''), false);
    if (hit) {
      issues.push({
        layer: 'static',
        lang: 'fr',
        category: 'profanity',
        match: word,
        view: hit,
        severity: 'high',
      });
    }
  }

  // ── Nombres-broma conocidos en ES/EN/FR
  for (const { form, why, lang } of jokeForms) {
    const cleaned = form.replace(/\s/g, '');
    if (
      variants.concatNoSpaces.includes(cleaned) ||
      variants.dedupedConcat.includes(cleaned)
    ) {
      issues.push({
        layer: 'static',
        lang,
        category: 'joke-name',
        match: form,
        view: variants.concatNoSpaces,
        reason: why,
        severity: 'high',
      });
    }
  }

  // ── Contexto Real Madrid: jugadores rivales (nombre+apellido completo) y
  //    chants antimadridistas. NUNCA bloqueamos apellidos sueltos como
  //    "Guardiola" o "Iniesta" — sólo combinaciones completas. Eso permite
  //    que "Ángela Guardiola Guardiola" pase limpia.
  for (const { form, why, category } of realMadridForms) {
    const cleaned = form.replace(/\s/g, '');
    if (
      variants.concatNoSpaces.includes(cleaned) ||
      variants.dedupedConcat.includes(cleaned)
    ) {
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

  return issues;
}
