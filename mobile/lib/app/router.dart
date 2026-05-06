/// ────────────────────────────────────────────────────────────────────────
///  Rutas de la app — go_router.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/validator/presentation/home_screen.dart';
import '../features/validator/presentation/result_screen.dart';
import '../features/scanner/presentation/scanner_screen.dart';
import '../features/approvals/presentation/approvals_screen.dart';
import '../features/metrics/presentation/metrics_screen.dart';

class AppRoutes {
  static const home = '/';
  static const scanner = '/scanner';
  static const result = '/result';
  static const approvals = '/approvals';
  static const metrics = '/metrics';
}

final appRouter = GoRouter(
  initialLocation: AppRoutes.home,
  debugLogDiagnostics: true,
  routes: [
    GoRoute(
      path: AppRoutes.home,
      builder: (_, __) => const HomeScreen(),
    ),
    GoRoute(
      path: AppRoutes.scanner,
      builder: (_, __) => const ScannerScreen(),
    ),
    GoRoute(
      path: AppRoutes.result,
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return ResultScreen(
          input: (extra?['input'] as String?) ?? '',
          verdict: extra?['verdict'] as Map<String, dynamic>?,
        );
      },
    ),
    GoRoute(
      path: AppRoutes.approvals,
      builder: (_, __) => const ApprovalsScreen(),
    ),
    GoRoute(
      path: AppRoutes.metrics,
      builder: (_, __) => const MetricsScreen(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(child: Text('Ruta no encontrada: ${state.uri}')),
  ),
);
