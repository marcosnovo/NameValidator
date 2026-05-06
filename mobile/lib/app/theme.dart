/// ────────────────────────────────────────────────────────────────────────
///  Tema visual del HALO Validator.
/// ────────────────────────────────────────────────────────────────────────
///
/// Inspirado en el anillo LED del Bernabéu:
///   ▸ Fondo navy oscuro con elevación sutil
///   ▸ Acento violeta-índigo que evoca el glow del LED
///   ▸ Verdict colors: verde lima (CLEAN), ámbar cálido (REVIEW),
///     rojo coral (REJECTED) — alta legibilidad sobre dark.
///   ▸ Tipografía system stack (SF Pro Mac/iOS, Roboto Android) —
///     tamaño headline grande para la marca, weight 800 para verdicts.

import 'package:flutter/material.dart';

class HaloColors {
  // ── Backgrounds
  static const bg = Color(0xFF0A0E1A);       // navy profundo (más oscuro que slate)
  static const surface = Color(0xFF11182B);  // surface base
  static const surfaceHigh = Color(0xFF1B2540);
  static const surfaceMax = Color(0xFF243151);

  // ── Foreground
  static const fg = Color(0xFFEEF2FF);       // off-white con tinte índigo
  static const fgMuted = Color(0xFF94A3B8);  // slate 400
  static const fgFaint = Color(0xFF475569);  // slate 600

  // ── Accent (HALO LED glow)
  static const accent = Color(0xFFA78BFA);       // violeta principal
  static const accentBright = Color(0xFFC4B5FD); // hover/glow
  static const accentDim = Color(0xFF6D28D9);    // sombra/borde

  // ── Verdicts
  static const ok = Color(0xFF4ADE80);     // green 400
  static const warn = Color(0xFFFBBF24);   // amber 400
  static const bad = Color(0xFFF87171);    // red 400

  // ── Borders
  static const border = Color(0xFF1E293B);
  static const borderStrong = Color(0xFF334155);

  static Color verdict(String? v) {
    switch (v) {
      case 'ALLOWED':
      case 'CLEAN':
        return ok;
      case 'REVIEW':
      case 'SUSPICIOUS':
        return warn;
      case 'REJECTED':
      case 'OFFENSIVE':
        return bad;
      default:
        return fgMuted;
    }
  }

  static String verdictLabel(String? v) {
    switch (v) {
      case 'ALLOWED':
      case 'CLEAN':
        return 'PERMITIDO';
      case 'REVIEW':
      case 'SUSPICIOUS':
        return 'REVISAR';
      case 'REJECTED':
      case 'OFFENSIVE':
        return 'RECHAZADO';
      default:
        return v ?? '—';
    }
  }

  static IconData verdictIcon(String? v) {
    switch (v) {
      case 'ALLOWED':
      case 'CLEAN':
        return Icons.check_circle_rounded;
      case 'REVIEW':
      case 'SUSPICIOUS':
        return Icons.error_rounded;
      case 'REJECTED':
      case 'OFFENSIVE':
        return Icons.cancel_rounded;
      default:
        return Icons.help_rounded;
    }
  }
}

class HaloTheme {
  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      colorScheme: const ColorScheme.dark(
        primary: HaloColors.accent,
        onPrimary: HaloColors.bg,
        secondary: HaloColors.accentBright,
        onSecondary: HaloColors.bg,
        surface: HaloColors.surface,
        onSurface: HaloColors.fg,
        surfaceContainerHighest: HaloColors.surfaceMax,
        error: HaloColors.bad,
        onError: HaloColors.bg,
        outline: HaloColors.border,
        outlineVariant: HaloColors.borderStrong,
      ),
      scaffoldBackgroundColor: HaloColors.bg,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: HaloColors.fg,
          fontSize: 17,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.2,
        ),
        iconTheme: IconThemeData(color: HaloColors.fgMuted),
      ),
      cardTheme: const CardThemeData(
        color: HaloColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: HaloColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 15,
            letterSpacing: 0.1,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          minimumSize: const Size.fromHeight(56),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
          foregroundColor: HaloColors.fg,
          side: const BorderSide(color: HaloColors.borderStrong, width: 1),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          minimumSize: const Size.fromHeight(52),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: HaloColors.accent,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: HaloColors.surfaceHigh,
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        labelStyle: const TextStyle(color: HaloColors.fgMuted, fontSize: 14),
        hintStyle: const TextStyle(color: HaloColors.fgFaint, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: HaloColors.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: HaloColors.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: HaloColors.accent, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: HaloColors.bad, width: 1),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: HaloColors.surfaceMax,
        contentTextStyle: TextStyle(color: HaloColors.fg, fontSize: 14),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        elevation: 0,
      ),
      dialogTheme: const DialogThemeData(
        backgroundColor: HaloColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(20)),
          side: BorderSide(color: HaloColors.border, width: 1),
        ),
        titleTextStyle: TextStyle(
          color: HaloColors.fg,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: HaloColors.border,
        space: 1,
        thickness: 1,
      ),
      iconTheme: const IconThemeData(color: HaloColors.fgMuted),
      textTheme: base.textTheme.apply(
        bodyColor: HaloColors.fg,
        displayColor: HaloColors.fg,
      ).copyWith(
        displayLarge: const TextStyle(
          color: HaloColors.fg,
          fontSize: 36,
          fontWeight: FontWeight.w800,
          letterSpacing: -1.0,
          height: 1.05,
        ),
        displayMedium: const TextStyle(
          color: HaloColors.fg,
          fontSize: 28,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        headlineSmall: const TextStyle(
          color: HaloColors.fg,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.2,
        ),
        bodyLarge: const TextStyle(
          color: HaloColors.fg,
          fontSize: 15,
          height: 1.4,
        ),
        bodyMedium: const TextStyle(
          color: HaloColors.fg,
          fontSize: 14,
          height: 1.4,
        ),
        bodySmall: const TextStyle(
          color: HaloColors.fgMuted,
          fontSize: 12,
          height: 1.35,
        ),
        labelLarge: const TextStyle(
          color: HaloColors.fgMuted,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  /// Gradiente del HALO LED — usado en el card de verdict + decoración.
  static LinearGradient haloGlow({Color? tint, double opacity = 0.28}) {
    final c = tint ?? HaloColors.accent;
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        c.withValues(alpha: opacity),
        c.withValues(alpha: opacity * 0.4),
        Colors.transparent,
      ],
      stops: const [0.0, 0.5, 1.0],
    );
  }
}
