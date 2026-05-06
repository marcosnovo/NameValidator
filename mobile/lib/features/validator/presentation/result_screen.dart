/// ────────────────────────────────────────────────────────────────────────
///  Resultado — verdict card grande con motivos y aprobación humana.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers.dart';
import '../../../app/theme.dart';
import '../../../core/network/api_client.dart';

class ResultScreen extends ConsumerStatefulWidget {
  final String input;
  final Map<String, dynamic>? verdict;
  const ResultScreen({super.key, required this.input, required this.verdict});

  @override
  ConsumerState<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends ConsumerState<ResultScreen>
    with SingleTickerProviderStateMixin {
  bool _approving = false;
  late final AnimationController _appearCtrl;

  @override
  void initState() {
    super.initState();
    _appearCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..forward();
  }

  @override
  void dispose() {
    _appearCtrl.dispose();
    super.dispose();
  }

  Future<void> _approve() async {
    final api = ref.read(apiClientProvider);
    final operatorId = await ref.read(operatorIdProvider.future);
    if (api == null || operatorId == null || operatorId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Configura proxy URL e ID de operario primero.'),
        ),
      );
      return;
    }
    HapticFeedback.mediumImpact();
    setState(() => _approving = true);
    try {
      await api.approve(input: widget.input, approverId: operatorId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✓ Aprobado y propagado al KV global')),
      );
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.message}')),
      );
    } finally {
      if (mounted) setState(() => _approving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final v = widget.verdict;
    final verdict = v?['verdict'] as String?;
    final color = HaloColors.verdict(verdict);
    final reasons = ((v?['reasons'] as List?) ?? const [])
        .cast<Map<String, dynamic>>();
    final source = v?['source'] as String?;
    final cacheHit = v?['cache_hit'] == true;
    final confidence = v?['confidence_offensive'] as int? ?? v?['doubt_percent'] as int?;
    final phonetic = v?['phonetic_reading'] as String?;
    final rationale = v?['rationale'] as String?;

    final canApprove = verdict == 'REVIEW' || verdict == 'SUSPICIOUS';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Resultado'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            // ── Input echoed
            Text(
              'INPUT',
              style: Theme.of(context).textTheme.labelLarge,
            ),
            const SizedBox(height: 6),
            SelectableText(
              widget.input,
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    height: 1.1,
                  ),
            ),
            const SizedBox(height: 28),

            // ── Verdict card grande con animación de aparición
            FadeTransition(
              opacity: _appearCtrl,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.92, end: 1.0).animate(
                  CurvedAnimation(parent: _appearCtrl, curve: Curves.easeOutBack),
                ),
                child: _VerdictCard(
                  verdict: verdict,
                  color: color,
                  confidence: confidence,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Source pill
            if (source != null) _SourcePill(source: source, cacheHit: cacheHit),

            // ── Lectura fonética (si la AI la dio)
            if (phonetic != null && phonetic.isNotEmpty) ...[
              const SizedBox(height: 20),
              _Section(label: 'LECTURA FONÉTICA', child: SelectableText(
                '"$phonetic"',
                style: const TextStyle(
                  fontSize: 15,
                  color: HaloColors.fg,
                  fontStyle: FontStyle.italic,
                ),
              )),
            ],

            // ── Razonamiento AI
            if (rationale != null && rationale.isNotEmpty) ...[
              const SizedBox(height: 20),
              _Section(label: 'ANÁLISIS', child: Text(
                rationale,
                style: const TextStyle(fontSize: 14, color: HaloColors.fg, height: 1.5),
              )),
            ],

            // ── Motivos detallados
            if (reasons.isNotEmpty) ...[
              const SizedBox(height: 20),
              Text('MOTIVOS · ${reasons.length}',
                  style: Theme.of(context).textTheme.labelLarge),
              const SizedBox(height: 10),
              ...reasons.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _ReasonCard(reason: r),
                  )),
            ],

            const SizedBox(height: 28),

            // ── Acciones
            if (canApprove)
              FilledButton.icon(
                onPressed: _approving ? null : _approve,
                icon: _approving
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: HaloColors.bg,
                        ),
                      )
                    : const Icon(Icons.verified_rounded, size: 18),
                label: Text(_approving
                    ? 'Aprobando…'
                    : 'Aprobar manualmente (operario)'),
              ),
            if (canApprove) const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).pop(),
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Validar otro nombre'),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerdictCard extends StatelessWidget {
  final String? verdict;
  final Color color;
  final int? confidence;
  const _VerdictCard({
    required this.verdict,
    required this.color,
    required this.confidence,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha: 0.20),
            color.withValues(alpha: 0.08),
          ],
        ),
        border: Border.all(color: color.withValues(alpha: 0.5), width: 1),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.15),
            blurRadius: 24,
            spreadRadius: -8,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withValues(alpha: 0.18),
              border: Border.all(color: color.withValues(alpha: 0.5), width: 2),
            ),
            child: Icon(
              HaloColors.verdictIcon(verdict),
              color: color,
              size: 38,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            HaloColors.verdictLabel(verdict),
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: color,
              letterSpacing: 2,
            ),
          ),
          if (confidence != null) ...[
            const SizedBox(height: 14),
            // Barra de duda/confianza
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: Container(
                height: 6,
                width: 220,
                color: HaloColors.surfaceMax,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: FractionallySizedBox(
                    widthFactor: (confidence!.clamp(0, 100)) / 100,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [color.withValues(alpha: 0.6), color],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Riesgo $confidence%',
              style: TextStyle(
                color: color.withValues(alpha: 0.9),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.4,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SourcePill extends StatelessWidget {
  final String source;
  final bool cacheHit;
  const _SourcePill({required this.source, required this.cacheHit});

  @override
  Widget build(BuildContext context) {
    final isCache = cacheHit || source.contains('cache');
    final isApproval = source.contains('approval');
    final icon = isApproval
        ? Icons.verified_rounded
        : isCache
            ? Icons.flash_on_rounded
            : Icons.cloud_rounded;
    final color = isApproval
        ? HaloColors.ok
        : isCache
            ? HaloColors.accent
            : HaloColors.fgMuted;
    final label = isApproval
        ? 'Aprobación humana previa'
        : isCache
            ? 'Caché KV (instantáneo)'
            : 'Anthropic AI (semántica)';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String label;
  final Widget child;
  const _Section({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: HaloColors.surface,
            border: Border.all(color: HaloColors.border),
            borderRadius: BorderRadius.circular(12),
          ),
          width: double.infinity,
          child: child,
        ),
      ],
    );
  }
}

class _ReasonCard extends StatelessWidget {
  final Map<String, dynamic> reason;
  const _ReasonCard({required this.reason});

  @override
  Widget build(BuildContext context) {
    final severity = reason['severity'] as String? ?? 'low';
    final source = (reason['source'] as String?) ?? '—';
    final message = reason['message']?.toString() ?? '';
    final color = severity == 'high'
        ? HaloColors.bad
        : severity == 'medium'
            ? HaloColors.warn
            : HaloColors.fgMuted;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: HaloColors.surface,
        border: Border(
          left: BorderSide(color: color, width: 3),
          top: const BorderSide(color: HaloColors.border),
          right: const BorderSide(color: HaloColors.border),
          bottom: const BorderSide(color: HaloColors.border),
        ),
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(10),
          bottomRight: Radius.circular(10),
          topLeft: Radius.circular(2),
          bottomLeft: Radius.circular(2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  severity.toUpperCase(),
                  style: TextStyle(
                    color: color,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  source,
                  style: const TextStyle(
                    color: HaloColors.fgMuted,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'monospace',
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: const TextStyle(
              fontSize: 13.5,
              color: HaloColors.fg,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
