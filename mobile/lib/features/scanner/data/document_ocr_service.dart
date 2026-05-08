/// ────────────────────────────────────────────────────────────────────────
///  DocumentOcrService — wraps google_mlkit_text_recognition.
/// ────────────────────────────────────────────────────────────────────────
///
/// On-device OCR multi-idioma. La imagen NUNCA sale del dispositivo →
/// privacidad GDPR de serie.
///
/// Pipeline:
///   1. Recibir un XFile (de camera o image_picker)
///   2. Inicializar TextRecognizer (latín + chino + japonés + coreano + devanagari)
///   3. Procesar imagen → bloques de texto con coordenadas
///   4. Heurística para extraer "nombre + apellidos" del documento
///   5. Devolver el resultado al caller

import 'dart:io';

import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

class OcrResult {
  /// Texto raw detectado (todos los bloques concatenados con saltos de línea)
  final String rawText;

  /// Mejor candidato a nombre detectado, si encontramos algo plausible.
  /// Heurística: línea con sólo letras (≥2 palabras, ≤30 chars) y sin
  /// dígitos ni símbolos especiales.
  final String? candidateName;

  /// Lista de líneas con score (0-1) — para que la UI muestre alternativas.
  final List<OcrLineCandidate> candidates;

  /// Cuánto tiempo costó el OCR (ms).
  final int elapsedMs;

  const OcrResult({
    required this.rawText,
    required this.candidateName,
    required this.candidates,
    required this.elapsedMs,
  });

  bool get hasCandidate => candidateName != null && candidateName!.isNotEmpty;
}

class OcrLineCandidate {
  final String text;
  final double score;   // 0-1, alta = más probable que sea un nombre
  const OcrLineCandidate({required this.text, required this.score});
}

class DocumentOcrService {
  late final TextRecognizer _latinRecognizer;
  bool _disposed = false;

  DocumentOcrService() {
    _latinRecognizer = TextRecognizer(script: TextRecognitionScript.latin);
  }

  /// Procesa una imagen (path local) y devuelve el resultado OCR.
  Future<OcrResult> recognizeFile(String imagePath) async {
    final stopwatch = Stopwatch()..start();
    final input = InputImage.fromFile(File(imagePath));
    final RecognizedText recognized = await _latinRecognizer.processImage(input);
    stopwatch.stop();

    final lines = <OcrLineCandidate>[];
    for (final block in recognized.blocks) {
      for (final line in block.lines) {
        final text = line.text.trim();
        if (text.isEmpty) continue;
        lines.add(OcrLineCandidate(text: text, score: _scoreLine(text)));
      }
    }

    // Ordenar por score descendente
    lines.sort((a, b) => b.score.compareTo(a.score));

    final candidate = lines.isNotEmpty && lines.first.score >= 0.5
        ? lines.first.text
        : null;

    return OcrResult(
      rawText: recognized.text,
      candidateName: candidate,
      candidates: lines.take(10).toList(growable: false),
      elapsedMs: stopwatch.elapsedMilliseconds,
    );
  }

  /// Heurística simple: ¿esta línea parece un nombre?
  ///
  /// Score factors:
  ///   ▸ +0.4 si tiene 2-4 palabras
  ///   ▸ +0.3 si todas las palabras son letras (sin dígitos ni símbolos)
  ///   ▸ +0.2 si tiene mayúsculas iniciales razonables
  ///   ▸ +0.2 si la longitud está entre 6 y 35
  ///   ▸ -0.5 si contiene palabras-trampa típicas de DNI/pasaporte
  ///     (NACIONALIDAD, FECHA, NACIMIENTO, MINISTERIO, etc.)
  double _scoreLine(String text) {
    var score = 0.0;
    final words = text.trim().split(RegExp(r'\s+'));

    if (words.length >= 2 && words.length <= 4) score += 0.4;
    if (text.length >= 6 && text.length <= 35) score += 0.2;

    final lettersOnly = words.every((w) => RegExp(r'^[A-Za-zÀ-ÿ\-']+$').hasMatch(w));
    if (lettersOnly) score += 0.3;

    final allUpperCase = words.every((w) => w == w.toUpperCase() && w.length >= 2);
    final titleCase = words.every((w) =>
        w.isNotEmpty && w[0] == w[0].toUpperCase() && w.length >= 2);
    if (allUpperCase || titleCase) score += 0.2;

    final trapWords = RegExp(
      r'\b(documento|nacional|identidad|nacionalidad|fecha|nacimiento|sexo|'
      r'ministerio|interior|valido|hasta|primer|segundo|apellido|nombre|'
      r'firma|titular|surname|given|name|date|birth|sex|national|number|'
      r'idesp|dni|nie|passport|pasaporte|república|kingdom|reino|union)\b',
      caseSensitive: false,
    );
    if (trapWords.hasMatch(text)) score -= 0.5;

    if (RegExp(r'\d').hasMatch(text)) score -= 0.3;

    return score.clamp(0.0, 1.0);
  }

  void dispose() {
    if (_disposed) return;
    _disposed = true;
    _latinRecognizer.close();
  }
}
