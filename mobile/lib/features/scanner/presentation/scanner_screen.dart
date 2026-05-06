/// ────────────────────────────────────────────────────────────────────────
///  Scanner — placeholder de cámara + NFC del DNI 3.0.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class ScannerScreen extends StatelessWidget {
  const ScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escaneo de documento')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            const SizedBox(height: 8),
            Text('PRÓXIMAMENTE', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 4),
            Text(
              'Identifica al visitante en segundos',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'Estas dos opciones reemplazarán al input manual cuando llegue su PR. '
              'La imagen NUNCA sale del dispositivo: privacidad GDPR de serie.',
              style: TextStyle(
                fontSize: 14,
                color: HaloColors.fgMuted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 28),
            _OptionCard(
              icon: Icons.photo_camera_rounded,
              gradient: const [Color(0xFF6366F1), HaloColors.accent],
              title: 'Cámara + OCR on-device',
              subtitle: 'Apple VisionKit · Google MLKit',
              description:
                  'Captura del documento con detección automática de bordes. '
                  'OCR ejecutado on-device en sub-segundo, multi-idioma. '
                  'Pre-rellena el campo de nombre.',
              eta: '<1s por scan',
            ),
            const SizedBox(height: 12),
            _OptionCard(
              icon: Icons.nfc_rounded,
              gradient: const [HaloColors.accent, Color(0xFFEC4899)],
              title: 'NFC del DNI 3.0',
              subtitle: 'Protocolo PACE/BAC · ICAO 9303',
              description:
                  'Lectura criptográficamente firmada del chip ISO 14443. '
                  'Sin OCR, sin riesgo de error: los datos vienen verificados '
                  'por la propia tarjeta.',
              eta: '~400ms por lectura',
            ),
            const SizedBox(height: 28),
            const _ReturnHint(),
          ],
        ),
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final List<Color> gradient;
  final String title;
  final String subtitle;
  final String description;
  final String eta;
  const _OptionCard({
    required this.icon,
    required this.gradient,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.eta,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border.all(color: HaloColors.border),
        borderRadius: BorderRadius.circular(18),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: gradient,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: gradient.first.withValues(alpha: 0.4),
                      blurRadius: 14,
                      spreadRadius: -4,
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: HaloColors.fg,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 11,
                        color: HaloColors.fgMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: HaloColors.accent.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                  eta,
                  style: const TextStyle(
                    fontSize: 10,
                    color: HaloColors.accent,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            description,
            style: const TextStyle(
              fontSize: 13,
              color: HaloColors.fg,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReturnHint extends StatelessWidget {
  const _ReturnHint();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: HaloColors.accent.withValues(alpha: 0.06),
        border: Border.all(color: HaloColors.accent.withValues(alpha: 0.2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline_rounded,
              color: HaloColors.accent, size: 18),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Vuelve atrás y usa el campo manual mientras tanto.',
              style: TextStyle(fontSize: 13, color: HaloColors.fg, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
