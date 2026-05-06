/// Smoke test del format check (mismo contrato que src/validator.js JS).

import 'package:flutter_test/flutter_test.dart';
import 'package:halo_validator/core/validator/format_check.dart';

void main() {
  group('formatCheck', () {
    test('nombre limpio común pasa sin issues', () {
      final r = formatCheck('Carlos García López');
      expect(r.isValid, isTrue);
      expect(r.hasBlockingIssue, isFalse);
    });

    test('vacío genera too-short', () {
      final r = formatCheck('');
      expect(r.hasBlockingIssue, isTrue);
      expect(r.issues.first.code, equals('too-short'));
    });

    test('null genera not-string', () {
      final r = formatCheck(null);
      expect(r.hasBlockingIssue, isTrue);
      expect(r.issues.first.code, equals('not-string'));
    });

    test('nombre con dígitos no es válido', () {
      final r = formatCheck('Pedro 123');
      expect(r.isValid, isFalse);
      expect(r.issues.any((i) => i.code == 'invalid-chars'), isTrue);
    });

    test('demasiado largo (>30 chars)', () {
      final r = formatCheck('a' * 50);
      expect(r.hasBlockingIssue, isTrue);
      expect(r.issues.any((i) => i.code == 'too-long'), isTrue);
    });

    test('letras Unicode + acentos legítimos pasan', () {
      final r = formatCheck('Ángela María Núñez');
      expect(r.isValid, isTrue);
    });

    test('apóstrofe legítimo (D\'Angelo) pasa', () {
      final r = formatCheck("Carlos D'Angelo");
      expect(r.isValid, isTrue);
    });

    test('guión en apellido compuesto pasa', () {
      final r = formatCheck('María García-Pérez');
      expect(r.isValid, isTrue);
    });
  });
}
