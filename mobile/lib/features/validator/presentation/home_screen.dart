/// ────────────────────────────────────────────────────────────────────────
///  Pantalla principal — input de nombre + botón Validar + atajos
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers.dart';
import '../../../app/router.dart';
import '../../../core/network/api_client.dart';
import '../../../core/validator/format_check.dart';
import 'settings_dialog.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _controller = TextEditingController();
  bool _busy = false;
  String? _localError;

  Future<void> _validate() async {
    final input = _controller.text.trim();
    if (input.isEmpty) return;

    // 1. Formato local — instantáneo, no requiere red.
    final fmt = formatCheck(input);
    if (fmt.hasBlockingIssue) {
      setState(() => _localError =
          'Formato inválido: ${fmt.issues.first.code}${fmt.issues.first.detail != null ? ' (${fmt.issues.first.detail})' : ''}');
      return;
    }

    setState(() {
      _localError = null;
      _busy = true;
    });

    final api = ref.read(apiClientProvider);
    final ctxId = await ref.read(contextIdProvider.future);

    if (api == null) {
      setState(() {
        _busy = false;
        _localError = 'No hay proxy configurado. Pulsa el icono de ajustes.';
      });
      return;
    }

    try {
      final result = await api.aiCheck(input, context: ctxId);
      if (!mounted) return;
      context.push(AppRoutes.result, extra: {
        'input': input,
        'verdict': result,
      });
    } on ApiException catch (e) {
      setState(() => _localError = 'Error: ${e.message}');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctxId = ref.watch(contextIdProvider).maybeWhen(
          data: (v) => v,
          orElse: () => 'real-madrid',
        );

    return Scaffold(
      appBar: AppBar(
        title: const Text('HALO Validator'),
        actions: [
          IconButton(
            tooltip: 'Métricas',
            icon: const Icon(Icons.bar_chart),
            onPressed: () => context.push(AppRoutes.metrics),
          ),
          IconButton(
            tooltip: 'Aprobaciones',
            icon: const Icon(Icons.check_circle_outline),
            onPressed: () => context.push(AppRoutes.approvals),
          ),
          IconButton(
            tooltip: 'Ajustes',
            icon: const Icon(Icons.settings),
            onPressed: () => showDialog(
              context: context,
              builder: (_) => const SettingsDialog(),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Contexto: $ctxId',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _controller,
              autofocus: true,
              textInputAction: TextInputAction.go,
              onSubmitted: (_) => _validate(),
              maxLength: 30,
              style: const TextStyle(fontSize: 18),
              decoration: const InputDecoration(
                labelText: 'Nombre a validar',
                hintText: 'Ej: Carlos García López',
              ),
            ),
            if (_localError != null) ...[
              const SizedBox(height: 8),
              Text(
                _localError!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _busy ? null : _validate,
              icon: _busy
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.check),
              label: Text(_busy ? 'Validando…' : 'Validar'),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => context.push(AppRoutes.scanner),
              icon: const Icon(Icons.document_scanner_outlined),
              label: const Text('Escanear DNI / pasaporte'),
            ),
          ],
        ),
      ),
    );
  }
}
