/// ────────────────────────────────────────────────────────────────────────
///  Pantalla de aprobaciones — listado simple (placeholder por ahora).
/// ────────────────────────────────────────────────────────────────────────
///
/// TODO: leer del KV global del Worker (necesita endpoint /api/approvals que
/// aún no existe — lo añadimos cuando integremos).

import 'package:flutter/material.dart';

class ApprovalsScreen extends StatelessWidget {
  const ApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Aprobaciones')),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Aquí se listarán las aprobaciones manuales registradas por todos los '
            'operarios (KV global del Worker). Próximamente.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
