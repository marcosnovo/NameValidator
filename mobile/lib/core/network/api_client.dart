/// ────────────────────────────────────────────────────────────────────────
///  Cliente HTTP del Cloudflare Worker.
/// ────────────────────────────────────────────────────────────────────────
///
/// Endpoints expuestos por proxy/cloudflare-worker.js:
///   GET  /api/health
///   POST /api/ai-check        — validación AI (con cache KV 1h)
///   POST /api/scan-document   — OCR Vision (Claude Sonnet 4.6)
///   POST /api/approve         — registra aprobación humana en KV global
///   GET  /api/metrics         — counters agregados últimos 14d

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => 'ApiException(${statusCode ?? '-'}): $message';
}

class ApiClient {
  /// URL base sin el path del endpoint. Ej: `https://halo-proxy.foo.workers.dev`
  /// El usuario probablemente la guarda terminada en `/api/ai-check`; aceptamos
  /// las dos formas y normalizamos.
  final String baseUrl;
  final Duration timeout;
  final http.Client _client;

  ApiClient({
    required String baseUrl,
    this.timeout = const Duration(seconds: 30),
    http.Client? client,
  })  : baseUrl = _normalizeBase(baseUrl),
        _client = client ?? http.Client();

  static String _normalizeBase(String raw) {
    var u = raw.trim();
    // Quitar /api/ai-check, /api/scan-document, etc. del final si lo tiene
    u = u.replaceAll(RegExp(r'/api/[^/]+/?$'), '');
    // Quitar trailing slash
    u = u.replaceAll(RegExp(r'/+$'), '');
    return u;
  }

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  /// GET /api/health — comprueba si el proxy + Anthropic + KV están vivos.
  Future<Map<String, dynamic>> health() async {
    try {
      final r = await _client.get(_uri('/api/health')).timeout(timeout);
      if (r.statusCode != 200) {
        throw ApiException('Health HTTP ${r.statusCode}', statusCode: r.statusCode);
      }
      return jsonDecode(r.body) as Map<String, dynamic>;
    } on SocketException catch (e) {
      throw ApiException('Sin red: ${e.message}');
    }
  }

  /// POST /api/ai-check — validación completa.
  Future<Map<String, dynamic>> aiCheck(String input, {String? context}) async {
    final body = <String, dynamic>{'input': input};
    if (context != null) body['context'] = context;
    return _postJson('/api/ai-check', body);
  }

  /// POST /api/scan-document — OCR de documento de identidad.
  /// [imageBase64] es el JPEG/PNG codificado en base64 (sin el prefijo `data:`).
  Future<Map<String, dynamic>> scanDocument({
    required String imageBase64,
    String mediaType = 'image/jpeg',
  }) async {
    return _postJson('/api/scan-document', {
      'image': imageBase64,
      'mediaType': mediaType,
    });
  }

  /// POST /api/approve — registra aprobación humana global en KV.
  Future<Map<String, dynamic>> approve({
    required String input,
    required String approverId,
    String? note,
  }) async {
    return _postJson('/api/approve', {
      'input': input,
      'approver_id': approverId,
      if (note != null && note.isNotEmpty) 'note': note,
    });
  }

  /// GET /api/metrics — agregados de los últimos 14 días.
  Future<Map<String, dynamic>> metrics() async {
    try {
      final r = await _client.get(_uri('/api/metrics')).timeout(timeout);
      if (r.statusCode != 200) {
        throw ApiException('Metrics HTTP ${r.statusCode}', statusCode: r.statusCode);
      }
      return jsonDecode(r.body) as Map<String, dynamic>;
    } on SocketException catch (e) {
      throw ApiException('Sin red: ${e.message}');
    }
  }

  Future<Map<String, dynamic>> _postJson(
    String path,
    Map<String, dynamic> body,
  ) async {
    try {
      final r = await _client
          .post(
            _uri(path),
            headers: const {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(timeout);
      final decoded = jsonDecode(r.body) as Map<String, dynamic>;
      if (r.statusCode >= 400) {
        throw ApiException(
          decoded['error']?.toString() ?? 'HTTP ${r.statusCode}',
          statusCode: r.statusCode,
        );
      }
      return decoded;
    } on SocketException catch (e) {
      throw ApiException('Sin red: ${e.message}');
    } on FormatException catch (e) {
      throw ApiException('Respuesta no-JSON: ${e.message}');
    }
  }

  void dispose() => _client.close();
}
