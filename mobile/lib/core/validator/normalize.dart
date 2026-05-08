/// ────────────────────────────────────────────────────────────────────────
///  Port a Dart de src/normalize.js — pipeline de normalización del input.
/// ────────────────────────────────────────────────────────────────────────
///
/// Genera todas las "vistas" del input que el matcher de profanidad usa:
///   ▸ trimmed         — sin espacios redundantes
///   ▸ lower           — minúsculas
///   ▸ noDiacritics    — sin acentos (NFD strip combining marks)
///   ▸ deLeeted        — leet speak deshecho (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, @→a)
///   ▸ concatNoSpaces  — todo junto, sólo letras  ★ vista clave
///   ▸ dedupedConcat   — runs colapsados (aaaaa → a)
///   ▸ reversedConcat  — al revés (para detectar "atup" ↔ "puta")
///   ▸ phoneticEs/En/Fr/Pt/De/It — transformaciones fonéticas por idioma
///   ▸ tokens          — split por espacios
///
/// Misma lógica que el JS — útil cuando el modelo ML on-device esté listo
/// y necesite alimentarse con las mismas vistas que usaba el static layer.
///
/// AVISO: este port cubre 6 idiomas (ES/EN/FR/PT/DE/IT). Los otros 13 del
/// JS (RU/PL/AR/EL/TR/RO/ZH/JA/KO/HE/HU/NL/CS) los añade el Worker en
/// remoto. Cuando se entrenen los modelos ML on-device locales, ampliar
/// aquí.

class Variants {
  final String raw;
  final String trimmed;
  final String lower;
  final String noDiacritics;
  final String deLeeted;
  final String concatNoSpaces;
  final String dedupedConcat;
  final String reversedConcat;
  final String phoneticEs;
  final String phoneticEn;
  final String phoneticFr;
  final String phoneticPt;
  final String phoneticDe;
  final String phoneticIt;
  final List<String> tokens;

  const Variants({
    required this.raw,
    required this.trimmed,
    required this.lower,
    required this.noDiacritics,
    required this.deLeeted,
    required this.concatNoSpaces,
    required this.dedupedConcat,
    required this.reversedConcat,
    required this.phoneticEs,
    required this.phoneticEn,
    required this.phoneticFr,
    required this.phoneticPt,
    required this.phoneticDe,
    required this.phoneticIt,
    required this.tokens,
  });
}

// ─── Constantes ─────────────────────────────────────────────────────────

/// Mapa de Confusables Unicode → ASCII más comunes. Cubrimos cyrillic
/// y greek que parecen letras latinas. Mismo subset que el JS (no
/// exhaustivo — sólo lo común en ataques de "homograph spoofing").
const _confusableMap = {
  // Cyrillic → Latin
  'а': 'a', 'А': 'A',
  'е': 'e', 'Е': 'E',
  'о': 'o', 'О': 'O',
  'р': 'p', 'Р': 'P',
  'с': 'c', 'С': 'C',
  'у': 'y', 'У': 'Y',
  'х': 'x', 'Х': 'X',
  'к': 'k', 'К': 'K',
  'м': 'M', 'М': 'M',
  'н': 'H', 'Н': 'H',
  'т': 't', 'Т': 'T',
  'в': 'B', 'В': 'B',
  // Greek → Latin (subset)
  'α': 'a', 'Α': 'A',
  'ε': 'e', 'Ε': 'E',
  'ο': 'o', 'Ο': 'O',
  'ρ': 'p', 'Ρ': 'P',
  'υ': 'y', 'Υ': 'Y',
  'τ': 't', 'Τ': 'T',
  'κ': 'k', 'Κ': 'K',
  'ν': 'v', 'Ν': 'N',
};

const _leetMap = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '\$': 's',
  '@': 'a',
  '!': 'i',
  '|': 'i',
};

// ─── Helpers ────────────────────────────────────────────────────────────

String _unconfuse(String s) {
  final buf = StringBuffer();
  for (final r in s.runes) {
    final ch = String.fromCharCode(r);
    buf.write(_confusableMap[ch] ?? ch);
  }
  return buf.toString();
}

String _collapseSpaces(String s) =>
    s.replaceAll(RegExp(r'\s+'), ' ').trim();

String _stripDiacritics(String s) {
  // NFD descompone. Luego quitamos las combining marks (Mn).
  final nfd = _nfdDecompose(s);
  return nfd.replaceAll(RegExp(r'[̀-ͯ]'), '');
}

/// NFD decomposition manual via Dart's runes — Dart no expone Unicode NFD
/// nativamente sin paquete, pero podemos cubrir el 99% via map de
/// caracteres comunes. Para una solución robusta importar `string_normalize`
/// como dep — por ahora suficiente para el caso de uso.
String _nfdDecompose(String s) {
  // Dart 3.x: String.normalize no existe en core. Usamos sustitución
  // manual de los acentos más comunes en idiomas latinos.
  const map = {
    'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
    'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
    'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
    'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
    'ñ': 'n',
    'ç': 'c',
    'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'Ã': 'A', 'Å': 'A',
    'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
    'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
    'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Õ': 'O',
    'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
    'Ñ': 'N', 'Ç': 'C',
    // Adicionales europeos
    'ć': 'c', 'č': 'c', 'ď': 'd', 'ě': 'e', 'ł': 'l', 'ń': 'n',
    'ř': 'r', 'š': 's', 'ť': 't', 'ý': 'y', 'ž': 'z', 'ź': 'z', 'ż': 'z',
    'ş': 's', 'ı': 'i', 'ğ': 'g', 'ő': 'o', 'ű': 'u',
    'ă': 'a', 'î': 'i', 'â': 'a', 'ș': 's', 'ț': 't',
  };
  final buf = StringBuffer();
  for (final r in s.runes) {
    final ch = String.fromCharCode(r);
    buf.write(map[ch] ?? ch);
  }
  return buf.toString();
}

String _deLeet(String s) {
  final buf = StringBuffer();
  for (final r in s.runes) {
    final ch = String.fromCharCode(r);
    buf.write(_leetMap[ch] ?? ch);
  }
  return buf.toString();
}

String _lettersOnly(String s) =>
    s.replaceAll(RegExp(r"[^a-z'·\-]"), '');

String _dedupeRuns(String s) {
  if (s.isEmpty) return s;
  final buf = StringBuffer();
  var prev = '';
  for (var i = 0; i < s.length; i++) {
    final c = s[i];
    if (c != prev) buf.write(c);
    prev = c;
  }
  return buf.toString();
}

String _reverseString(String s) {
  return String.fromCharCodes(s.runes.toList().reversed);
}

// ─── Phonetic transforms (port de los del JS) ──────────────────────────

String phoneticEs(String s) {
  if (s.isEmpty) return '';
  return s
      .replaceAll('ll', 'y')
      .replaceAll('ch', '\x01')
      .replaceAll('h', '')
      .replaceAll('\x01', 'ch')
      .replaceAll('v', 'b')
      .replaceAllMapped(RegExp(r'c(?=[ei])'), (m) => 's')
      .replaceAll('z', 's')
      .replaceAll('ñ', 'n')
      .replaceAllMapped(RegExp(r'qu(?=[ei])'), (m) => 'k')
      .replaceAll('q', 'k')
      .replaceAll('w', 'gu');
}

String phoneticEn(String s) {
  if (s.isEmpty) return '';
  return s
      .replaceAll('ph', 'f')
      .replaceAll('ck', 'k')
      .replaceAllMapped(RegExp(r'^kn'), (m) => 'n')
      .replaceAllMapped(RegExp(r'gh(?=t|$)'), (m) => '')
      .replaceAllMapped(
          RegExp(r'([bcdfgklmnprstvz])\1'), (m) => m.group(1)!);
}

String phoneticFr(String s) {
  if (s.isEmpty) return '';
  return s.replaceAll('qu', 'k').replaceAll('ç', 's').replaceAll('ph', 'f');
}

String phoneticPt(String s) {
  if (s.isEmpty) return '';
  return s
      .replaceAll('nh', 'n')
      .replaceAll('lh', 'l')
      .replaceAll('ch', '\x01')
      .replaceAll('h', '')
      .replaceAll('\x01', 'ch')
      .replaceAll('ç', 's')
      .replaceAll('ss', 's');
}

String phoneticDe(String s) {
  if (s.isEmpty) return '';
  return s
      .replaceAll('ß', 'ss')
      .replaceAll('sch', 'sh')
      .replaceAll('tsch', 'ch')
      .replaceAll('tz', 'z')
      .replaceAllMapped(RegExp(r'(?<=[aeiou])h(?=[aeiou])'), (m) => '')
      .replaceAll('ae', 'a')
      .replaceAll('oe', 'o')
      .replaceAll('ue', 'u');
}

String phoneticIt(String s) {
  if (s.isEmpty) return '';
  return s
      .replaceAll('gli', 'li')
      .replaceAll('gn', 'n')
      .replaceAllMapped(RegExp(r'gh(?=[ei])'), (m) => 'g')
      .replaceAllMapped(RegExp(r'ch(?=[ei])'), (m) => 'k')
      .replaceAll('sci', 'shi')
      .replaceAll('sce', 'she')
      .replaceAll('qu', 'k')
      .replaceAllMapped(
          RegExp(r'([bcdfgklmnprstvz])\1'), (m) => m.group(1)!);
}

// ─── buildVariants — entry point ───────────────────────────────────────

Variants buildVariants(String raw) {
  final unconfused = _unconfuse(raw);
  final trimmed = _collapseSpaces(unconfused);
  final lower = trimmed.toLowerCase();
  final noDiacritics = _stripDiacritics(lower);
  final deLeeted = _deLeet(noDiacritics);
  final concatNoSpaces = _lettersOnly(deLeeted.replaceAll(' ', ''));
  final dedupedConcat = _dedupeRuns(concatNoSpaces);
  final reversedConcat = _reverseString(concatNoSpaces);

  final tokens = deLeeted
      .split(' ')
      .map(_lettersOnly)
      .where((t) => t.isNotEmpty)
      .toList(growable: false);

  return Variants(
    raw: raw,
    trimmed: trimmed,
    lower: lower,
    noDiacritics: noDiacritics,
    deLeeted: deLeeted,
    concatNoSpaces: concatNoSpaces,
    dedupedConcat: dedupedConcat,
    reversedConcat: reversedConcat,
    phoneticEs: phoneticEs(concatNoSpaces),
    phoneticEn: phoneticEn(concatNoSpaces),
    phoneticFr: phoneticFr(concatNoSpaces),
    phoneticPt: phoneticPt(concatNoSpaces),
    phoneticDe: phoneticDe(concatNoSpaces),
    phoneticIt: phoneticIt(concatNoSpaces),
    tokens: tokens,
  );
}
