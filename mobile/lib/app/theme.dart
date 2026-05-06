/// ────────────────────────────────────────────────────────────────────────
///  Tema visual de la app.
/// ────────────────────────────────────────────────────────────────────────
///
/// Paleta inspirada en el HALO Bernabéu — fondo oscuro, acentos
/// índigo/violeta para los badges de IA + verde/amarillo/rojo para
/// los veredictos.

import 'package:flutter/material.dart';

class HaloTheme {
  static const _primary = Color(0xFFA855F7);   // violeta — acento Vision/AI
  static const _surface = Color(0xFF0F172A);   // slate 900 (fondo)
  static const _onSurface = Color(0xFFE2E8F0); // slate 200

  static const _ok = Color(0xFF34D399);
  static const _warn = Color(0xFFFBBF24);
  static const _bad = Color(0xFFEF4444);

  static ThemeData dark() {
    return ThemeData(
      brightness: Brightness.dark,
      useMaterial3: true,
      colorScheme: const ColorScheme.dark(
        primary: _primary,
        secondary: _primary,
        surface: _surface,
        onSurface: _onSurface,
        error: _bad,
      ),
      scaffoldBackgroundColor: _surface,
      appBarTheme: const AppBarTheme(
        backgroundColor: _surface,
        elevation: 0,
        centerTitle: false,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }

  static Color verdictColor(String? verdict) {
    switch (verdict) {
      case 'ALLOWED':
      case 'CLEAN':
        return _ok;
      case 'REVIEW':
      case 'SUSPICIOUS':
        return _warn;
      case 'REJECTED':
      case 'OFFENSIVE':
        return _bad;
      default:
        return _onSurface;
    }
  }
}
