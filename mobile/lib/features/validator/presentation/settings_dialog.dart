/// ────────────────────────────────────────────────────────────────────────
///  Settings dialog — proxy URL + ID operario + contexto.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
import '../../../app/theme.dart';
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
  bool _healthOk = false;
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
    if (mounted) setState(() => _loaded = true);
  }

  Future<void> _save() async {
    final prefs = ref.read(preferencesProvider);
    await prefs.setProxyUrl(_urlCtl.text.trim());
    await prefs.setOperatorId(_opCtl.text.trim());
    await prefs.setContextId(_ctxId);
    ref.invalidate(proxyUrlProvider);
    ref.invalidate(operatorIdProvider);
    ref.invalidate(contextIdProvider);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  Future<void> _test() async {
    if (_urlCtl.text.trim().isEmpty) {
      setState(() {
        _healthStatus = 'Pega primero la URL del Worker';
        _healthOk = false;
      });
      return;
    }
    setState(() {
      _testing = true;
      _healthStatus = null;
    });
    final api = ApiClient(baseUrl: _urlCtl.text.trim());
    try {
      final h = await api.health();
      setState(() {
        _healthOk = true;
        _healthStatus =
            'AI ${h['ai_layer'] == true ? '✓' : '✗'} · KV ${h['kv_layer'] == true ? '✓' : '✗'} · ${h['model'] ?? 'modelo'}';
      });
    } on ApiException catch (e) {
      setState(() {
        _healthOk = false;
        _healthStatus = e.message;
      });
    } finally {
      api.dispose();
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
        child: SizedBox(
          height: 200,
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  const Icon(Icons.settings_rounded,
                      size: 20, color: HaloColors.accent),
                  const SizedBox(width: 8),
                  const Text('Configuración',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: HaloColors.fg,
                      )),
                  const Spacer(),
                  IconButton(
                    iconSize: 20,
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded,
                        color: HaloColors.fgMuted),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Worker URL
              _Label('PROXY URL'),
              const SizedBox(height: 6),
              TextField(
                controller: _urlCtl,
                keyboardType: TextInputType.url,
                style: const TextStyle(fontSize: 14, color: HaloColors.fg),
                decoration: const InputDecoration(
                  hintText: 'https://halo-proxy.<sub>.workers.dev',
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(left: 12, right: 6),
                    child: Icon(Icons.link_rounded, size: 18),
                  ),
                  prefixIconConstraints: BoxConstraints(minWidth: 36),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _testing ? null : _test,
                  icon: _testing
                      ? const SizedBox(
                          height: 14,
                          width: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.network_check_rounded, size: 16),
                  label: const Text('Probar conexión'),
                ),
              ),
              if (_healthStatus != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: (_healthOk ? HaloColors.ok : HaloColors.bad)
                        .withValues(alpha: 0.10),
                    border: Border.all(
                      color: (_healthOk ? HaloColors.ok : HaloColors.bad)
                          .withValues(alpha: 0.3),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _healthOk
                            ? Icons.check_circle_rounded
                            : Icons.error_rounded,
                        size: 14,
                        color: _healthOk ? HaloColors.ok : HaloColors.bad,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _healthStatus!,
                          style: TextStyle(
                            fontSize: 12,
                            color: _healthOk ? HaloColors.ok : HaloColors.bad,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 18),
              _Label('ID DEL OPERARIO'),
              const SizedBox(height: 6),
              TextField(
                controller: _opCtl,
                style: const TextStyle(fontSize: 14, color: HaloColors.fg),
                decoration: const InputDecoration(
                  hintText: 'ej. marcos.novo',
                  prefixIcon: Padding(
                    padding: EdgeInsets.only(left: 12, right: 6),
                    child: Icon(Icons.badge_rounded, size: 18),
                  ),
                  prefixIconConstraints: BoxConstraints(minWidth: 36),
                ),
              ),

              const SizedBox(height: 18),
              _Label('CONTEXTO DE CLIENTE'),
              const SizedBox(height: 6),
              Container(
                decoration: BoxDecoration(
                  color: HaloColors.surfaceHigh,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: HaloColors.border),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _ctxId,
                      isExpanded: true,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded,
                          color: HaloColors.fgMuted),
                      dropdownColor: HaloColors.surfaceMax,
                      style: const TextStyle(color: HaloColors.fg, fontSize: 14),
                      items: const [
                        DropdownMenuItem(
                          value: 'real-madrid',
                          child: Text('Real Madrid C.F.'),
                        ),
                        DropdownMenuItem(
                          value: 'fc-barcelona',
                          child: Text('FC Barcelona'),
                        ),
                      ],
                      onChanged: (v) =>
                          setState(() => _ctxId = v ?? 'real-madrid'),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton(
                      onPressed: _save,
                      child: const Text('Guardar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: Theme.of(context).textTheme.labelLarge);
  }
}
