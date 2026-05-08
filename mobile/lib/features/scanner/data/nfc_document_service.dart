/// ────────────────────────────────────────────────────────────────────────
///  NfcDocumentService — scaffold para lectura del chip ICAO 9303 (DNI 3.0)
/// ────────────────────────────────────────────────────────────────────────
///
/// IMPORTANTE — qué hace este servicio HOY vs el objetivo final:
///
/// HOY (este scaffold, listo para usar):
///   ▸ Detecta presencia de tag NFC ISO 14443 (que es el chip del DNI 3.0
///     y de pasaportes biométricos modernos)
///   ▸ Devuelve los identificadores básicos del tag (ATR, UID)
///   ▸ Maneja el ciclo de vida de la sesión NFC (start, stop, error)
///
/// OBJETIVO FINAL (próxima PR):
///   ▸ Implementar el protocolo PACE/BAC del ICAO 9303 para autenticarse
///     contra el chip.
///   ▸ Leer los Data Groups (DG1: MRZ, DG2: foto, DG11: datos personales)
///   ▸ Verificar la firma criptográfica para garantizar autenticidad
///
/// Por qué NO se hace todo aquí ahora mismo:
///   ▸ PACE/BAC requiere ~2.000 líneas de criptografía low-level
///     (Triple-DES, ECDH, AES-CMAC). En vez de reimplementar, hay que
///     integrar via platform channels libs nativas existentes:
///       Android: org.jmrtd:jmrtd (Java)  https://jmrtd.org
///       iOS:     OpenPACE / NFCPassportReader (Swift)
///                https://github.com/AndyQ/NFCPassportReader
///   ▸ Cada plataforma tiene su flow específico de seguridad
///     (entitlements iOS para CoreNFC tag reading, etc.)
///   ▸ Sin device físico de test no se puede iterar en el sandbox
///
/// Por qué AÚN así vale la pena tener el scaffold ahora:
///   ▸ Captura el punto de integración exacto donde luego se enchufan
///     las libs nativas
///   ▸ Permite avanzar con la UI y el flow del operario sin esperar
///   ▸ Documenta las referencias técnicas para quien continúe

import 'dart:async';

import 'package:nfc_manager/nfc_manager.dart';

class NfcReadResult {
  /// True si se detectó un tag NFC compatible
  final bool tagDetected;

  /// True si se autenticó contra el chip y se leyeron datos (DG1+).
  /// Hoy SIEMPRE false — pendiente de implementar PACE/BAC.
  final bool authenticated;

  /// Identificadores básicos del tag (UID hex, ATR, tech list).
  final Map<String, dynamic> tagInfo;

  /// Datos extraídos del chip (cuando authenticated == true).
  /// Hoy NULL.
  final NfcDocumentData? data;

  /// Error legible si la sesión falló.
  final String? error;

  const NfcReadResult({
    required this.tagDetected,
    required this.authenticated,
    required this.tagInfo,
    this.data,
    this.error,
  });
}

class NfcDocumentData {
  /// Nombre completo extraído del DG1 (zona MRZ del chip).
  final String? fullName;
  final String? givenNames;
  final String? surnames;
  final String? documentNumber;
  final String? nationality;       // ISO 3166-1 alpha-3
  final String? birthDate;          // ISO 8601
  final String? expiryDate;         // ISO 8601
  final String? sex;                // 'M' | 'F'
  final bool? signatureValid;       // verificación criptográfica

  const NfcDocumentData({
    this.fullName,
    this.givenNames,
    this.surnames,
    this.documentNumber,
    this.nationality,
    this.birthDate,
    this.expiryDate,
    this.sex,
    this.signatureValid,
  });
}

class NfcDocumentService {
  bool _disposed = false;
  bool _sessionActive = false;

  /// ¿El dispositivo soporta NFC + el sistema lo tiene activado?
  Future<bool> isAvailable() async {
    if (_disposed) return false;
    return await NfcManager.instance.isAvailable();
  }

  /// Empieza una sesión NFC y resuelve cuando se detecta un tag (o timeout).
  ///
  /// El usuario debe acercar la parte trasera del móvil al chip del
  /// documento (los pasaportes tienen el chip en la portada interior;
  /// los DNI 3.0 españoles tienen el chip impreso al dorso).
  ///
  /// timeoutMs: tiempo máximo de escucha. Por defecto 30s.
  ///
  /// onProgress: callback opcional para feedback al usuario en tiempo
  /// real ("Buscando documento...", "Tag detectado", "Leyendo chip...").
  Future<NfcReadResult> readDocument({
    int timeoutMs = 30000,
    void Function(String stage)? onProgress,
  }) async {
    if (_disposed) {
      return const NfcReadResult(
        tagDetected: false,
        authenticated: false,
        tagInfo: {},
        error: 'Service disposed',
      );
    }

    final available = await isAvailable();
    if (!available) {
      return const NfcReadResult(
        tagDetected: false,
        authenticated: false,
        tagInfo: {},
        error: 'NFC no disponible (verifica que esté activado en ajustes)',
      );
    }

    onProgress?.call('Acerca el documento al móvil...');

    final completer = Completer<NfcReadResult>();
    Timer? timeoutTimer;

    try {
      _sessionActive = true;
      timeoutTimer = Timer(Duration(milliseconds: timeoutMs), () {
        if (!completer.isCompleted) {
          NfcManager.instance.stopSession(errorMessage: 'Timeout');
          completer.complete(const NfcReadResult(
            tagDetected: false,
            authenticated: false,
            tagInfo: {},
            error: 'Tiempo agotado. Acerca el documento al móvil más tiempo.',
          ));
          _sessionActive = false;
        }
      });

      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          onProgress?.call('Tag detectado, leyendo identificadores...');

          // Recolectar info básica del tag (lo que SÍ podemos leer sin
          // autenticación PACE/BAC).
          final tagInfo = <String, dynamic>{};
          try {
            tagInfo['tagData'] = tag.data.keys.toList();
            tagInfo['rawData'] = _safeStringify(tag.data);
          } catch (e) {
            tagInfo['tagInfoError'] = e.toString();
          }

          // ── PUNTO DE INTEGRACIÓN ──────────────────────────────────
          // Aquí va el código real de PACE/BAC ICAO 9303 cuando se
          // implemente. Ejemplo de pseudocódigo:
          //
          //   final mrzKey = deriveBacKey(documentNumber, birthDate, expiryDate);
          //   await chip.authenticatePACE(mrzKey);
          //   final dg1 = await chip.readDataGroup(1);
          //   final mrzData = parseMrz(dg1);
          //   final dg2 = await chip.readDataGroup(2);  // foto
          //   final dg11 = await chip.readDataGroup(11); // datos personales
          //   final sod = await chip.readSOD();
          //   final signatureValid = verifyDocumentSignature(sod, dg1, dg2);
          //
          // Mientras tanto, el scaffold sólo confirma detección.
          // ─────────────────────────────────────────────────────────

          await NfcManager.instance.stopSession();
          if (!completer.isCompleted) {
            completer.complete(NfcReadResult(
              tagDetected: true,
              authenticated: false,
              tagInfo: tagInfo,
              data: null,
              error: 'Lectura PACE/BAC no implementada todavía. '
                  'Tag detectado correctamente — listo para integrar libs '
                  'nativas (jmrtd Android / NFCPassportReader iOS).',
            ));
          }
          _sessionActive = false;
        },
      );
    } catch (e) {
      if (!completer.isCompleted) {
        completer.complete(NfcReadResult(
          tagDetected: false,
          authenticated: false,
          tagInfo: const {},
          error: 'Error de sesión NFC: $e',
        ));
      }
      _sessionActive = false;
    }

    final result = await completer.future;
    timeoutTimer?.cancel();
    return result;
  }

  Future<void> stopSession() async {
    if (_sessionActive) {
      await NfcManager.instance.stopSession();
      _sessionActive = false;
    }
  }

  void dispose() {
    if (_disposed) return;
    _disposed = true;
    if (_sessionActive) {
      NfcManager.instance.stopSession().catchError((_) {});
    }
  }

  String _safeStringify(Map<String, dynamic> m) {
    try {
      return m.toString().substring(0, 200);
    } catch (_) {
      return '<unserializable>';
    }
  }
}
