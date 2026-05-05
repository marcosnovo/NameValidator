// Normalización del input. Devuelve múltiples vistas del mismo string para
// que las capas posteriores puedan buscar en cada una.

const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '€': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
  '8': 'b',
  '9': 'g',
  '6': 'g',
  '2': 'z',
};

// ── Unicode Confusables / homoglyphs (vector de evasión clásico) ──────────
// Mapeo de caracteres cirílicos, griegos y otros que VISUALMENTE parecen
// letras latinas pero son code points distintos. Sin esta defensa, alguien
// podría escribir "Аitor Тilla" (con А cirílica + Т cirílica) y nuestra
// blocklist no matchearía.
//
// Cobertura crítica (basada en Unicode Standard "confusables.txt" filtrado
// a los confusables más usados como evasión):
//   - Cirílico minúsculas y mayúsculas
//   - Griego minúsculas y mayúsculas
//   - Mathematical Alphanumeric Symbols (𝐀-𝐳, 𝑨-𝒛, 𝓐-𝔃, 𝕬-𝖟…)
//   - Fullwidth Forms (Ａ-Ｚ, ａ-ｚ — U+FF21-U+FF3A, U+FF41-U+FF5A)
//   - Otros símbolos visualmente equivalentes
const CONFUSABLE_MAP = {
  // ── Cirílico minúsculas
  'а': 'a', 'в': 'v', 'с': 'c', 'е': 'e', 'ѕ': 's', 'і': 'i', 'ј': 'j',
  'к': 'k', 'м': 'm', 'н': 'n', 'о': 'o', 'р': 'p', 'т': 't', 'у': 'y',
  'х': 'x', 'ѵ': 'v', 'ԝ': 'w', 'ʏ': 'y',
  'и': 'i',           // и phonéticamente /i/, usado en ataques tipo "Виniciυs"
  'й': 'y',           // й = sound /y/
  'г': 'g', 'д': 'd', 'ж': 'zh',
  'з': 'z', 'л': 'l', 'н': 'n', 'п': 'p',
  'ф': 'f', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
  'щ': 'sch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ё': 'e',
  // ── Cirílico mayúsculas
  'А': 'A', 'В': 'V', 'С': 'C', 'Е': 'E', 'Ѕ': 'S', 'І': 'I', 'Ј': 'J',
  'К': 'K', 'М': 'M', 'Н': 'N', 'О': 'O', 'Р': 'P', 'Т': 'T', 'У': 'Y',
  'Х': 'X', 'Ѵ': 'V', 'Ԝ': 'W',
  'И': 'I', 'Й': 'Y', 'Г': 'G', 'Д': 'D',
  'З': 'Z', 'Л': 'L', 'П': 'P', 'Ф': 'F',
  'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH',
  'Ы': 'Y', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA', 'Ё': 'E',
  'Ж': 'ZH',
  // ── Griego minúsculas
  'α': 'a', 'β': 'b', 'ε': 'e', 'ι': 'i', 'κ': 'k', 'ν': 'v', 'ο': 'o',
  'ρ': 'p', 'τ': 't', 'υ': 'u', 'χ': 'x', 'ω': 'w',
  // ── Griego mayúsculas
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I', 'Κ': 'K',
  'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T', 'Υ': 'Y', 'Χ': 'X',
  // ── Otros confusables comunes (símbolos)
  '＿': '_', '·': '.', '・': '.',
  '𝟬': '0', '𝟱': '5', '𝟴': '8',
  // ── Latin Extended caracteres que parecen latinos pero no se normalizan
  //    bien con NFD
  'ɑ': 'a', 'ɡ': 'g', 'ɪ': 'i', 'ɴ': 'n', 'ѕ': 's',
};

// Reemplaza confusables por su equivalente ASCII canónico.
//
// La estrategia es de dos pasos:
//   1) Unicode NFKC (Compatibility Composition) — handler automático para
//      fullwidth (Ｖ→V), Mathematical Alphanumeric (𝐕,𝓥,𝕍,𝖁→V), ligaduras
//      (ﬁ→fi), formas tipográficas y de compatibilidad. Estándar Unicode.
//   2) CONFUSABLE_MAP explícito — para el cirílico/griego, que NFKC NO
//      transforma porque son scripts distintos (no compatibility forms).
//
// También elimina marcas combinantes (Zalgo: V̴̢̛̫̲̥̅) usando \p{M}.
function unconfuse(s) {
  if (!s) return '';
  // Paso 1: NFKC normaliza fullwidth + math alphanumeric + ligaduras.
  s = s.normalize('NFKC');
  // Paso 2: quitamos cualquier marca combinante remanente (Zalgo defense).
  s = s.replace(/\p{M}+/gu, '');
  // Paso 3: aplicamos mapeo explícito de cirílico/griego/símbolos.
  let out = '';
  for (const ch of s) {
    out += CONFUSABLE_MAP[ch] ?? ch;
  }
  return out;
}

// Quita diacríticos: á→a, é→e, ñ→n, ç→c, ü→u, ø→o…
function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Sustituye caracteres tipo leet por sus letras.
function deLeet(s) {
  let out = '';
  for (const ch of s) out += LEET_MAP[ch] ?? ch;
  return out;
}

// Quita todo lo que no sea letra (incluye dígitos y puntuación).
function lettersOnly(s) {
  return s.replace(/[^a-z]/g, '');
}

// Colapsa espacios y trim.
function collapseSpaces(s) {
  return s.replace(/\s+/g, ' ').trim();
}

// Quita repeticiones excesivas (aaaaaa → aa) para detectar elongaciones.
function dedupeRuns(s) {
  return s.replace(/(.)\1{2,}/g, '$1$1');
}

// ──── Normalizaciones fonéticas por idioma ────────────────────────────────
// Cada función toma un string ya en minúsculas, sin acentos y sin leet, y
// devuelve la "forma canónica fonética" para ese idioma. La capa estática
// busca en paralelo en la forma directa Y en la forma fonética, así
// "devora melo" matchea "deboramelo", "Carlos Gil Hipoyas" matchea
// "gilipollas", "Warra" matchea "guarra", etc.

// Castellano de España. Equivalencias:
//   - v ↔ b (homófonos)
//   - h muda (excepto en "ch")
//   - ll ↔ y (yeísmo)
//   - z, c+(e|i) → s (seseo — útil para variantes LatAm)
//   - ñ → n
//   - qu+(e|i) → k, y q → k
//   - w → gu (slang: "wapo"="guapo", "warra"="guarra")
function phoneticEs(s) {
  if (!s) return '';
  return s
    .replace(/ll/g, 'y')                  // 1. ll → y
    .replace(/ch/g, '\x01')               // 2. proteger "ch" temporalmente
    .replace(/h/g, '')                    // 3. quitar h muda
    .replace(/\x01/g, 'ch')               // 4. restaurar "ch"
    .replace(/v/g, 'b')                   // 5. v → b
    .replace(/c(?=[ei])/g, 's')           // 6. ce/ci → se/si
    .replace(/z/g, 's')                   //    z → s
    .replace(/ñ/g, 'n')                   // 7. ñ → n
    .replace(/qu(?=[ei])/g, 'k')          // 8. qu+e/i → k+e/i
    .replace(/q/g, 'k')                   //    resto de q → k
    .replace(/w/g, 'gu');                 // 9. w → gu (slang castellano)
}

// Inglés. Más conservador — sólo sonidos donde la ortografía oculta:
//   - ph → f ("Phil" sonaría como "Fil")
//   - ck → k
//   - kn al inicio → n ("knight" sonaría como "night")
//   - silent gh ("though" → "tho")
//   - dobles consonantes colapsadas (ll, mm, nn, pp, ss, tt, cc, ff, gg, dd
//     a una sola). Defiende contra typing variations: McCavity vs Mecavity.
function phoneticEn(s) {
  if (!s) return '';
  return s
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/^kn/g, 'n')
    .replace(/gh(?=t|$)/g, '')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Francés. Las consonantes finales mudas son demasiado variables para una
// regla simple, así que cubrimos lo más útil:
//   - qu → k ("Jacques" sonaría como "zhak"…)
//   - ç → s
//   - x → ks (en pocos casos)
//   - ph → f
function phoneticFr(s) {
  if (!s) return '';
  return s
    .replace(/qu/g, 'k')
    .replace(/ç/g, 's')
    .replace(/ph/g, 'f');
}

// Portugués (BR + EU). Equivalencias:
//   - h muda (igual que en castellano, en PT la h es prácticamente muda)
//   - nh → n (sonido similar a ñ — "Sonho" → "Sono")
//   - lh → l (palatalizada — "Filho" → "Filo")
//   - ç → s
//   - ã, õ ya se han eliminado por stripDiacritics → a, o
//   - x suele sonar como "ch" pero la regla es muy variable — la dejamos
//   - ss → s (sonido único)
function phoneticPt(s) {
  if (!s) return '';
  return s
    .replace(/nh/g, 'n')
    .replace(/lh/g, 'l')
    .replace(/ch/g, '\x01')
    .replace(/h/g, '')
    .replace(/\x01/g, 'ch')
    .replace(/ç/g, 's')
    .replace(/ss/g, 's');
}

// Alemán. Equivalencias clave para evasión de blocklists:
//   - ß → ss ("Scheiße" → "Scheisse" → ya en blocklist)
//   - ä → ae, ö → oe, ü → ue (ya estará sin diacríticos en concatNoSpaces;
//     pero algunos usuarios los teclean directos como "ae" — colapsamos
//     "ae"→"a", "oe"→"o", "ue"→"u" para neutralizar variantes)
//   - sch → sh (suena igual)
//   - tsch → ch
//   - tz → z (compresión común)
//   - dt$ → t (mute final)
//   - eh, ah, oh con vocal muda → vocal sola
function phoneticDe(s) {
  if (!s) return '';
  return s
    .replace(/ß/g, 'ss')
    .replace(/sch/g, 'sh')
    .replace(/tsch/g, 'ch')
    .replace(/tz/g, 'z')
    .replace(/(?<=[aeiou])h(?=[aeiou])/g, '')   // h intervocálica muda
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u');
}

// Ruso transliterado. Pillamos variantes de transliteración comunes:
//   - kh ↔ h ↔ x ("Khrushchev" / "Hrushchev" / "Xrushchev")
//   - ch ↔ tch ("Tchaikovsky" / "Chaikovsky")
//   - y/i confusión final (común en transliteraciones)
//   - sh, zh sonidos específicos del cirílico
//   - dobles colapsadas
function phoneticRu(s) {
  if (!s) return '';
  return s
    .replace(/kh/g, 'h')
    .replace(/x/g, 'h')          // Xrushchev → Hrushchev
    .replace(/tch/g, 'ch')
    .replace(/sch/g, 'sh')
    .replace(/zh/g, 'j')
    .replace(/yj$/g, 'i')        // -yj final → -i
    .replace(/yi$/g, 'i')
    .replace(/iy$/g, 'i')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Polaco. Equivalencias clave:
//   - cz → ch (suena como inglés "ch")
//   - sz → sh
//   - rz → zh ("Rzeszów" suena con zh)
//   - dz → z (palatalización suave)
//   - ł ya está convertida a l por stripDiacritics
//   - ą → on, ę → en (no cubrimos exhaustivo, ya pasa por NFD)
function phoneticPl(s) {
  if (!s) return '';
  return s
    .replace(/cz/g, 'ch')
    .replace(/sz/g, 'sh')
    .replace(/rz/g, 'zh')
    .replace(/dz/g, 'z')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Árabe transliterado. Pillamos variantes muy comunes en "Arabizi":
//   - 3 → a (sustitución típica de la letra ع ain)
//   - 7 → h (sustitución típica de la letra ح)
//   - 9 → q (sustitución típica de la letra ق)
//   - kh ↔ x ↔ k ("Khaled" / "Xaled" / "Kaled")
//   - aa/ee/oo dobladas → vocal simple
//   - dobles colapsadas
function phoneticAr(s) {
  if (!s) return '';
  return s
    .replace(/3/g, 'a')        // 3in → a
    .replace(/7/g, 'h')        // ha
    .replace(/9/g, 'q')        // qaf
    .replace(/kh/g, 'h')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e')
    .replace(/oo/g, 'u')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Italiano. Equivalencias clave:
//   - gli → li (sonido palatal — "figlio" → "filio")
//   - gn → ñ→n ("gnocchi" → "nocchi" → "nochi")
//   - gh+(e|i) → g (ahueca la i muda)
//   - ch+(e|i) → k (ahueca la i muda)
//   - sci/sce → shi/she (sibilante)
//   - cc, gg, dobles → simples (haarmann tipo)
//   - z al inicio → ts (sonido sordo)
//   - quattro → kuattro
function phoneticIt(s) {
  if (!s) return '';
  return s
    .replace(/gli/g, 'li')
    .replace(/gn/g, 'n')
    .replace(/gh(?=[ei])/g, 'g')
    .replace(/ch(?=[ei])/g, 'k')
    .replace(/sci/g, 'shi')
    .replace(/sce/g, 'she')
    .replace(/qu/g, 'k')
    .replace(/([bcdfgklmnprstvz])\1/g, '$1');
}

// Genera todas las particiones por espacio y devuelve las re-segmentaciones
// posibles deslizando el corte. Útil para que el motor de concat no dependa
// de los espacios elegidos por el usuario.
//
// Ej: "AitorTilla" o "Aitor Tilla" o "A I Tortilla" colapsan al mismo
// `concatNoSpaces` ⇒ aitortilla.
function buildVariants(raw) {
  if (typeof raw !== 'string') raw = String(raw ?? '');

  // ORDEN crítico:
  //   1. unconfuse — antes de lowercase, porque CONFUSABLE_MAP tiene mayús/min
  //   2. collapseSpaces — sin esto los joins fallan
  //   3. lowercase
  //   4. stripDiacritics — NFD también limpia combining marks (Zalgo)
  //   5. deLeet — leet siempre sobre minúsculas
  //   6. lettersOnly — concat para sliding-window match
  const unconfused = unconfuse(raw);
  const trimmed = collapseSpaces(unconfused);
  const lower = trimmed.toLowerCase();
  const noDiacritics = stripDiacritics(lower);
  const deLeeted = deLeet(noDiacritics);
  const concatNoSpaces = lettersOnly(deLeeted);
  const dedupedConcat = dedupeRuns(concatNoSpaces);
  const reversedConcat = concatNoSpaces.split('').reverse().join('');
  const phoneticEsView = phoneticEs(concatNoSpaces);
  const phoneticEnView = phoneticEn(concatNoSpaces);
  const phoneticFrView = phoneticFr(concatNoSpaces);
  const phoneticPtView = phoneticPt(concatNoSpaces);
  const phoneticDeView = phoneticDe(concatNoSpaces);
  const phoneticItView = phoneticIt(concatNoSpaces);
  const phoneticRuView = phoneticRu(concatNoSpaces);
  const phoneticPlView = phoneticPl(concatNoSpaces);
  const phoneticArView = phoneticAr(concatNoSpaces);

  // Versión "tokenizada": separa por espacio y filtra vacíos.
  const tokens = deLeeted.split(' ').map(lettersOnly).filter(Boolean);

  return {
    raw,                  // tal cual lo escribió el usuario
    trimmed,              // sin espacios redundantes
    lower,                // minúsculas
    noDiacritics,         // sin acentos
    deLeeted,             // sin sustituciones leet
    concatNoSpaces,       // todo junto, sólo letras  ←  ★ la vista clave
    dedupedConcat,        // con runs colapsados
    reversedConcat,       // al revés
    phoneticEs: phoneticEsView, // ★ b↔v, h muda, ll→y, w→gu, seseo
    phoneticEn: phoneticEnView, //   ph→f, ck→k
    phoneticFr: phoneticFrView, //   qu→k, ç→s, ph→f
    phoneticPt: phoneticPtView, //   nh→n, lh→l, h muda, ç→s
    phoneticDe: phoneticDeView, //   ß→ss, sch→sh, ae/oe/ue colapsadas
    phoneticIt: phoneticItView, //   gli→li, gn→n, sci→shi, dobles→simples
    phoneticRu: phoneticRuView, //   kh→h→x, tch→ch, sh, zh→j
    phoneticPl: phoneticPlView, //   cz→ch, sz→sh, rz→zh, dz→z
    phoneticAr: phoneticArView, //   3→a, 7→h, 9→q (Arabizi)
    tokens,               // ['aitor', 'tilla']
  };
}

export {
  buildVariants,
  stripDiacritics,
  deLeet,
  lettersOnly,
  unconfuse,
  phoneticEs,
  phoneticEn,
  phoneticFr,
  phoneticPt,
  phoneticDe,
  phoneticIt,
  phoneticRu,
  phoneticPl,
  phoneticAr,
};
