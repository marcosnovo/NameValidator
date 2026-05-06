/// ────────────────────────────────────────────────────────────────────────
///  Diálogo de ajustes — proxy URL + operario + contexto.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
import '../../../core/network/api_client.dart';

class SettingsDialog extends ConsumerStatefulWidget {
  const SettingsDialog({super.key});

  @override
  ConsumerState<SettingsDialog> createState() => _SettingsDialogState();
}

class _SettingsDialogState extends ConsumerState<SettingsDialog> {
  late final TextEditingController _urlCtl;
  late final TextEditingController _opCtl;
  String _ctxId = 'real-madrid';
  String? _healthStatus;
  bool _testing = false;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _urlCtl = TextEditingController();
    _opCtl = TextEditingController();
    _hydrate();
  }

  Future<void> _hydrate() async {
    final prefs = ref.read(preferencesProvider);
    _urlCtl.text = (await prefs.getProxyUrl()) ?? '';
    _opCtl.text = (await prefs.getOperatorId()) ?? '';
    _ctxId = await prefs.getContextId();
    setState(() => _loaded = true);
  }

  Future<void> _save() async {
    final prefs = ref.read(preferencesProvider);
    await prefs.setProxyUrl(_urlCtl.text.trim());
    await prefs.setOperatorId(_opCtl.text.trim());
    await prefs.setContextId(_ctxId);
    // Invalidar para que los providers re-lean
    ref.invalidate(proxyUrlProvider);
    ref.invalidate(operatorIdProvider);
    ref.invalidate(contextIdProvider);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _test() async {
    setState(() {
      _testing = true;
      _healthStatus = null;
    });
    try {
      final api = ApiClient(baseUrl: _urlCtl.text.trim());
      final h = await api.health();
      setState(() {
        _healthStatus = '✓ ${h['ai_layer'] == true ? 'AI activa' : 'AI inactiva'}'
            ' · ${h['kv_layer'] == true ? 'KV activa' : 'KV inactiva'}';
      });
      api.dispose();
    } on ApiException catch (e) {
      setState(() => _healthStatus = '✗ ${e.message}');
    } finally {
      if (mounted) setState(() => _testing = false);
    }
  }

  @override
  void dispose() {
    _urlCtl.dispose();
    _opCtl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return const Dialog(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }
    return AlertDialog(
      title: const Text('Ajustes'),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _urlCtl,
              decoration: const InputDecoration(
                labelText: 'Proxy URL',
                hintText: 'https://halo-proxy.<sub>.workers.dev',
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _testing ? null : _test,
                    icon: _testing
                        ? const SizedBox(
                            height: 14,
                            width: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.network_check, size: 18),
                    label: const Text('Probar conexión'),
                  ),
                ),
              ],
            ),
            if (_healthStatus != null) ...[
              const SizedBox(height: 8),
              Text(_healthStatus!, style: const TextStyle(fontSize: 12)),
            ],
            const SizedBox(height: 16),
            TextField(
              controller: _opCtl,
              decoration: const InputDecoration(
                labelText: 'ID del operario',
                hintText: 'ej: marcos.novo',
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _ctxId,
              decoration: const InputDecoration(labelText: 'Contexto'),
              items: const [
                DropdownMenuItem(value: 'real-madrid', child: Text('Real Madrid C.F.')),
                DropdownMenuItem(value: 'fc-barcelona', child: Text('FC Barcelona')),
              ],
              onChanged: (v) => setState(() => _ctxId = v ?? 'real-madrid'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        FilledButton(onPressed: _save, child: const Text('Guardar')),
      ],
    );
  }
}
