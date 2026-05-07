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
import { germanProfanity, germanJokeNames, germanExactOnly } from '../blocklists/german.js';
import { italianProfanity, italianJokeNames, italianExactOnly } from '../blocklists/italian.js';
import { russianProfanity, russianJokeNames, russianExactOnly } from '../blocklists/russian.js';
import { polishProfanity, polishJokeNames, polishExactOnly } from '../blocklists/polish.js';
import { arabicProfanity, arabicJokeNames, arabicExactOnly } from '../blocklists/arabic.js';
import { greekProfanity, greekJokeNames, greekExactOnly } from '../blocklists/greek.js';
import { turkishProfanity, turkishJokeNames, turkishExactOnly } from '../blocklists/turkish.js';
import { romanianProfanity, romanianJokeNames, romanianExactOnly } from '../blocklists/romanian.js';
import { chineseProfanity, chineseJokeNames, chineseExactOnly } from '../blocklists/chinese.js';
import { japaneseProfanity, japaneseJokeNames, japaneseExactOnly } from '../blocklists/japanese.js';
import { koreanProfanity, koreanJokeNames, koreanExactOnly } from '../blocklists/korean.js';
import { hebrewProfanity, hebrewJokeNames, hebrewExactOnly } from '../blocklists/hebrew.js';
import { hungarianProfanity, hungarianJokeNames, hungarianExactOnly } from '../blocklists/hungarian.js';
import { dutchProfanity, dutchJokeNames, dutchExactOnly } from '../blocklists/dutch.js';
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
import { getContext, DEFAULT_CONTEXT } from '../contexts/index.js';
import { applyScunthorpeWhitelist, scunthorpeWhitelist } from '../blocklists/scunthorpeWhitelist.js';
import {
  historicalFiguresAcEntries,
  historicalFigureTokens,
  HISTORICAL_RARE_SURNAMES,
} from '../blocklists/historicalFigures.js';
import {
  phoneticEs, phoneticEn, phoneticFr, phoneticPt,
  phoneticDe, phoneticIt, phoneticRu, phoneticPl, phoneticAr,
  phoneticEl, phoneticTr, phoneticRo,
  phoneticZh, phoneticJa, phoneticKo, phoneticHe, phoneticHu, phoneticNl,
} from '../normalize.js';
import { buildAhoCorasick } from '../lib/ahoCorasick.js';
import { fuzzyContains } from '../lib/fuzzyMatch.js';

// Selecciona el transformador fonético según el idioma de la entrada.
const PHONETIC_FN = {
  es: phoneticEs,
  en: phoneticEn,
  fr: phoneticFr,
  pt: phoneticPt,
  de: phoneticDe,
  it: phoneticIt,
  ru: phoneticRu,
  pl: phoneticPl,
  ar: phoneticAr,
  el: phoneticEl,
  tr: phoneticTr,
  ro: phoneticRo,
  zh: phoneticZh,
  ja: phoneticJa,
  ko: phoneticKo,
  he: phoneticHe,
  hu: phoneticHu,
  nl: phoneticNl,
};

// Aplana todas las palabras-broma a sus formas concatenadas y precalcula
// también su versión fonética (en su idioma). Hacerlo al cargar el módulo
// significa que cada validación es O(N) lookups con strings ya normalizados.
const jokeForms = [
  ...spanishJokeNames.map(([form, why]) => ({ form, why, lang: 'es', phonetic: phoneticEs(form) })),
  ...englishJokeNames.map(([form, why]) => ({ form, why, lang: 'en', phonetic: phoneticEn(form) })),
  ...frenchJokeNames.map(([form, why]) => ({ form, why, lang: 'fr', phonetic: phoneticFr(form) })),
  ...portugueseJokeNames.map(([form, why]) => ({ form, why, lang: 'pt', phonetic: phoneticPt(form) })),
  ...germanJokeNames.map(([form, why]) => ({ form, why, lang: 'de', phonetic: phoneticDe(form) })),
  ...italianJokeNames.map(([form, why]) => ({ form, why, lang: 'it', phonetic: phoneticIt(form) })),
  ...russianJokeNames.map(([form, why]) => ({ form, why, lang: 'ru', phonetic: phoneticRu(form) })),
  ...polishJokeNames.map(([form, why]) => ({ form, why, lang: 'pl', phonetic: phoneticPl(form) })),
  ...arabicJokeNames.map(([form, why]) => ({ form, why, lang: 'ar', phonetic: phoneticAr(form) })),
  ...greekJokeNames.map(([form, why]) => ({ form, why, lang: 'el', phonetic: phoneticEl(form) })),
  ...turkishJokeNames.map(([form, why]) => ({ form, why, lang: 'tr', phonetic: phoneticTr(form) })),
  ...romanianJokeNames.map(([form, why]) => ({ form, why, lang: 'ro', phonetic: phoneticRo(form) })),
  ...chineseJokeNames.map(([form, why]) => ({ form, why, lang: 'zh', phonetic: phoneticZh(form) })),
  ...japaneseJokeNames.map(([form, why]) => ({ form, why, lang: 'ja', phonetic: phoneticJa(form) })),
  ...koreanJokeNames.map(([form, why]) => ({ form, why, lang: 'ko', phonetic: phoneticKo(form) })),
  ...hebrewJokeNames.map(([form, why]) => ({ form, why, lang: 'he', phonetic: phoneticHe(form) })),
  ...hungarianJokeNames.map(([form, why]) => ({ form, why, lang: 'hu', phonetic: phoneticHu(form) })),
  ...dutchJokeNames.map(([form, why]) => ({ form, why, lang: 'nl', phonetic: phoneticNl(form) })),
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
// Alemán e italiano sólo tienen blocklist core (sin external/LDNOOBW por
// ahora). Pasamos array vacío como "external" para reusar el mismo helper.
const acDE = buildLangAC(germanProfanity, [], germanExactOnly);
const acIT = buildLangAC(italianProfanity, [], italianExactOnly);
const acRU = buildLangAC(russianProfanity, [], russianExactOnly);
const acPL = buildLangAC(polishProfanity, [], polishExactOnly);
const acAR = buildLangAC(arabicProfanity, [], arabicExactOnly);
const acEL = buildLangAC(greekProfanity, [], greekExactOnly);
const acTR = buildLangAC(turkishProfanity, [], turkishExactOnly);
const acRO = buildLangAC(romanianProfanity, [], romanianExactOnly);
const acZH = buildLangAC(chineseProfanity, [], chineseExactOnly);
const acJA = buildLangAC(japaneseProfanity, [], japaneseExactOnly);
const acKO = buildLangAC(koreanProfanity, [], koreanExactOnly);
const acHE = buildLangAC(hebrewProfanity, [], hebrewExactOnly);
const acHU = buildLangAC(hungarianProfanity, [], hungarianExactOnly);
const acNL = buildLangAC(dutchProfanity, [], dutchExactOnly);

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
const acDEPhonetic = buildAhoCorasick(
  germanProfanity
    .filter((w) => typeof w === 'string' && !germanExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticDe(w.replace(/\s/g, '')), w])
);
const acITPhonetic = buildAhoCorasick(
  italianProfanity
    .filter((w) => typeof w === 'string' && !italianExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticIt(w.replace(/\s/g, '')), w])
);
const acRUPhonetic = buildAhoCorasick(
  russianProfanity
    .filter((w) => typeof w === 'string' && !russianExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticRu(w.replace(/\s/g, '')), w])
);
const acPLPhonetic = buildAhoCorasick(
  polishProfanity
    .filter((w) => typeof w === 'string' && !polishExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticPl(w.replace(/\s/g, '')), w])
);
const acARPhonetic = buildAhoCorasick(
  arabicProfanity
    .filter((w) => typeof w === 'string' && !arabicExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticAr(w.replace(/\s/g, '')), w])
);
const acELPhonetic = buildAhoCorasick(
  greekProfanity
    .filter((w) => typeof w === 'string' && !greekExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticEl(w.replace(/\s/g, '')), w])
);
const acTRPhonetic = buildAhoCorasick(
  turkishProfanity
    .filter((w) => typeof w === 'string' && !turkishExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticTr(w.replace(/\s/g, '')), w])
);
const acROPhonetic = buildAhoCorasick(
  romanianProfanity
    .filter((w) => typeof w === 'string' && !romanianExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticRo(w.replace(/\s/g, '')), w])
);
const acZHPhonetic = buildAhoCorasick(
  chineseProfanity
    .filter((w) => typeof w === 'string' && !chineseExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticZh(w.replace(/\s/g, '')), w])
);
const acJAPhonetic = buildAhoCorasick(
  japaneseProfanity
    .filter((w) => typeof w === 'string' && !japaneseExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticJa(w.replace(/\s/g, '')), w])
);
const acKOPhonetic = buildAhoCorasick(
  koreanProfanity
    .filter((w) => typeof w === 'string' && !koreanExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticKo(w.replace(/\s/g, '')), w])
);
const acHEPhonetic = buildAhoCorasick(
  hebrewProfanity
    .filter((w) => typeof w === 'string' && !hebrewExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticHe(w.replace(/\s/g, '')), w])
);
const acHUPhonetic = buildAhoCorasick(
  hungarianProfanity
    .filter((w) => typeof w === 'string' && !hungarianExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticHu(w.replace(/\s/g, '')), w])
);
const acNLPhonetic = buildAhoCorasick(
  dutchProfanity
    .filter((w) => typeof w === 'string' && !dutchExactOnly.has(w) && w.length >= 3)
    .map((w) => [phoneticNl(w.replace(/\s/g, '')), w])
);

const acByLang = {
  es: acES, en: acEN, fr: acFR, pt: acPT,
  de: acDE, it: acIT, ru: acRU, pl: acPL, ar: acAR,
  el: acEL, tr: acTR, ro: acRO,
  zh: acZH, ja: acJA, ko: acKO, he: acHE, hu: acHU, nl: acNL,
};
const acPhoneticByLang = {
  es: acESPhonetic, en: acENPhonetic, fr: acFRPhonetic, pt: acPTPhonetic,
  de: acDEPhonetic, it: acITPhonetic,
  ru: acRUPhonetic, pl: acPLPhonetic, ar: acARPhonetic,
  el: acELPhonetic, tr: acTRPhonetic, ro: acROPhonetic,
  zh: acZHPhonetic, ja: acJAPhonetic, ko: acKOPhonetic,
  he: acHEPhonetic, hu: acHUPhonetic, nl: acNLPhonetic,
};

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

// ─── Tablas AC por contexto (cache per-context) ────────────────────────
// Patrón multi-tenant: cada cliente (Real Madrid, FC Barcelona, etc.)
// tiene sus propias listas de rivales/cánticos/jugadores propios. La
// primera vez que un contexto se invoca se construyen sus tablas y se
// cachean. La cache vive durante toda la ejecución del proceso.
const _contextCache = new Map();

function buildContextTables(ctx) {
  const forms = [
    ...ctx.rivalPlayerFullNames.map(([form, why]) =>
      ({ form, why, category: 'rival-player', phonetic: phoneticEs(form) })),
    ...ctx.antiClubChants.map(([form, why]) =>
      ({ form, why, category: 'anti-club', phonetic: phoneticEs(form) })),
  ];
  return {
    forms,
    ac: buildAhoCorasick(
      forms.map(({ form, why, category }) =>
        [form.replace(/\s/g, ''), { why, category }])
    ),
    acPhonetic: buildAhoCorasick(
      forms.map(({ form, why, category, phonetic }) =>
        [phonetic || form.replace(/\s/g, ''), { why, category }])
    ),
    aloneRivalSurnames: [
      ...ctx.uniqueAloneSurnames.map(([form, why]) =>
        ({ form, why, severity: 'high' })),
      ...ctx.commonAloneSurnames.map(([form, why]) =>
        ({ form, why, severity: 'medium' })),
    ],
    ownPlayerTokens: ctx.ownPlayerTokens || new Set(),
  };
}

function getContextTables(ctx) {
  let tables = _contextCache.get(ctx.id);
  if (!tables) {
    tables = buildContextTables(ctx);
    _contextCache.set(ctx.id, tables);
  }
  return tables;
}

// Pre-construimos la tabla del contexto por defecto al cargar el módulo
// (zero overhead extra para el caso común Real Madrid).
const _defaultTables = getContextTables(DEFAULT_CONTEXT);

// Compatibilidad con el código pre-multi-tenant que importaba estos:
const acRealMadrid = _defaultTables.ac;
const acRealMadridPhonetic = _defaultTables.acPhonetic;

// AC para figuras históricas polémicas (dictadores, conquistadores…).
// IMPORTANTE: estas coincidencias NO bloquean. Sólo bajan la confianza y
// marcan REVIEW HUMANO con el motivo concreto. Se buscan SÓLO contra
// nombre+apellido completo concatenado, nunca apellido-solo, para no
// falsear personas con apellidos comunes (Franco, Stalin como apellido raro
// pero existente, etc.). El operador del Tour decide con DNI.
const acHistorical = buildAhoCorasick(historicalFiguresAcEntries());
const acHistoricalPhonetic = buildAhoCorasick(
  historicalFiguresAcEntries().map(([form, meta]) => [phoneticEs(form), meta])
);
// Tokens individuales (Hitler, Stalin, Putin, Goebbels…) que también
// aparecen en blocklists de profanidad/extremismo. Cuando un match de
// profanidad coincide con uno de éstos Y el detector histórico también
// dispara, demotamos high → medium para que la decisión sea REVIEW
// humana con explicación, no REJECT silencioso.
const HISTORICAL_TOKENS = historicalFigureTokens();

// Profanity precomputed para fuzzy matching (palabras "core" >= 5 chars,
// vulgaridades inequívocas — no joke names, no real madrid)
const fuzzyTargetsES = [...spanishProfanity, ...spanishExternal]
  .filter((w) => typeof w === 'string' && !spanishExactOnly.has(w))
  .filter((w) => !w.includes(' ') && w.length >= 5)
  .slice(0, 200); // top 200 para mantener latencia razonable

// `aloneRivalSurnames` ahora vive dentro de cada contexto vía
// `getContextTables(ctx).aloneRivalSurnames`. Mantenemos esta variable
// por compatibilidad con tests/tooling externo que la pudieran importar:
const aloneRivalSurnames = _defaultTables.aloneRivalSurnames;

// Pre-computa las palabras Scunthorpe REVERTIDAS para perforar el view
// `reversedConcat`. Sólo se construye una vez al cargar el módulo.
const REVERSED_SCUNTHORPE = scunthorpeWhitelist
  .map((w) => w
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .split('')
    .reverse()
    .join(''))
  .filter(Boolean);

/**
 * Aplica la whitelist Scunthorpe sobre la vista `reversedConcat`, usando
 * las palabras invertidas. Caso típico: "escobar" reverso = "rabocse" →
 * perfora "rabo" que aparece ahí únicamente como artefacto de la
 * inversión, no como insulto real.
 */
function applyScunthorpeWhitelistOnReversed(reversedView) {
  if (!reversedView) return reversedView;
  let out = reversedView;
  for (const w of REVERSED_SCUNTHORPE) {
    if (!w || !out.includes(w)) continue;
    const placeholder = '\x02'.repeat(w.length);
    out = out.split(w).join(placeholder);
  }
  return out;
}

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
    // Para `reversedConcat` aplicamos la Scunthorpe whitelist también
    // sobre las versiones REVERTIDAS de cada palabra (e.g. "escobar"
    // reverso = "rabocse" → perfora "rabo" que ahí es ruido). Esto
    // arregla un falso positivo común en apellidos hispanos como
    // "Escobar", "Cobarde", etc.
    const punched =
      view === variants.reversedConcat
        ? applyScunthorpeWhitelistOnReversed(view)
        : applyScunthorpeWhitelist(view);
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

/**
 * Capa estática multi-tenant.
 *
 * @param {Object} variants — salida de buildVariants()
 * @param {Object} [options]
 * @param {string|Object} [options.context='real-madrid'] — id de contexto
 *        ('real-madrid', 'fc-barcelona', …) o el objeto de contexto en sí.
 *        Determina qué jugadores rivales / cánticos se consideran ofensivos
 *        para este cliente.
 */
export function staticCheck(variants, options = {}) {
  const issues = [];

  // Resolver contexto. Aceptamos id (string) o el objeto de contexto.
  const ctx = typeof options.context === 'string'
    ? getContext(options.context)
    : (options.context || DEFAULT_CONTEXT);
  const ctxTables = getContextTables(ctx);

  // ── Profanity ES/EN/FR/PT/DE/IT con matching directo Y fonético ────────
  checkProfanityList(spanishProfanity,    spanishExactOnly,    'es', variants, issues);
  checkProfanityList(englishProfanity,    englishExactOnly,    'en', variants, issues);
  checkProfanityList(frenchProfanity,     frenchExactOnly,     'fr', variants, issues);
  checkProfanityList(portugueseProfanity, portugueseExactOnly, 'pt', variants, issues);
  checkProfanityList(germanProfanity,     germanExactOnly,     'de', variants, issues);
  checkProfanityList(italianProfanity,    italianExactOnly,    'it', variants, issues);
  checkProfanityList(russianProfanity,    russianExactOnly,    'ru', variants, issues);
  checkProfanityList(polishProfanity,     polishExactOnly,     'pl', variants, issues);
  checkProfanityList(arabicProfanity,     arabicExactOnly,     'ar', variants, issues);
  checkProfanityList(greekProfanity,      greekExactOnly,      'el', variants, issues);
  checkProfanityList(turkishProfanity,    turkishExactOnly,    'tr', variants, issues);
  checkProfanityList(romanianProfanity,   romanianExactOnly,   'ro', variants, issues);
  checkProfanityList(chineseProfanity,    chineseExactOnly,    'zh', variants, issues);
  checkProfanityList(japaneseProfanity,   japaneseExactOnly,   'ja', variants, issues);
  checkProfanityList(koreanProfanity,     koreanExactOnly,     'ko', variants, issues);
  checkProfanityList(hebrewProfanity,     hebrewExactOnly,     'he', variants, issues);
  checkProfanityList(hungarianProfanity,  hungarianExactOnly,  'hu', variants, issues);
  checkProfanityList(dutchProfanity,      dutchExactOnly,      'nl', variants, issues);

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
      for (const lang of ['es', 'en', 'fr', 'pt', 'de', 'it', 'ru', 'pl', 'ar', 'el', 'tr', 'ro', 'zh', 'ja', 'ko', 'he', 'hu', 'nl']) {
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

  // ── Contexto del cliente (Real Madrid / FC Barcelona / …): full-name
  //    combinations + chants — Aho-Corasick — multi-tenant
  {
    let m = ctxTables.ac.firstMatch(variants.concatNoSpaces);
    if (!m) m = ctxTables.ac.firstMatch(variants.dedupedConcat);
    if (!m) m = ctxTables.acPhonetic.firstMatch(variants.phoneticEs);
    if (m) {
      issues.push({
        layer: 'static',
        lang: 'es',
        category: m.meta.category,
        match: m.pattern,
        view: variants.concatNoSpaces,
        reason: m.meta.why,
        severity: 'high',
        context: ctx.id,
      });
    }
  }

  // ── Apellidos rivales SOLOS — match exact-equals al concat (multi-tenant)
  for (const { form, why, severity } of ctxTables.aloneRivalSurnames) {
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
        context: ctx.id,
      });
    }
  }

  // ── Insulto a jugador (racism-context) ──────────────────────────────────
  // Si el input contiene un token de jugador conocido + un término sensible
  // de cualquier idioma, lo marcamos como racism-context con severity:high.
  // Esto cubre "Vinicius mono", "Mbappé macaco", "Bellingham viejo", etc.,
  // donde la combinación es ofensiva aunque cada palabra suelta sea ambigua.
  // El set de "jugadores propios" viene del contexto (Real Madrid: Vinicius,
  // Bellingham…; FC Barcelona: Yamal, Pedri, Lewandowski…).
  detectPlayerInsultContext(variants, issues, ctxTables.ownPlayerTokens, ctx.id);

  // ── Figuras históricas polémicas (dictadores, genocidas, conquistadores) ──
  // NO bloquean. Sólo emiten severity:medium → REVIEW HUMANO con el motivo
  // concreto. Buscamos contra concat completo (nombre+apellido) y fonético
  // ES, nunca contra tokens sueltos (apellidos comunes como Franco se
  // gestionan con el operador y DNI).
  const historicalHit = detectHistoricalFigures(variants, issues);

  // Si disparó la capa histórica, demotamos cualquier match high de
  // profanidad/extremismo que sea ruido Scunthorpe causado por el nombre
  // histórico. Tres casos:
  //   ▸ "hitler" exacto en lista de extremismo → demote (es la figura)
  //   ▸ "shit" contenida en token "hitler" → demote (junction Scunthorpe)
  //   ▸ "rabo" hallado en `reversedConcat` ("escobar"→"rabocse") → demote
  //     (el match de inversión es backup para "atup→puta"; cuando el nombre
  //     ya coincide con figura histórica real, el match invertido es ruido)
  // Resultado: REVIEW humana con explicación clara, no REJECT silencioso.
  if (historicalHit) {
    for (const issue of issues) {
      if (
        issue.severity === 'high' &&
        (issue.category === 'profanity' || issue.category === 'extremism') &&
        typeof issue.match === 'string'
      ) {
        const m = issue.match.toLowerCase();
        const matchesHistorical =
          HISTORICAL_TOKENS.has(m) ||
          // El match de profanidad está contenido dentro de algún token
          // histórico ya flageado (ej. "shit" ⊂ "hitler").
          [...HISTORICAL_TOKENS].some((tok) => tok.length >= m.length + 1 && tok.includes(m));
        const isReversedView = issue.view && issue.view === variants.reversedConcat;
        if (matchesHistorical || isReversedView) {
          issue.severity = 'medium';
          issue.demotedBy = 'historical-controversial';
          issue.originalSeverity = 'high';
          if (isReversedView) issue.demoteReason = 'reversed-view-noise';
        }
      }
    }
  }

  return issues;
}

/**
 * Detecta coincidencias con figuras históricas polémicas. NO bloquea
 * (severity:medium → REVIEW). Sólo aplica al match completo nombre+apellido,
 * nunca a apellido suelto, para no falsear personas legítimas.
 *
 * Ejemplos:
 *   ▸ "Adolf Hitler"          → REVIEW, motivo dictador alemán
 *   ▸ "Francisco Franco García" (un fan español real) → REVIEW, motivo
 *     dictador español. Operador confirma con DNI y aprueba.
 *   ▸ "María Franco"          → NO matchea (no hay full-name coincidente)
 *   ▸ "Cortés López"          → NO matchea (no hay 'Hernán' delante)
 */
function detectHistoricalFigures(variants, issues) {
  // 1) Match directo sobre concat sin espacios (cubre "AdolfoHitler",
  //    "Francisco Franco" → "franciscofranco", "Stalin Iósif" invertido).
  let m = acHistorical.firstMatch(variants.concatNoSpaces);
  if (!m) m = acHistorical.firstMatch(variants.dedupedConcat);
  // 2) Match fonético ES (cubre "Pancisko Franko", "Polpot", etc.)
  if (!m) m = acHistoricalPhonetic.firstMatch(variants.phoneticEs);

  if (m) {
    const reason =
      `figura histórica polémica` +
      (m.meta.era ? ` (${m.meta.era})` : '') +
      `. ${m.meta.why} Si es persona real, comprueba DNI y aprueba manualmente.`;
    issues.push({
      layer: 'static',
      lang: 'es',
      category: 'historical-controversial',
      match: m.meta.canonical || m.pattern,
      view: variants.concatNoSpaces,
      reason,
      severity: 'medium', // REVIEW, no REJECT — siempre humano decide
    });
    return true;
  }

  // 3) Apellidos POLÉMICOS RAROS sueltos (Hitler, Goebbels, Mengele…). No
  //    incluyen apellidos comunes (Franco, Castro, Cortés). Si aparecen
  //    como token aislado, emitimos REVIEW para que el operador confirme
  //    con DNI. Si es persona real con ese apellido (extremadamente raro
  //    pero existente), se aprueba manualmente.
  const tokens = variants.tokens || [];
  for (const t of tokens) {
    const tNorm = t.toLowerCase();
    if (HISTORICAL_RARE_SURNAMES.has(tNorm)) {
      const why = HISTORICAL_RARE_SURNAMES.get(tNorm);
      issues.push({
        layer: 'static',
        lang: 'es',
        category: 'historical-controversial-surname',
        match: t,
        view: variants.concatNoSpaces,
        reason: `apellido coincidente con figura histórica polémica. ${why} Apellido extremadamente raro como nombre civil; comprueba con DNI antes de aprobar.`,
        severity: 'medium',
      });
      return true;
    }
  }

  return false;
}

function detectPlayerInsultContext(variants, issues, ownPlayerTokens, contextId) {
  const tokens = variants.tokens;
  if (!tokens || tokens.length < 2) return;

  // Conjunto de jugadores propios — viene del contexto. Mantenemos la
  // unión con el set legacy `playerNameTokens` (que también incluye
  // "estrellas globales" como Pogba, Salah…) para no perder coberturas
  // existentes ni hacer regresar el caso "Vinicius mono" en Real Madrid.
  const playerSet = ownPlayerTokens && ownPlayerTokens.size
    ? new Set([...ownPlayerTokens, ...playerNameTokens])
    : playerNameTokens;

  // ¿Hay algún token que sea un jugador famoso?
  const playerToken = tokens.find((t) => playerSet.has(t));
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
          context: contextId,
        });
        return; // sólo emitimos un issue por input
      }
    }
  }
}
