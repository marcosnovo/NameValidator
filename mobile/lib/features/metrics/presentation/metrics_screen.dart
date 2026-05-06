/// ────────────────────────────────────────────────────────────────────────
///  Dashboard de métricas — espejo nativo de docs/metrics.html
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/providers.dart';
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
        title: const Text('Métricas — 14 días'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => setState(_load),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text('Error: ${snap.error}', textAlign: TextAlign.center),
              ),
            );
          }
          final data = snap.data!;
          final summary = (data['summary'] as Map?)?.cast<String, dynamic>() ?? {};
          final series = ((data['series'] as List?) ?? const [])
              .cast<Map<String, dynamic>>();
          return _MetricsBody(summary: summary, series: series);
        },
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
    final verdicts = (summary['verdicts'] as Map?)?.cast<String, dynamic>() ?? {};
    final sources = (summary['sources'] as Map?)?.cast<String, dynamic>() ?? {};
    final cacheHitRate = summary['cache_hit_rate_pct'];
    final avgLatency = summary['avg_latency_ms'];
    final errors = summary['errors'] ?? 0;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            _Kpi(
              label: 'AI checks',
              value: '${totals['ai_check'] ?? 0}',
              sub: '${totals['approve'] ?? 0} aprobaciones',
            ),
            const SizedBox(width: 8),
            _Kpi(
              label: 'Cache hit',
              value: cacheHitRate != null ? '$cacheHitRate%' : '—',
              sub: '${(sources['kv-cache'] ?? 0)} cache',
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            _Kpi(
              label: 'Latencia',
              value: avgLatency != null ? '$avgLatency ms' : '—',
              sub: 'media 14d',
            ),
            const SizedBox(width: 8),
            _Kpi(
              label: 'Errores',
              value: '$errors',
              sub: errors == 0 ? 'sano' : '⚠ revisa logs',
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text('Veredictos', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 8),
        _DistributionTable(verdicts.cast<String, num>()),
        const SizedBox(height: 24),
        Text('Origen de las respuestas', style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 8),
        _DistributionTable(sources.cast<String, num>()),
      ],
    );
  }
}

class _Kpi extends StatelessWidget {
  final String label;
  final String value;
  final String sub;
  const _Kpi({required this.label, required this.value, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border.all(color: Theme.of(context).colorScheme.onSurface.withOpacity(0.1)),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                fontSize: 10,
                letterSpacing: 0.6,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            const SizedBox(height: 2),
            Text(
              sub,
              style: TextStyle(
                fontSize: 11,
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.55),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DistributionTable extends StatelessWidget {
  final Map<String, num> data;
  const _DistributionTable(this.data);

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'Sin datos aún.',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
          ),
        ),
      );
    }
    final total = data.values.fold<num>(0, (a, b) => a + b);
    final entries = data.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return Column(
      children: entries.map((e) {
        final pct = total > 0 ? (e.value / total * 100).round() : 0;
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Expanded(child: Text(e.key, style: const TextStyle(fontSize: 13))),
              Text('${e.value}', style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Text(
                '$pct%',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.55),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
