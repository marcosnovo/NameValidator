/// ────────────────────────────────────────────────────────────────────────
///  Wrapper sencillo sobre SharedPreferences.
/// ────────────────────────────────────────────────────────────────────────
///
/// Estado que persistimos:
///   ▸ proxyUrl     — URL del Cloudflare Worker (igual que la web actual)
///   ▸ operatorId   — identificador del operario logueado
///   ▸ contextId    — contexto de cliente activo (real-madrid / fc-barcelona)
///   ▸ approvalsCache — JSON de aprobaciones locales (mirror del KV global)

import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  static const _kProxyUrl = 'halo.proxyUrl';
  static const _kOperatorId = 'halo.operatorId';
  static const _kContextId = 'halo.contextId';

  SharedPreferences? _prefs;

  Future<SharedPreferences> _ensure() async {
    return _prefs ??= await SharedPreferences.getInstance();
  }

  Future<String?> getProxyUrl() async => (await _ensure()).getString(_kProxyUrl);
  Future<void> setProxyUrl(String value) async =>
      (await _ensure()).setString(_kProxyUrl, value);

  Future<String?> getOperatorId() async => (await _ensure()).getString(_kOperatorId);
  Future<void> setOperatorId(String value) async =>
      (await _ensure()).setString(_kOperatorId, value);

  Future<String> getContextId() async =>
      (await _ensure()).getString(_kContextId) ?? 'real-madrid';
  Future<void> setContextId(String value) async =>
      (await _ensure()).setString(_kContextId, value);
}
