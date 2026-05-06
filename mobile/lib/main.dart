/// HALO Name Validator — app móvil para operarios del Tour del Bernabéu.
///
/// Arquitectura:
///   ▸ Riverpod para state management
///   ▸ go_router para navegación
///   ▸ HTTP al Cloudflare Worker para validación AI + métricas
///   ▸ Local: format check + (futuro) port completo de blocklists a Dart
///   ▸ NFC: nfc_manager → IsoDep en Android, CoreNFC en iOS, PACE/BAC ICAO 9303
///   ▸ OCR: google_mlkit_text_recognition (on-device, GDPR-friendly)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/router.dart';
import 'app/theme.dart';

void main() {
  runApp(const ProviderScope(child: HaloApp()));
}

class HaloApp extends StatelessWidget {
  const HaloApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'HALO Validator',
      debugShowCheckedModeBanner: false,
      theme: HaloTheme.dark(),
      routerConfig: appRouter,
    );
  }
}
