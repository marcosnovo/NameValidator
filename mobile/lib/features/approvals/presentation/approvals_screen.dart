/// ────────────────────────────────────────────────────────────────────────
///  Aprobaciones — placeholder hasta endpoint /api/approvals
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';

import '../../../app/theme.dart';

class ApprovalsScreen extends StatelessWidget {
  const ApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Aprobaciones')),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: HaloColors.accent.withValues(alpha: 0.10),
                    border: Border.all(
                      color: HaloColors.accent.withValues(alpha: 0.3),
                      width: 2,
                    ),
                  ),
                  child: const Icon(Icons.history_toggle_off_rounded,
                      color: HaloColors.accent, size: 32),
                ),
                const SizedBox(height: 20),
                Text(
                  'Histórico de aprobaciones',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Aquí verás las aprobaciones manuales del operario propagadas '
                  'al KV global. Próximamente — necesita un endpoint '
                  '/api/approvals que aún no está expuesto.',
                  style: TextStyle(
                    color: HaloColors.fgMuted,
                    fontSize: 13,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
