/// ────────────────────────────────────────────────────────────────────────
///  Dashboard de métricas — espejo nativo de docs/metrics.html
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_client.dart';

class MetricsScreen extends ConsumerStatefulWidget {
  const MetricsScreen({super.key});

  @override
  ConsumerState<MetricsScreen> createState() => _MetricsScreenState();
}

class _MetricsScreenState extends ConsumerState<MetricsScreen> {
  Future<Map<String, dynamic>>? _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    final api = ref.read(apiClientProvider);
    if (api == null) {
      _future = Future.error(ApiException('Configura primero el proxy URL.'));
    } else {
      _future = api.metrics();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Métricas'),
        actions: [
          IconButton(
            tooltip: 'Refrescar',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => setState(_load),
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<Map<String, dynamic>>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return _ErrorState(
                error: snap.error.toString(),
                onRetry: () => setState(_load),
              );
            }
            final data = snap.data!;
            final summary =
                (data['summary'] as Map?)?.cast<String, dynamic>() ?? {};
            final series = ((data['series'] as List?) ?? const [])
                .cast<Map<String, dynamic>>();
            return _MetricsBody(summary: summary, series: series);
          },
        ),
      ),
    );
  }
}

class _MetricsBody extends StatelessWidget {
  final Map<String, dynamic> summary;
  final List<Map<String, dynamic>> series;
  const _MetricsBody({required this.summary, required this.series});

  @override
  Widget build(BuildContext context) {
    final totals = (summary['totals'] as Map?)?.cast<String, dynamic>() ?? {};
    final verdicts =
        (summary['verdicts'] as Map?)?.cast<String, dynamic>() ?? {};
    final sources =
        (summary['sources'] as Map?)?.cast<String, dynamic>() ?? {};
    final cacheHitRate = summary['cache_hit_rate_pct'];
    final avgLatency = summary['avg_latency_ms'];
    final errors = summary['errors'] ?? 0;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      children: [
        Text('ÚLTIMOS 14 DÍAS',
            style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 4),
        Text('Resumen', style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: _Kpi(
                label: 'AI checks',
                value: '${totals['ai_check'] ?? 0}',
                sub: '${totals['approve'] ?? 0} aprobaciones',
                color: HaloColors.accent,
                icon: Icons.bolt_rounded,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _Kpi(
                label: 'Cache hit',
                value: cacheHitRate != null ? '$cacheHitRate%' : '—',
                sub:
                    '${(sources['kv-cache'] ?? 0) + (sources['human-approval-cache'] ?? 0)} hits',
                color: HaloColors.ok,
                icon: Icons.flash_on_rounded,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _Kpi(
                label: 'Latencia',
                value: avgLatency != null ? '$avgLatency ms' : '—',
                sub: 'media 14d',
                color: HaloColors.accentBright,
                icon: Icons.speed_rounded,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _Kpi(
                label: 'Errores',
                value: '$errors',
                sub: errors == 0 ? 'sistema sano' : '⚠ revisa logs',
                color: errors == 0 ? HaloColors.ok : HaloColors.bad,
                icon: errors == 0
                    ? Icons.health_and_safety_rounded
                    : Icons.error_outline_rounded,
              ),
            ),
          ],
        ),
        if (series.isNotEmpty) ...[
          const SizedBox(height: 28),
          Text('AI CHECKS POR DÍA',
              style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 12),
          _BarChart(series: series),
        ],
        const SizedBox(height: 24),
        Text('VEREDICTOS', style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        _DistributionList(verdicts.cast<String, num>(), isVerdict: true),
        const SizedBox(height: 20),
        Text('ORIGEN DE LAS RESPUESTAS',
            style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        _DistributionList(sources.cast<String, num>(), isVerdict: false),
      ],
    );
  }
}

class _Kpi extends StatelessWidget {
  final String label;
  final String value;
  final String sub;
  final Color color;
  final IconData icon;
  const _Kpi({
    required this.label,
    required this.value,
    required this.sub,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border.all(color: HaloColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(7),
                ),
                child: Icon(icon, color: color, size: 14),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: HaloColors.fgMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: HaloColors.fg,
                height: 1.0,
              ),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            sub,
            style: const TextStyle(
              fontSize: 11,
              color: HaloColors.fgMuted,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _BarChart extends StatelessWidget {
  final List<Map<String, dynamic>> series;
  const _BarChart({required this.series});

  @override
  Widget build(BuildContext context) {
    final values = series
        .map((d) => (d['totals'] as Map?)?['ai_check'] as int? ?? 0)
        .toList();
    final maxV = values.fold<int>(1, (a, b) => a > b ? a : b);
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
      height: 180,
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border.all(color: HaloColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(series.length, (i) {
                final v = values[i];
                final h = (v / maxV).clamp(0.02, 1.0);
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 1.5),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Tooltip(
                          message:
                              '${series[i]['date']}\n$v llamadas',
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 400),
                            curve: Curves.easeOutCubic,
                            height: h * 130,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.bottomCenter,
                                end: Alignment.topCenter,
                                colors: [
                                  HaloColors.accentDim,
                                  HaloColors.accent,
                                ],
                              ),
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(series.length, (i) {
              final date = series[i]['date'] as String? ?? '';
              return Expanded(
                child: Text(
                  date.length >= 5 ? date.substring(5) : date,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 8.5,
                    color: HaloColors.fgFaint,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _DistributionList extends StatelessWidget {
  final Map<String, num> data;
  final bool isVerdict;
  const _DistributionList(this.data, {required this.isVerdict});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: HaloColors.surface,
          border: Border.all(color: HaloColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Text(
          'Sin datos aún. Validar nombres pobla este dashboard.',
          style: TextStyle(color: HaloColors.fgMuted, fontSize: 13),
        ),
      );
    }
    final total = data.values.fold<num>(0, (a, b) => a + b);
    final entries = data.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border.all(color: HaloColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: entries.map((e) {
          final pct = total > 0 ? (e.value / total * 100) : 0;
          final color = isVerdict
              ? HaloColors.verdict(e.key)
              : (e.key.contains('cache') || e.key.contains('approval'))
                  ? HaloColors.accent
                  : HaloColors.fgMuted;
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        isVerdict
                            ? HaloColors.verdictLabel(e.key)
                            : e.key,
                        style: TextStyle(
                          fontSize: 13,
                          color: color,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Text('${e.value}',
                        style: const TextStyle(
                          color: HaloColors.fg,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        )),
                    const SizedBox(width: 8),
                    Text(
                      '${pct.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        color: HaloColors.fgMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: Container(
                    height: 4,
                    color: HaloColors.surfaceMax,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: FractionallySizedBox(
                        widthFactor: (pct / 100).clamp(0.0, 1.0),
                        child: Container(color: color),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  const _ErrorState({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off_rounded,
                color: HaloColors.fgMuted, size: 48),
            const SizedBox(height: 16),
            Text('No se pudieron cargar las métricas',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: HaloColors.fgMuted,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
