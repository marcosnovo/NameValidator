/// ────────────────────────────────────────────────────────────────────────
///  Format check (port de src/validator.js — sólo la parte de formato).
/// ────────────────────────────────────────────────────────────────────────
///
/// Misma semántica que el JS:
///   - longitud entre 1 y 30 caracteres
///   - sólo letras Unicode, espacios, apóstrofe, guión, punto, ·
///
/// El resto del pipeline (blocklists, contextos, IA) lo hace el Worker
/// mientras no tengamos el port completo. Ver `lib/core/network/api_client.dart`.

class FormatIssue {
  final String code;
  final String severity; // 'high' | 'medium' | 'low'
  final String? detail;

  const FormatIssue({required this.code, required this.severity, this.detail});

  @override
  String toString() =>
      'FormatIssue($code, $severity${detail != null ? ', "$detail"' : ''})';
}

class FormatCheckResult {
  final List<FormatIssue> issues;
  bool get hasBlockingIssue =>
      issues.any((i) => i.severity == 'high');
  bool get isValid => issues.isEmpty;

  const FormatCheckResult(this.issues);
}

const int _minLength = 1;
const int _maxLength = 30;
final RegExp _allowedChars = RegExp(
  r"^[\p{L}\p{M} '\-.·]+$",
  unicode: true,
);

FormatCheckResult formatCheck(String? raw) {
  final issues = <FormatIssue>[];
  if (raw == null) {
    return FormatCheckResult([
      const FormatIssue(code: 'not-string', severity: 'high'),
    ]);
  }
  final trimmed = raw.trim();
  if (trimmed.length < _minLength) {
    issues.add(const FormatIssue(code: 'too-short', severity: 'high'));
  }
  if (trimmed.length > _maxLength) {
    issues.add(FormatIssue(
      code: 'too-long',
      severity: 'high',
      detail: 'máx $_maxLength caracteres',
    ));
  }
  if (trimmed.isNotEmpty && !_allowedChars.hasMatch(trimmed)) {
    issues.add(const FormatIssue(
      code: 'invalid-chars',
      severity: 'medium',
      detail: 'sólo letras, espacios, apóstrofes, guiones y puntos',
    ));
  }
  return FormatCheckResult(issues);
}
