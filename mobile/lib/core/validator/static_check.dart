/// ────────────────────────────────────────────────────────────────────────
///  Capa estática local — Dart port simplificado de src/layers/staticCheck.js
/// ────────────────────────────────────────────────────────────────────────
///
/// Detecta los casos OBVIOS sin ir al Worker. Cubre:
///   ▸ Profanidad ES/EN/FR (substring + fonético)
///   ▸ Joke names ES/EN/FR
///   ▸ Format check (longitud, charset)
///
/// NO cubre (delega al Worker):
///   ▸ Otros 16 idiomas (DE, IT, RU, PL, AR, EL, TR, RO, ZH, JA, KO, HE,
///     HU, NL, CS, PT)
///   ▸ Real Madrid context (rivalPlayerFullNames, antiMadridChants)
///   ▸ Historical figures (~260)
///   ▸ Scunthorpe whitelist completa
///   ▸ AI semántica (Claude/GPT/Gemini)

import 'normalize.dart';
import 'blocklists.dart';

class LocalIssue {
  final String layer;
  final String? lang;
  final String category;
  final String? match;
  final String severity;
  final String? message;
  const LocalIssue({
    required this.layer,
    required this.category,
    required this.severity,
    this.lang,
    this.match,
    this.message,
  });
}

class LocalCheckResult {
  final String verdict; // 'ALLOWED' | 'REVIEW' | 'REJECTED'
  final int doubt;
  final List<LocalIssue> issues;
  final bool needsAi;

  const LocalCheckResult({
    required this.verdict,
    required this.doubt,
    required this.issues,
    required this.needsAi,
  });
}

/// Comprueba si el input contiene alguna profanidad core.
/// Devuelve { verdict, doubt, issues, needsAi } donde needsAi indica
/// si el Worker debe complementar con la capa semántica.
LocalCheckResult localStaticCheck(String input) {
  final issues = <LocalIssue>[];
  final variants = buildVariants(input);

  // ── PASO 1: Format
  if (input.trim().isEmpty) {
    return const LocalCheckResult(
      verdict: 'REJECTED',
      doubt: 100,
      issues: [LocalIssue(layer: 'format', category: 'too-short', severity: 'high')],
      needsAi: false,
    );
  }
  if (input.trim().length > 30) {
    issues.add(const LocalIssue(
      layer: 'format', category: 'too-long', severity: 'high',
      message: 'máx 30 caracteres',
    ));
  }
  if (!RegExp(r"^[\p{L}\p{M} '\-.·]+$", unicode: true).hasMatch(input.trim())) {
    issues.add(const LocalIssue(
      layer: 'format', category: 'invalid-chars', severity: 'medium',
      message: 'sólo letras, espacios, apóstrofes, guiones y puntos',
    ));
  }

  // ── PASO 2: Profanidad ES/EN/FR
  _checkLang(spanishProfanity, spanishExactOnly, 'es', variants, issues, _phoneticView);
  _checkLang(englishProfanity, englishExactOnly, 'en', variants, issues, _phoneticView);
  _checkLang(frenchProfanity, frenchExactOnly, 'fr', variants, issues, _phoneticView);

  // ── PASO 3: Joke names
  _checkJokes(spanishJokeNames, 'es', variants.concatNoSpaces, issues);
  _checkJokes(englishJokeNames, 'en', variants.concatNoSpaces, issues);
  _checkJokes(frenchJokeNames, 'fr', variants.concatNoSpaces, issues);

  // ── Agregación
  final hasHigh = issues.any((i) => i.severity == 'high');
  final hasMedium = issues.any((i) => i.severity == 'medium');

  String verdict;
  int doubt;
  bool needsAi;
  if (hasHigh) {
    verdict = 'REJECTED';
    doubt = 100;
    needsAi = false; // ya bloqueado, no gastamos llamada AI
  } else if (hasMedium) {
    verdict = 'REVIEW';
    doubt = 60;
    needsAi = true; // la AI puede confirmar/refutar
  } else {
    verdict = 'ALLOWED';
    doubt = 0;
    needsAi = true; // la AI puede pillar joke names sutiles que no tenemos en la lista core
  }

  return LocalCheckResult(
    verdict: verdict,
    doubt: doubt,
    issues: issues,
    needsAi: needsAi,
  );
}

String _phoneticView(String lang, Variants v) {
  switch (lang) {
    case 'es': return v.phoneticEs;
    case 'en': return v.phoneticEn;
    case 'fr': return v.phoneticFr;
    case 'pt': return v.phoneticPt;
    case 'de': return v.phoneticDe;
    case 'it': return v.phoneticIt;
    default: return v.concatNoSpaces;
  }
}

void _checkLang(
  List<String> profanity,
  Set<String> exactOnly,
  String lang,
  Variants variants,
  List<LocalIssue> issues,
  String Function(String, Variants) phoneticView,
) {
  // Tokens exactos
  for (final word in exactOnly) {
    if (variants.tokens.any((t) => t == word)) {
      issues.add(LocalIssue(
        layer: 'static',
        lang: lang,
        category: 'profanity',
        match: word,
        severity: 'high',
        message: 'Token "$word" detectado',
      ));
      return;
    }
  }

  // Substring sobre concatNoSpaces y phonetic view
  final phonetic = phoneticView(lang, variants);
  final views = [variants.concatNoSpaces, variants.dedupedConcat, phonetic];
  for (final word in profanity) {
    if (word.length < 3) continue; // demasiado corto, FP
    if (exactOnly.contains(word)) continue; // ya cubierto arriba
    for (final view in views) {
      if (view.contains(word)) {
        issues.add(LocalIssue(
          layer: 'static',
          lang: lang,
          category: 'profanity',
          match: word,
          severity: 'high',
          message: 'Subcadena prohibida "$word" en "$view"',
        ));
        return; // un issue por idioma
      }
    }
  }
}

void _checkJokes(
  List<List<String>> jokes,
  String lang,
  String concat,
  List<LocalIssue> issues,
) {
  for (final joke in jokes) {
    final form = joke[0];
    final why = joke[1];
    if (concat.contains(form)) {
      issues.add(LocalIssue(
        layer: 'static',
        lang: lang,
        category: 'joke-name',
        match: form,
        severity: 'high',
        message: 'Joke name detectado: $why',
      ));
      return;
    }
  }
}
