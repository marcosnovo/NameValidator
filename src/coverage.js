// Stats de cobertura agregadas a partir de los blocklists reales que el
// validador carga en runtime. No hardcodeamos números — los recontamos en
// vivo para que la UI nunca se desincronice del contenido del bundle.
//
// La función exportada es síncrona y barata (sólo cuenta longitudes de
// arrays / sizes de Sets ya cargados en memoria).

import { spanishProfanity, spanishJokeNames, spanishExactOnly } from './blocklists/spanish.js';
import { englishProfanity, englishJokeNames, englishExactOnly } from './blocklists/english.js';
import { frenchProfanity, frenchJokeNames, frenchExactOnly } from './blocklists/french.js';
import { portugueseProfanity, portugueseJokeNames, portugueseExactOnly } from './blocklists/portuguese.js';
import { germanProfanity, germanJokeNames, germanExactOnly } from './blocklists/german.js';
import { italianProfanity, italianJokeNames, italianExactOnly } from './blocklists/italian.js';
import { dutchProfanity, dutchJokeNames, dutchExactOnly } from './blocklists/dutch.js';
import { hungarianProfanity, hungarianJokeNames, hungarianExactOnly } from './blocklists/hungarian.js';
import { czechProfanity, czechJokeNames, czechExactOnly } from './blocklists/czech.js';
import { russianProfanity, russianJokeNames, russianExactOnly } from './blocklists/russian.js';
import { polishProfanity, polishJokeNames, polishExactOnly } from './blocklists/polish.js';
import { arabicProfanity, arabicJokeNames, arabicExactOnly } from './blocklists/arabic.js';
import { greekProfanity, greekJokeNames, greekExactOnly } from './blocklists/greek.js';
import { turkishProfanity, turkishJokeNames, turkishExactOnly } from './blocklists/turkish.js';
import { romanianProfanity, romanianJokeNames, romanianExactOnly } from './blocklists/romanian.js';
import { chineseProfanity, chineseJokeNames, chineseExactOnly } from './blocklists/chinese.js';
import { japaneseProfanity, japaneseJokeNames, japaneseExactOnly } from './blocklists/japanese.js';
import { koreanProfanity, koreanJokeNames, koreanExactOnly } from './blocklists/korean.js';
import { hebrewProfanity, hebrewJokeNames, hebrewExactOnly } from './blocklists/hebrew.js';

import { historicalFigures } from './blocklists/historicalFigures.js';
import { scunthorpeWhitelist } from './blocklists/scunthorpeWhitelist.js';
import { rivalPlayerFullNames, uniqueAloneSurnames, commonAloneSurnames, antiMadridChants } from './blocklists/realMadrid.js';
import { ALL_CONTEXTS } from './contexts/index.js';

const LANGS = [
  ['es', 'Español',    spanishProfanity,    spanishJokeNames,    spanishExactOnly],
  ['en', 'Inglés',     englishProfanity,    englishJokeNames,    englishExactOnly],
  ['fr', 'Francés',    frenchProfanity,     frenchJokeNames,     frenchExactOnly],
  ['pt', 'Portugués',  portugueseProfanity, portugueseJokeNames, portugueseExactOnly],
  ['de', 'Alemán',     germanProfanity,     germanJokeNames,     germanExactOnly],
  ['it', 'Italiano',   italianProfanity,    italianJokeNames,    italianExactOnly],
  ['nl', 'Holandés',   dutchProfanity,      dutchJokeNames,      dutchExactOnly],
  ['hu', 'Húngaro',    hungarianProfanity,  hungarianJokeNames,  hungarianExactOnly],
  ['cs', 'Checo',      czechProfanity,      czechJokeNames,      czechExactOnly],
  ['ru', 'Ruso',       russianProfanity,    russianJokeNames,    russianExactOnly],
  ['pl', 'Polaco',     polishProfanity,     polishJokeNames,     polishExactOnly],
  ['ar', 'Árabe',      arabicProfanity,     arabicJokeNames,     arabicExactOnly],
  ['el', 'Griego',     greekProfanity,      greekJokeNames,      greekExactOnly],
  ['tr', 'Turco',      turkishProfanity,    turkishJokeNames,    turkishExactOnly],
  ['ro', 'Rumano',     romanianProfanity,   romanianJokeNames,   romanianExactOnly],
  ['zh', 'Chino',      chineseProfanity,    chineseJokeNames,    chineseExactOnly],
  ['ja', 'Japonés',    japaneseProfanity,   japaneseJokeNames,   japaneseExactOnly],
  ['ko', 'Coreano',    koreanProfanity,     koreanJokeNames,     koreanExactOnly],
  ['he', 'Hebreo',     hebrewProfanity,     hebrewJokeNames,     hebrewExactOnly],
];

function sizeOf(x) {
  if (Array.isArray(x)) return x.length;
  if (x instanceof Set) return x.size;
  return 0;
}

export function getCoverage() {
  const languages = LANGS.map(([code, name, prof, joke, exact]) => ({
    code,
    name,
    profanity: sizeOf(prof),
    jokeNames: sizeOf(joke),
    exactOnly: sizeOf(exact),
    total: sizeOf(prof) + sizeOf(joke) + sizeOf(exact),
  })).sort((a, b) => b.total - a.total);

  const totals = languages.reduce(
    (acc, l) => ({
      profanity: acc.profanity + l.profanity,
      jokeNames: acc.jokeNames + l.jokeNames,
      exactOnly: acc.exactOnly + l.exactOnly,
      total: acc.total + l.total,
    }),
    { profanity: 0, jokeNames: 0, exactOnly: 0, total: 0 },
  );

  const contexts = Object.entries(ALL_CONTEXTS).map(([id, ctx]) => ({
    id,
    label: ctx.displayName ?? ctx.label ?? id,
  }));

  return {
    languages,
    totals,
    historicalFigures: sizeOf(historicalFigures),
    scunthorpeWhitelist: sizeOf(scunthorpeWhitelist),
    realMadrid: {
      rivalPlayers: sizeOf(rivalPlayerFullNames),
      rivalSurnamesUnique: sizeOf(uniqueAloneSurnames),
      rivalSurnamesCommon: sizeOf(commonAloneSurnames),
      antiMadridChants: sizeOf(antiMadridChants),
    },
    contexts,
    layers: ['format', 'leet', 'estática (subcadenas)', 'fonética', 'IA opcional'],
  };
}
