/// ────────────────────────────────────────────────────────────────────────
///  Pantalla de escaneo — placeholder para iteración siguiente.
/// ────────────────────────────────────────────────────────────────────────
///
/// TODO en próximas PRs:
///   ▸ Captura de cámara con `camera` package + UI custom de escáner
///   ▸ OCR on-device con `google_mlkit_text_recognition` (sustituye Tesseract)
///   ▸ NFC del DNI 3.0 con `nfc_manager` + protocolo PACE/BAC ICAO 9303
///   ▸ Fallback al endpoint /api/scan-document (Claude Vision) si falla on-device
///   ▸ Pre-relleno del input principal con el `fullName` extraído

import 'package:flutter/material.dart';

class ScannerScreen extends StatelessWidget {
  const ScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escaneo')),
      body: const Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            _OptionCard(
              icon: Icons.camera_alt_outlined,
              title: 'Cámara + OCR',
              description:
                  'Captura del documento con detección de bordes y OCR on-device '
                  '(VisionKit en iOS / MLKit en Android). Privacidad GDPR — la '
                  'imagen no sale del dispositivo salvo fallback explícito.',
              status: 'Próximamente',
            ),
            SizedBox(height: 12),
            _OptionCard(
              icon: Icons.nfc,
              title: 'NFC del DNI 3.0',
              description:
                  'Lectura criptográficamente firmada del chip ISO 14443 vía '
                  'PACE/BAC (ICAO 9303). Sub-segundo, sin OCR, datos verificados.',
              status: 'Próximamente',
            ),
            SizedBox(height: 24),
            Text(
              'Hasta que llegue, usa el campo de texto manual desde la home.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final String status;
  const _OptionCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 28, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          status,
                          style: TextStyle(
                            fontSize: 10,
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(description, style: const TextStyle(fontSize: 13, height: 1.4)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
