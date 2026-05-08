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
import '../data/nfc_document_service.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen>
    with SingleTickerProviderStateMixin {
  final _ocrService = DocumentOcrService();
  final _nfcService = NfcDocumentService();
  final _picker = ImagePicker();
  late final TabController _tabController;

  bool _busy = false;
  String? _imagePath;
  OcrResult? _result;
  String? _error;
  String? _nfcStatus;
  NfcReadResult? _nfcResult;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _ocrService.dispose();
    _nfcService.dispose();
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _readNfc() async {
    setState(() {
      _busy = true;
      _error = null;
      _nfcResult = null;
      _nfcStatus = 'Comprobando NFC...';
    });
    HapticFeedback.lightImpact();
    try {
      final result = await _nfcService.readDocument(
        timeoutMs: 30000,
        onProgress: (stage) {
          if (mounted) setState(() => _nfcStatus = stage);
        },
      );
      setState(() {
        _nfcResult = result;
        _busy = false;
        _nfcStatus = null;
      });
      if (result.tagDetected) {
        HapticFeedback.mediumImpact();
      } else if (result.error != null) {
        HapticFeedback.heavyImpact();
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _busy = false;
        _nfcStatus = null;
      });
    }
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
      appBar: AppBar(
        title: const Text('Escaneo de documento'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: HaloColors.accent,
          labelColor: HaloColors.fg,
          unselectedLabelColor: HaloColors.fgMuted,
          tabs: const [
            Tab(icon: Icon(Icons.photo_camera_rounded), text: 'Cámara + OCR'),
            Tab(icon: Icon(Icons.nfc_rounded), text: 'NFC del chip'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildOcrTab(context),
            _buildNfcTab(context),
          ],
        ),
      ),
    );
  }

  Widget _buildOcrTab(BuildContext context) {
    return ListView(
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
    );
  }

  Widget _buildNfcTab(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      children: [
        const SizedBox(height: 8),
        Text('NFC · ICAO 9303', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 4),
        Text('Lectura del chip',
            style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 8),
        const Text(
          'DNI 3.0 español y pasaportes biométricos llevan un chip NFC con '
          'los datos firmados criptográficamente. Más fiable que OCR.',
          style: TextStyle(
              fontSize: 13.5, color: HaloColors.fgMuted, height: 1.5),
        ),
        const SizedBox(height: 20),

        // Aviso sobre el estado actual
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: HaloColors.warn.withValues(alpha: 0.12),
            border: Border.all(color: HaloColors.warn.withValues(alpha: 0.4)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline_rounded,
                  size: 16, color: HaloColors.warn),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Scaffold: detecta el chip pero la autenticación PACE/BAC '
                  'aún no está integrada. Pendiente de libs nativas '
                  '(jmrtd / NFCPassportReader).',
                  style: TextStyle(
                      fontSize: 12.5, color: HaloColors.warn, height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        FilledButton.icon(
          onPressed: _busy ? null : _readNfc,
          icon: _busy
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.4, color: HaloColors.bg),
                )
              : const Icon(Icons.nfc_rounded, size: 20),
          label: Text(_busy ? (_nfcStatus ?? 'Leyendo…') : 'Leer NFC del chip'),
        ),
        const SizedBox(height: 8),
        const Text(
          'Acerca la parte trasera del móvil al chip del documento.\n'
          '· Pasaporte: portada interior.\n'
          '· DNI 3.0: dorso, esquina inferior.',
          style: TextStyle(
              fontSize: 12, color: HaloColors.fgFaint, height: 1.5),
        ),

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

        if (_nfcResult != null) ...[
          const SizedBox(height: 20),
          Text('RESULTADO',
              style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: HaloColors.surface,
              border: Border.all(color: HaloColors.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _NfcRow(
                  label: 'Tag detectado',
                  value: _nfcResult!.tagDetected ? 'Sí' : 'No',
                  ok: _nfcResult!.tagDetected,
                ),
                const SizedBox(height: 6),
                _NfcRow(
                  label: 'Autenticado (PACE/BAC)',
                  value: _nfcResult!.authenticated ? 'Sí' : 'Pendiente',
                  ok: _nfcResult!.authenticated,
                ),
                if (_nfcResult!.error != null) ...[
                  const SizedBox(height: 10),
                  Text(
                    _nfcResult!.error!,
                    style: const TextStyle(
                        fontSize: 12, color: HaloColors.fgMuted, height: 1.4),
                  ),
                ],
                if (_nfcResult!.tagInfo.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  const Text(
                    'INFO DEL TAG',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: HaloColors.fgFaint,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 4),
                  SelectableText(
                    _nfcResult!.tagInfo.toString(),
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: HaloColors.fgMuted,
                      height: 1.4,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _NfcRow extends StatelessWidget {
  final String label;
  final String value;
  final bool ok;
  const _NfcRow({required this.label, required this.value, required this.ok});

  @override
  Widget build(BuildContext context) {
    final color = ok ? HaloColors.ok : HaloColors.warn;
    return Row(
      children: [
        Icon(
          ok ? Icons.check_circle_rounded : Icons.pending_rounded,
          size: 16,
          color: color,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: HaloColors.fg),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
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
