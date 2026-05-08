/// Smoke test del fast-path local Dart (static_check.dart).
///
/// Sólo cubre los casos críticos: el JS tiene ~80 tests, el Dart aún no
/// porta toda esa lógica — sólo lo suficiente para REJECTED obvios offline.

import 'package:flutter_test/flutter_test.dart';
import 'package:halo_validator/core/validator/static_check.dart';

void main() {
  group('localStaticCheck — fast-path local', () {
    test('nombre limpio devuelve ALLOWED + needsAi', () {
      final r = localStaticCheck('Carlos García López');
      expect(r.verdict, equals('ALLOWED'));
      expect(r.needsAi, isTrue,
          reason: 'el caso ALLOWED siempre debe pasar al Worker');
    });

    test('formato inválido devuelve REJECTED + !needsAi', () {
      final r = localStaticCheck('Pedro 123');
      expect(r.verdict, equals('REJECTED'));
      expect(r.needsAi, isFalse,
          reason: 'rechazos por formato son evidentes — saltar el Worker');
    });

    test('palabra ofensiva ES (substring) → REJECTED offline', () {
      final r = localStaticCheck('Juan Putamadre');
      expect(r.verdict, equals('REJECTED'));
      expect(r.needsAi, isFalse);
    });

    test('palabra ofensiva EN → REJECTED offline', () {
      final r = localStaticCheck('John Fucking Smith');
      expect(r.verdict, equals('REJECTED'));
      expect(r.needsAi, isFalse);
    });

    test('joke name "Hugh Jass" detectado', () {
      final r = localStaticCheck('Hugh Jass');
      expect(r.verdict, equals('REJECTED'));
    });

    test('caso AMBIGUO no decide — necesita IA', () {
      // "Adolf" solo no es REJECTED automático sin contexto
      final r = localStaticCheck('Adolf Schmidt');
      // El fast-path local NO debe decidir esto — pasa a Worker
      expect(r.needsAi, isTrue);
    });

    test('vacío devuelve REJECTED', () {
      final r = localStaticCheck('');
      expect(r.verdict, equals('REJECTED'));
      expect(r.needsAi, isFalse);
    });
  });
}
