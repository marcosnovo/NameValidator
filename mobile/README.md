# HALO Validator — App móvil (Flutter)

App nativa para iOS + Android — operarios del Tour del Bernabéu validan los nombres del HALO desde su móvil.

## Setup inicial (5 minutos)

Después de clonar el repo, **un solo script** hace todo:

```bash
cd mobile
./scripts/setup.sh
```

Ese script:
1. Ejecuta `flutter create` (genera `ios/`, `android/`, `macos/`)
2. `flutter pub get`
3. `setup-ios.sh` — Podfile platform 15.5 + bypass codesign Tahoe + patch SDK + permisos Info.plist
4. `setup-android.sh` — minSdk 23 + sin `ndkVersion` forzado + permisos manifest
5. `pod install`

Idempotente — lo puedes ejecutar varias veces.

## Lanzar la app

### Opción A — sin configuración previa

```bash
flutter run -d "iPhone 17"          # iOS Simulator
# o
flutter run -d emulator-5554        # Android emulator
```

Una vez abre, pulsa el icono de ajustes (⚙) para configurar el proxy URL, ID de operario y contexto.

### Opción B — auto-config con dart-define

Para que la app arranque ya conectada al Worker sin tocar nada:

```bash
flutter run -d "iPhone 17" \
  --dart-define=WORKER_URL=https://halo-proxy.tu-sub.workers.dev \
  --dart-define=OPERATOR_ID=marcos \
  --dart-define=CONTEXT_ID=real-madrid
```

Los valores se persisten en SharedPreferences la primera vez, así no necesitas pasarlos en cada `flutter run`.

## Estructura del proyecto

```
mobile/
├── pubspec.yaml                    # deps (riverpod, go_router, http, shared_prefs, crypto)
├── analysis_options.yaml           # strict casts/inference
├── scripts/
│   ├── setup.sh                    # entrypoint
│   ├── setup-ios.sh                # iOS native config
│   └── setup-android.sh            # Android native config
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── theme.dart              # tema dark con paleta HALO LED
│   │   ├── router.dart             # go_router
│   │   └── providers.dart          # Riverpod providers + dart-define defaults
│   ├── core/
│   │   ├── network/api_client.dart # cliente del Worker (5 endpoints)
│   │   ├── storage/preferences_service.dart
│   │   └── validator/format_check.dart
│   └── features/
│       ├── validator/presentation/
│       │   ├── home_screen.dart       # Hero LED + input + recientes
│       │   ├── result_screen.dart     # Verdict card animado
│       │   └── settings_dialog.dart
│       ├── scanner/presentation/      # placeholder cámara/NFC
│       ├── approvals/presentation/    # placeholder
│       └── metrics/presentation/      # dashboard nativo del Worker
└── test/
    └── format_check_test.dart      # 8 casos golden
```

## Pantallas

- **Home** — input principal con animación del HALO LED, validar, escanear, recientes en sesión.
- **Result** — verdict card grande con barra de riesgo, lectura fonética, motivos detallados con severities, aprobación humana directa.
- **Settings** — proxy URL + Probar conexión + ID operario + contexto (Real Madrid / FC Barcelona).
- **Metrics** — espejo nativo del dashboard web. KPIs (cache hit %, latencia, errores), bar chart 14 días, distribuciones de veredictos y sources.

## Roadmap

Cada feature pesada se añade en su PR cuando toque, junto con su plugin en `pubspec.yaml` (descomentar la sección correspondiente):

1. **Cámara + OCR on-device** — `camera` + `google_mlkit_text_recognition`. Sustituye Tesseract.js. Privacidad GDPR (la imagen no sale del dispositivo).
2. **NFC del DNI 3.0** — `nfc_manager` con protocolo PACE/BAC ICAO 9303. Lectura cripto-firmada sub-segundo.
3. **Port completo del validador a Dart** — `normalize.js` + 9 blocklists + contextos. Validación local sin red.
4. **Biometric login** — `local_auth` Face ID / fingerprint del operario.
5. **Offline mode** — sync KV de aprobaciones globales + validación local.

## Hot reload

Mientras corre `flutter run`:

| Tecla | Acción |
|---|---|
| `r` | Hot reload (cambios en segundos) |
| `R` | Hot restart (reinicia la app) |
| `q` | Quit |
| `h` | Lista de comandos |

## Tests

```bash
flutter test
```

8 casos golden del format check Dart.

## Arquitectura

- **State**: `flutter_riverpod`
- **Routing**: `go_router`
- **Red**: `http` directo
- **Persistencia**: `shared_preferences`
- **Cripto**: `crypto` (SHA-256, mismo algoritmo que el Worker)
- **Tema**: Material 3 dark con paleta HALO (navy + violeta accent + verdict colors).

Convención feature-first. Domain/data/presentation cuando una feature crece.

## Workers Cloudflare

La lógica heavy (blocklists 9-idiomas, contextos multi-tenant, AI semántica con Claude, métricas KV) sigue en `proxy/cloudflare-worker.js` del repo padre. La app móvil consume esos endpoints:

- `GET /api/health`
- `POST /api/ai-check` — validación con cache 1h KV
- `POST /api/scan-document` — Vision OCR (cuando se implemente la cámara)
- `POST /api/approve` — aprobación global del operario
- `GET /api/metrics` — dashboard 14 días
