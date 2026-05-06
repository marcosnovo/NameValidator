/// ────────────────────────────────────────────────────────────────────────
///  Providers globales (Riverpod).
/// ────────────────────────────────────────────────────────────────────────

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_client.dart';
import '../core/storage/preferences_service.dart';

final preferencesProvider = Provider<PreferencesService>((ref) {
  return PreferencesService();
});

/// URL del Cloudflare Worker. Null hasta que el operario la configure.
final proxyUrlProvider = FutureProvider<String?>((ref) async {
  return ref.read(preferencesProvider).getProxyUrl();
});

/// Identificador del operario logueado. Vacío hasta el primer login.
final operatorIdProvider = FutureProvider<String?>((ref) async {
  return ref.read(preferencesProvider).getOperatorId();
});

/// Contexto de cliente activo (real-madrid por defecto).
final contextIdProvider = FutureProvider<String>((ref) async {
  return ref.read(preferencesProvider).getContextId();
});

/// Cliente HTTP del Worker. Sólo se construye si hay proxyUrl válida.
final apiClientProvider = Provider<ApiClient?>((ref) {
  final urlAsync = ref.watch(proxyUrlProvider);
  return urlAsync.maybeWhen(
    data: (url) => (url != null && url.isNotEmpty) ? ApiClient(baseUrl: url) : null,
    orElse: () => null,
  );
});
