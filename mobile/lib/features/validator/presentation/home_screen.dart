/// ────────────────────────────────────────────────────────────────────────
///  Home — pantalla principal del HALO Validator
/// ────────────────────────────────────────────────────────────────────────
///
/// Hero visual estilo LED del Bernabéu + input principal + atajos.
/// Recientes en sesión para feedback rápido al operario.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers.dart';
import '../../../app/router.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/validator/format_check.dart';
import '../../../core/validator/static_check.dart';
import 'settings_dialog.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  bool _busy = false;
  String? _localError;

  Future<void> _validate() async {
    final input = _controller.text.trim();
    if (input.isEmpty) return;

    HapticFeedback.lightImpact();

    final fmt = formatCheck(input);
    if (fmt.hasBlockingIssue) {
      final issue = fmt.issues.first;
      setState(() => _localError = _localizeFormatIssue(issue));
      HapticFeedback.heavyImpact();
      return;
    }

    // ── FAST-PATH LOCAL ─────────────────────────────────────────────
    // Profanity check Dart-local (ES/EN/FR + jokes). Si pilla algo HIGH
    // ya rechazamos sin gastar llamada al Worker. Cubre ~70% del tráfico
    // ofensivo "obvio" en <1ms.
    final local = localStaticCheck(input);
    if (local.verdict == 'REJECTED' && !local.needsAi) {
      ref.read(recentValidationsProvider.notifier).add(input, 'REJECTED');
      HapticFeedback.heavyImpact();
      if (!mounted) return;
      context.push(AppRoutes.result, extra: {
        'input': input,
        'verdict': {
          'verdict': 'REJECTED',
          'confidence_offensive': local.doubt,
          'languages_with_issue': [for (final i in local.issues) i.lang ?? 'other'],
          'categories': [for (final i in local.issues) i.category],
          'rationale': 'Detectado localmente en <1ms — sin gastar AI.',
          'reasons': [
            for (final i in local.issues)
              {
                'severity': i.severity,
                'source': 'static.${i.lang ?? "?"}.${i.category}',
                'message': i.message ?? '',
              },
          ],
          'source': 'local-fast-path',
        },
      });
      _controller.clear();
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
        _localError = 'Configura primero la URL del proxy en ajustes ⚙';
      });
      HapticFeedback.heavyImpact();
      return;
    }

    try {
      final result = await api.aiCheck(input, context: ctxId);
      ref.read(recentValidationsProvider.notifier).add(
            input,
            (result['verdict'] ?? '—').toString(),
          );
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      context.push(AppRoutes.result, extra: {
        'input': input,
        'verdict': result,
      });
      _controller.clear();
    } on ApiException catch (e) {
      setState(() => _localError = e.message);
      HapticFeedback.heavyImpact();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _localizeFormatIssue(FormatIssue issue) {
    switch (issue.code) {
      case 'too-short':
        return 'Escribe al menos un carácter.';
      case 'too-long':
        return issue.detail ?? 'Demasiado largo.';
      case 'invalid-chars':
        return 'Sólo letras, espacios, apóstrofes, guiones y puntos.';
      default:
        return issue.detail ?? issue.code;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ctxId = ref.watch(contextIdProvider).maybeWhen(
          data: (v) => v,
          orElse: () => 'real-madrid',
        );

    final recent = ref.watch(recentValidationsProvider);
    final hasProxy = ref.watch(proxyUrlProvider).maybeWhen(
          data: (v) => v != null && v.isNotEmpty,
          orElse: () => false,
        );

    return Scaffold(
      body: SafeArea(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: Column(
            children: [
              _AppBar(
                contextId: ctxId,
                hasProxy: hasProxy,
                onMetrics: () => context.push(AppRoutes.metrics),
                onApprovals: () => context.push(AppRoutes.approvals),
                onSettings: () => showDialog(
                  context: context,
                  builder: (_) => const SettingsDialog(),
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                  children: [
                    const SizedBox(height: 16),
                    const _HaloHero(),
                    const SizedBox(height: 32),
                    Text(
                      'Validador HALO',
                      style: Theme.of(context).textTheme.displayLarge,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Comprueba si un nombre puede mostrarse en el anillo LED del Bernabéu.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: HaloColors.fgMuted,
                          ),
                    ),
                    const SizedBox(height: 28),
                    _NameInput(
                      controller: _controller,
                      focusNode: _focusNode,
                      busy: _busy,
                      onSubmitted: (_) => _validate(),
                    ),
                    if (_localError != null) ...[
                      const SizedBox(height: 10),
                      _ErrorBanner(message: _localError!),
                    ],
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: _busy ? null : _validate,
                      child: _busy
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.4,
                                color: HaloColors.bg,
                              ),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('Validar nombre'),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward_rounded, size: 18),
                              ],
                            ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _busy ? null : () async {
                        final picked = await context.push<String>(AppRoutes.scanner);
                        if (picked != null && picked.isNotEmpty && mounted) {
                          _controller.text = picked;
                          _focusNode.requestFocus();
                        }
                      },
                      icon: const Icon(Icons.document_scanner_rounded, size: 18),
                      label: const Text('Escanear DNI / pasaporte'),
                    ),
                    const SizedBox(height: 32),
                    if (recent.isNotEmpty) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'RECIENTES',
                            style: Theme.of(context).textTheme.labelLarge,
                          ),
                          TextButton(
                            onPressed: () =>
                                ref.read(recentValidationsProvider.notifier).clear(),
                            child: const Text('Limpiar'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...recent.map((e) => _RecentTile(
                            entry: e,
                            onTap: () {
                              _controller.text = e.input;
                              _focusNode.requestFocus();
                            },
                          )),
                    ] else ...[
                      const _EmptyHint(),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Componentes ─────────────────────────────────────────────────────────

class _AppBar extends StatelessWidget {
  final String contextId;
  final bool hasProxy;
  final VoidCallback onMetrics;
  final VoidCallback onApprovals;
  final VoidCallback onSettings;
  const _AppBar({
    required this.contextId,
    required this.hasProxy,
    required this.onMetrics,
    required this.onApprovals,
    required this.onSettings,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 12, 12),
      child: Row(
        children: [
          // Logo + brand
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const SweepGradient(
                colors: [
                  HaloColors.accent,
                  HaloColors.accentBright,
                  HaloColors.accent,
                  HaloColors.accentDim,
                  HaloColors.accent,
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: HaloColors.accent.withValues(alpha: 0.3),
                  blurRadius: 16,
                  spreadRadius: 0,
                ),
              ],
            ),
            child: const Center(
              child: Padding(
                padding: EdgeInsets.all(2),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: HaloColors.bg,
                  ),
                  child: Center(
                    child: Icon(Icons.stadium_rounded,
                        size: 18, color: HaloColors.accent),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'HALO Validator',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: HaloColors.fg,
                    letterSpacing: -0.2,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: hasProxy ? HaloColors.ok : HaloColors.warn,
                        boxShadow: [
                          BoxShadow(
                            color: (hasProxy ? HaloColors.ok : HaloColors.warn)
                                .withValues(alpha: 0.5),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      hasProxy
                          ? 'Conectado · ${_displayContext(contextId)}'
                          : 'Sin proxy · configura',
                      style: const TextStyle(
                        fontSize: 11,
                        color: HaloColors.fgMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Métricas',
            onPressed: onMetrics,
            icon: const Icon(Icons.bar_chart_rounded),
          ),
          IconButton(
            tooltip: 'Aprobaciones',
            onPressed: onApprovals,
            icon: const Icon(Icons.verified_rounded),
          ),
          IconButton(
            tooltip: 'Ajustes',
            onPressed: onSettings,
            icon: const Icon(Icons.settings_rounded),
          ),
        ],
      ),
    );
  }

  String _displayContext(String id) {
    switch (id) {
      case 'real-madrid':
        return 'Real Madrid';
      case 'fc-barcelona':
        return 'FC Barcelona';
      default:
        return id;
    }
  }
}

class _HaloHero extends StatefulWidget {
  const _HaloHero();

  @override
  State<_HaloHero> createState() => _HaloHeroState();
}

class _HaloHeroState extends State<_HaloHero>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        height: 140,
        width: 220,
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) {
            return CustomPaint(
              painter: _HaloPainter(progress: _ctrl.value),
            );
          },
        ),
      ),
    );
  }
}

class _HaloPainter extends CustomPainter {
  final double progress;
  _HaloPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2 + 18;
    final rx = size.width / 2 - 14;
    final ry = size.height / 2 - 12;

    // Fondo glow
    final glowPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          HaloColors.accent.withValues(alpha: 0.28),
          HaloColors.accent.withValues(alpha: 0.0),
        ],
      ).createShader(Rect.fromCircle(
          center: Offset(cx, cy), radius: size.width * 0.6));
    canvas.drawCircle(Offset(cx, cy), size.width * 0.55, glowPaint);

    // Anillo base
    final basePaint = Paint()
      ..color = HaloColors.accentDim.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    canvas.drawOval(Rect.fromCenter(center: Offset(cx, cy), width: rx * 2, height: ry * 2), basePaint);

    // LED puntos rotando alrededor del anillo
    const int n = 64;
    for (int i = 0; i < n; i++) {
      final t = i / n;
      final angle = t * 2 * math.pi + progress * 2 * math.pi;
      final dx = cx + rx * math.cos(angle);
      final dy = cy + ry * math.sin(angle);
      // Brillo decae con la distancia al líder de la rotación
      final dist = ((t - progress) % 1.0).abs();
      final a = (1.0 - (dist * 6).clamp(0.0, 1.0)).clamp(0.0, 1.0);
      final dotPaint = Paint()
        ..color = HaloColors.accentBright.withValues(alpha: 0.25 + a * 0.75)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(dx, dy), 2.0 + a * 1.5, dotPaint);
    }

    // Sombra base — alude al ovalado del estadio
    final stadiumPaint = Paint()
      ..color = HaloColors.surface
      ..style = PaintingStyle.fill;
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(cx, cy + ry * 0.85),
        width: rx * 1.6,
        height: ry * 0.4,
      ),
      stadiumPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _HaloPainter oldDelegate) =>
      oldDelegate.progress != progress;
}

class _NameInput extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool busy;
  final ValueChanged<String> onSubmitted;
  const _NameInput({
    required this.controller,
    required this.focusNode,
    required this.busy,
    required this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      enabled: !busy,
      autofocus: false,
      maxLength: 30,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: HaloColors.fg,
        letterSpacing: 0.2,
      ),
      cursorColor: HaloColors.accent,
      textInputAction: TextInputAction.go,
      onSubmitted: onSubmitted,
      decoration: const InputDecoration(
        labelText: 'Nombre del aficionado',
        hintText: 'Ej: Carlos García López',
        prefixIcon: Padding(
          padding: EdgeInsets.only(left: 16, right: 8),
          child: Icon(Icons.person_rounded, size: 20),
        ),
        prefixIconConstraints: BoxConstraints(minWidth: 44),
        counterText: '',
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: HaloColors.bad.withValues(alpha: 0.14),
        border: Border.all(color: HaloColors.bad.withValues(alpha: 0.4)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_rounded, color: HaloColors.bad, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: HaloColors.bad,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentTile extends StatelessWidget {
  final RecentEntry entry;
  final VoidCallback onTap;
  const _RecentTile({required this.entry, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final color = HaloColors.verdict(entry.verdict);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: HaloColors.surface,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: HaloColors.border),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(HaloColors.verdictIcon(entry.verdict),
                    color: color, size: 18),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.input,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: HaloColors.fg,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        HaloColors.verdictLabel(entry.verdict),
                        style: TextStyle(
                          fontSize: 11,
                          color: color,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.6,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded,
                    color: HaloColors.fgFaint, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyHint extends StatelessWidget {
  const _EmptyHint();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border.all(color: HaloColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: HaloColors.accent.withValues(alpha: 0.14),
            ),
            child: const Icon(Icons.tips_and_updates_rounded,
                color: HaloColors.accent, size: 18),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Las validaciones recientes aparecerán aquí. Toca cualquiera para revalidar.',
              style: TextStyle(fontSize: 12.5, color: HaloColors.fgMuted, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
