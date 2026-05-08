/// ────────────────────────────────────────────────────────────────────────
///  Scanner — cámara + OCR on-device + selector de candidatos
/// ────────────────────────────────────────────────────────────────────────
///
/// Flujo:
///   1. Usuario pulsa "Escanear DNI / pasaporte" desde Home
///   2. Solicita permiso de cámara (si no concedido)
///   3. Captura una foto con `image_picker` (más simple que `camera`
///      para el primer flow — el preview live + autocaptura es upgrade
///      para una PR siguiente)
///   4. Procesa con google_mlkit_text_recognition (on-device, GDPR-OK)
///   5. Heurística scoring para rankear líneas → candidato a nombre
///   6. Lista de candidatos clickeables — el operario elige cuál
///   7. Al elegir, vuelve a Home con el campo pre-rellenado

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/theme.dart';
import '../data/document_ocr_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final _ocrService = DocumentOcrService();
  final _picker = ImagePicker();

  bool _busy = false;
  String? _imagePath;
  OcrResult? _result;
  String? _error;

  @override
  void dispose() {
    _ocrService.dispose();
    super.dispose();
  }

  Future<void> _captureFromCamera() async {
    setState(() {
      _busy = true;
      _error = null;
      _result = null;
    });
    HapticFeedback.lightImpact();
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.rear,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 90,
      );
      if (file == null) {
        setState(() => _busy = false);
        return;
      }
      setState(() => _imagePath = file.path);
      final result = await _ocrService.recognizeFile(file.path);
      setState(() {
        _result = result;
        _busy = false;
      });
      HapticFeedback.mediumImpact();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _busy = false;
      });
      HapticFeedback.heavyImpact();
    }
  }

  Future<void> _pickFromGallery() async {
    setState(() {
      _busy = true;
      _error = null;
      _result = null;
    });
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 2000,
        maxHeight: 2000,
        imageQuality: 90,
      );
      if (file == null) {
        setState(() => _busy = false);
        return;
      }
      setState(() => _imagePath = file.path);
      final result = await _ocrService.recognizeFile(file.path);
      setState(() {
        _result = result;
        _busy = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _busy = false;
      });
    }
  }

  void _useCandidate(String name) {
    HapticFeedback.lightImpact();
    Navigator.of(context).pop(name);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escaneo de documento')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            const SizedBox(height: 8),
            Text('OCR ON-DEVICE', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 4),
            Text('Escanea DNI o pasaporte',
                style: Theme.of(context).textTheme.displayMedium),
            const SizedBox(height: 8),
            const Text(
              'Apple VisionKit / Google MLKit. La imagen NUNCA sale del '
              'dispositivo — privacidad GDPR de serie.',
              style: TextStyle(
                  fontSize: 13.5, color: HaloColors.fgMuted, height: 1.5),
            ),
            const SizedBox(height: 24),

            // ── Botones de captura
            FilledButton.icon(
              onPressed: _busy ? null : _captureFromCamera,
              icon: _busy
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.4, color: HaloColors.bg),
                    )
                  : const Icon(Icons.photo_camera_rounded, size: 20),
              label: Text(_busy ? 'Procesando…' : 'Capturar con cámara'),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _busy ? null : _pickFromGallery,
              icon: const Icon(Icons.photo_library_rounded, size: 18),
              label: const Text('Elegir de la galería'),
            ),

            // ── Error
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: HaloColors.bad.withValues(alpha: 0.14),
                  border: Border.all(color: HaloColors.bad.withValues(alpha: 0.4)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(_error!,
                    style: const TextStyle(color: HaloColors.bad, fontSize: 13)),
              ),
            ],

            // ── Preview de la imagen capturada
            if (_imagePath != null) ...[
              const SizedBox(height: 20),
              Text('IMAGEN CAPTURADA',
                  style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: AspectRatio(
                  aspectRatio: 16 / 10,
                  child: Image(
                    image: AssetImage(_imagePath!),
                    fit: BoxFit.cover,
                    // Workaround: en plataformas reales debe ser FileImage(File(path))
                    errorBuilder: (_, __, ___) => Container(
                      color: HaloColors.surface,
                      child: const Center(
                        child: Icon(Icons.image_rounded,
                            size: 40, color: HaloColors.fgMuted),
                      ),
                    ),
                  ),
                ),
              ),
            ],

            // ── Resultado OCR — candidatos
            if (_result != null) ...[
              const SizedBox(height: 20),
              Row(
                children: [
                  Text('CANDIDATOS · ${_result!.candidates.length}',
                      style: Theme.of(context).textTheme.labelLarge),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: HaloColors.accent.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      '${_result!.elapsedMs} ms',
                      style: const TextStyle(
                        fontSize: 10,
                        color: HaloColors.accent,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (_result!.candidates.isEmpty)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: HaloColors.surface,
                    border: Border.all(color: HaloColors.border),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'No se detectó texto. Vuelve a intentarlo con mejor iluminación o '
                    'enfocando el documento más cerca.',
                    style: TextStyle(color: HaloColors.fgMuted, fontSize: 13),
                  ),
                )
              else
                Column(
                  children: [
                    for (final c in _result!.candidates)
                      _CandidateTile(
                        text: c.text,
                        score: c.score,
                        onTap: () => _useCandidate(c.text),
                      ),
                  ],
                ),

              // Texto raw colapsable
              const SizedBox(height: 16),
              ExpansionTile(
                title: const Text('Texto raw OCR'),
                tilePadding: EdgeInsets.zero,
                childrenPadding: const EdgeInsets.only(bottom: 12),
                collapsedIconColor: HaloColors.fgMuted,
                iconColor: HaloColors.accent,
                shape: const Border(),
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: HaloColors.surface,
                      border: Border.all(color: HaloColors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: SelectableText(
                      _result!.rawText.isEmpty ? '(vacío)' : _result!.rawText,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: HaloColors.fgMuted,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CandidateTile extends StatelessWidget {
  final String text;
  final double score;
  final VoidCallback onTap;
  const _CandidateTile({
    required this.text,
    required this.score,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = score >= 0.7
        ? HaloColors.ok
        : score >= 0.4
            ? HaloColors.warn
            : HaloColors.fgMuted;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: HaloColors.surface,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HaloColors.border),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 24,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${(score * 100).toInt()}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    text,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                      color: HaloColors.fg,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.arrow_forward_rounded,
                    color: HaloColors.fgFaint, size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
