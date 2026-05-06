/// ────────────────────────────────────────────────────────────────────────
///  Resultado de validación + acción de aprobación humana.
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
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

class _ResultScreenState extends ConsumerState<ResultScreen> {
  bool _approving = false;

  Future<void> _approve() async {
    final api = ref.read(apiClientProvider);
    final operatorId = await ref.read(operatorIdProvider.future);
    if (api == null || operatorId == null || operatorId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Configura proxy URL e ID de operario primero.')),
      );
      return;
    }
    setState(() => _approving = true);
    try {
      await api.approve(input: widget.input, approverId: operatorId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✓ Aprobado y propagado al KV global.')),
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
    final verdict = widget.verdict?['verdict'] as String?;
    final color = HaloTheme.verdictColor(verdict);
    final reasons = (widget.verdict?['reasons'] as List?)
            ?.cast<Map<String, dynamic>>() ??
        const [];
    final source = widget.verdict?['source'] as String?;
    final cacheHit = widget.verdict?['cache_hit'] == true;

    return Scaffold(
      appBar: AppBar(title: const Text('Resultado')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.input,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border(left: BorderSide(color: color, width: 4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    verdict ?? '—',
                    style: TextStyle(
                      color: color,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (widget.verdict?['confidence_offensive'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Duda: ${widget.verdict!['confidence_offensive']}%',
                      style: TextStyle(color: color.withOpacity(0.85)),
                    ),
                  ],
                ],
              ),
            ),
            if (source != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    cacheHit ? Icons.flash_on : Icons.cloud,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    cacheHit ? 'Caché ($source)' : 'Source: $source',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
            const SizedBox(height: 24),
            if (reasons.isNotEmpty) ...[
              Text('Motivos', style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              ...reasons.map((r) => _ReasonTile(r)).toList(),
              const SizedBox(height: 24),
            ],
            if (verdict == 'REVIEW' || verdict == 'SUSPICIOUS') ...[
              FilledButton.icon(
                onPressed: _approving ? null : _approve,
                icon: _approving
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check),
                label: Text(_approving
                    ? 'Aprobando…'
                    : 'Aprobar manualmente (operario)'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ReasonTile extends StatelessWidget {
  final Map<String, dynamic> reason;
  const _ReasonTile(this.reason);

  @override
  Widget build(BuildContext context) {
    final severity = reason['severity'] as String?;
    final source = reason['source'] as String?;
    final message = reason['message']?.toString() ?? '';
    final color = severity == 'high'
        ? Theme.of(context).colorScheme.error
        : severity == 'medium'
            ? const Color(0xFFFBBF24)
            : Theme.of(context).colorScheme.onSurface;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 6, right: 8),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  source ?? '—',
                  style: TextStyle(
                    color: color,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                  ),
                ),
                Text(message, style: const TextStyle(fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
