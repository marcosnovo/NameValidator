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
import {
  rivalPlayerFullNames,
  antiMadridChants,
  uniqueAloneSurnames,
  commonAloneSurnames,
} from '../blocklists/realMadrid.js';
import { playerNameTokens, contextSensitiveSlurs } from '../blocklists/sensitiveContexts.js';
import { phoneticEs, phoneticEn, phoneticFr, phoneticPt } from '../normalize.js';

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
  const haystacks = [
    variants.concatNoSpaces,
    variants.dedupedConcat,
    variants.reversedConcat,
    variants.deLeeted,
    variants.noDiacritics,
  ];

  // Vista fonética del input correspondiente al idioma.
  const phoneticInputView = variants[`phonetic${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
  const phoneticFn = PHONETIC_FN[lang];

  for (const word of list) {
    const exactOnly = exactOnlySet.has(word);
    const cleaned = word.replace(/\s/g, '');
    let hit = null;

    if (exactOnly) {
      hit = findHitInTokens(variants.tokens, word);
    } else {
      // 1. Match directo en las vistas crudas
      hit = findHitAsSubstring(haystacks, cleaned);
      // 2. Match fonético: aplica la transformación del idioma a la palabra
      //    y busca en la vista fonética del input
      if (!hit && phoneticFn && phoneticInputView) {
        const phoneticWord = phoneticFn(cleaned);
        if (phoneticWord && phoneticInputView.includes(phoneticWord)) {
          hit = phoneticInputView;
        }
      }
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

  // Pase para palabras de exact-only que NO están en la lista principal
  // (ej. 'ano': no la metemos en spanishProfanity para no chocar con "Ana",
  //  pero sí queremos pillarla como token aislado).
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

  // ── Profanity ES/EN/FR/PT con matching directo Y fonético ──────────────
  checkProfanityList(spanishProfanity,    spanishExactOnly,    'es', variants, issues);
  checkProfanityList(englishProfanity,    englishExactOnly,    'en', variants, issues);
  checkProfanityList(frenchProfanity,     frenchExactOnly,     'fr', variants, issues);
  checkProfanityList(portugueseProfanity, portugueseExactOnly, 'pt', variants, issues);

  // ── Nombres-broma conocidos con matching directo Y fonético ────────────
  for (const { form, why, lang, phonetic } of jokeForms) {
    const cleaned = form.replace(/\s/g, '');

    const directHit =
      variants.concatNoSpaces.includes(cleaned) ||
      variants.dedupedConcat.includes(cleaned);

    const phoneticView = variants[`phonetic${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
    const phoneticHit =
      phonetic &&
      phoneticView &&
      phoneticView.includes(phonetic);

    if (directHit || phoneticHit) {
      issues.push({
        layer: 'static',
        lang,
        category: 'joke-name',
        match: form,
        view: variants.concatNoSpaces,
        reason: why + (phoneticHit && !directHit ? ' (match fonético)' : ''),
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
