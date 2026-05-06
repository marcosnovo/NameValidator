/// ────────────────────────────────────────────────────────────────────────
///  Providers globales (Riverpod).
/// ────────────────────────────────────────────────────────────────────────
///
/// Auto-configuración:
/// El usuario puede pasar valores por defecto al lanzar la app con
///   flutter run --dart-define=WORKER_URL=https://...
///                --dart-define=OPERATOR_ID=marcos
///                --dart-define=CONTEXT_ID=real-madrid
/// Si no hay preferencia guardada, los providers caen a estos defaults.
/// La primera vez que arranca la app con dart-defines, los persiste a
/// SharedPreferences automáticamente para que aparezcan en el dialog de
/// settings (visible al operario).

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_client.dart';
import '../core/storage/preferences_service.dart';

const _envWorkerUrl = String.fromEnvironment('WORKER_URL', defaultValue: '');
const _envOperatorId = String.fromEnvironment('OPERATOR_ID', defaultValue: '');
const _envContextId =
    String.fromEnvironment('CONTEXT_ID', defaultValue: 'real-madrid');

final preferencesProvider = Provider<PreferencesService>((ref) {
  return PreferencesService();
});

/// URL del Cloudflare Worker. Null hasta que se configure.
/// Si hay --dart-define=WORKER_URL al build y no hay preferencia, persiste el
/// valor del env y lo devuelve.
final proxyUrlProvider = FutureProvider<String?>((ref) async {
  final prefs = ref.read(preferencesProvider);
  final stored = await prefs.getProxyUrl();
  if (stored != null && stored.isNotEmpty) return stored;
  if (_envWorkerUrl.isNotEmpty) {
    await prefs.setProxyUrl(_envWorkerUrl);
    return _envWorkerUrl;
  }
  return null;
});

final operatorIdProvider = FutureProvider<String?>((ref) async {
  final prefs = ref.read(preferencesProvider);
  final stored = await prefs.getOperatorId();
  if (stored != null && stored.isNotEmpty) return stored;
  if (_envOperatorId.isNotEmpty) {
    await prefs.setOperatorId(_envOperatorId);
    return _envOperatorId;
  }
  return null;
});

final contextIdProvider = FutureProvider<String>((ref) async {
  final prefs = ref.read(preferencesProvider);
  final stored = await prefs.getContextId();
  if (stored.isNotEmpty && stored != 'real-madrid') return stored;
  // Si no hay preferencia explícita, persistir el env (si difiere) o real-madrid.
  if (_envContextId.isNotEmpty && _envContextId != stored) {
    await prefs.setContextId(_envContextId);
    return _envContextId;
  }
  return stored;
});

/// Cliente HTTP del Worker — null si aún no hay URL configurada.
final apiClientProvider = Provider<ApiClient?>((ref) {
  final urlAsync = ref.watch(proxyUrlProvider);
  return urlAsync.maybeWhen(
    data: (url) => (url != null && url.isNotEmpty) ? ApiClient(baseUrl: url) : null,
    orElse: () => null,
  );
});

// ─── Historial de validaciones recientes (en memoria, por sesión) ──────
class RecentEntry {
  final String input;
  final String verdict;
  final DateTime at;
  RecentEntry({required this.input, required this.verdict, required this.at});
}

class RecentNotifier extends Notifier<List<RecentEntry>> {
  @override
  List<RecentEntry> build() => const [];

  void add(String input, String verdict) {
    final filtered = state.where((e) => e.input != input).toList();
    state = [
      RecentEntry(input: input, verdict: verdict, at: DateTime.now()),
      ...filtered,
    ].take(20).toList(growable: false);
  }

  void clear() {
    state = const [];
  }
}

final recentValidationsProvider =
    NotifierProvider<RecentNotifier, List<RecentEntry>>(RecentNotifier.new);
