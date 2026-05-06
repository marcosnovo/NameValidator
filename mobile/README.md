# HALO Validator — App móvil (Flutter)

App nativa para iOS + Android, pensada para que los operarios del Tour del Bernabéu validen los nombres del HALO directamente desde su móvil:

- ✅ Cliente HTTP del Cloudflare Worker existente (`/api/ai-check`, `/api/scan-document`, `/api/approve`, `/api/metrics`)
- ✅ Format check local (Dart) — validación instantánea sin red
- ✅ Multi-tenant (Real Madrid / FC Barcelona) seleccionable en ajustes
- 🔜 Cámara + OCR on-device (VisionKit en iOS, MLKit en Android)
- 🔜 NFC del DNI 3.0 con PACE/BAC (ICAO 9303)
- 🔜 Biometric login del operario
- ✅ Dashboard de métricas espejo del web (`docs/metrics.html`)

---

## Estado del scaffold

Lo que ya está implementado en este repo:

```
mobile/
├── pubspec.yaml                  ← deps: riverpod, go_router, http, shared_prefs, crypto
│                                  (nfc_manager, camera, mlkit, local_auth comentadas
│                                   hasta su PR de implementación — ahorran ~1.5 GB de
│                                   NDK + pods iOS pesados en la primera build)
├── analysis_options.yaml
├── .gitignore
├── PERMISSIONS_SNIPPETS.md       ← lo que añadir a Info.plist + AndroidManifest
├── README.md                     ← este archivo
├── lib/
│   ├── main.dart                 ← entry, ProviderScope + MaterialApp.router
│   ├── app/
│   │   ├── theme.dart            ← tema dark con paleta HALO
│   │   ├── router.dart           ← go_router (Home / Scanner / Result / Approvals / Metrics)
│   │   └── providers.dart        ← Riverpod: prefs, proxyUrl, operatorId, contextId, apiClient
│   ├── core/
│   │   ├── network/api_client.dart   ← cliente HTTP del Worker
│   │   ├── storage/preferences_service.dart   ← shared_preferences wrapper
│   │   ├── validator/format_check.dart   ← port del format check JS → Dart
│   │   └── blocklists/           ← (vacío de momento, port futuro)
│   └── features/
│       ├── validator/
│       │   ├── presentation/home_screen.dart
│       │   ├── presentation/result_screen.dart
│       │   └── presentation/settings_dialog.dart
│       ├── scanner/presentation/scanner_screen.dart   ← placeholder
│       ├── approvals/presentation/approvals_screen.dart   ← placeholder
│       └── metrics/presentation/metrics_screen.dart    ← consume /api/metrics
└── test/
    └── format_check_test.dart    ← smoke test del port
```

Falta lo que `flutter create` genera: `ios/`, `android/`, `macos/`. **Eso lo creas tú** en el siguiente paso.

---

## Setup inicial — primera vez

### 1. Genera los proyectos nativos iOS + Android

Desde `mobile/`:

```bash
cd mobile
flutter create . \
  --org com.realmadrid.halo \
  --project-name halo_validator \
  --platforms=ios,android,macos
```

Esto crea las carpetas `ios/`, `android/`, `macos/` sin tocar `lib/`, `pubspec.yaml`, `test/`, etc.

> ⚠️ Si flutter te avisa de que sobrescribiría `pubspec.yaml`, di **No**. El que ya tenemos lleva todos los plugins.

### 2. Instala dependencias

```bash
flutter pub get
cd ios && pod install && cd ..
```

### 3. Aplica los snippets de permisos

Abre `PERMISSIONS_SNIPPETS.md` y mete los bloques en:
- `ios/Runner/Info.plist`
- `ios/Runner/Runner.entitlements` (créalo si no existe)
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/nfc_tech_filter.xml` (créalo)
- `android/app/build.gradle.kts` → `minSdk = 23`, `compileSdk = 36`
- `ios/Podfile` → `platform :ios, '15.0'`

Y en Xcode: añade la capability "Near Field Communication Tag Reading" en Signing & Capabilities.

### 4. Lanza la app

```bash
# Ver dispositivos disponibles
flutter devices

# iOS Simulator (necesitas Xcode abierto al menos una vez)
open -a Simulator
flutter run -d "iPhone 16"   # o el ID que te aparezca

# Android emulator
flutter emulators --launch halo_pixel7_arm64
flutter run -d emulator-5554

# Tu iPhone físico (cuando lo conectes con cable + Developer Mode)
flutter run -d "iPhone Marcos"
```

### 5. Configura el proxy

Una vez la app arranca:

1. Pulsa el icono de ajustes (engranaje, esquina superior derecha)
2. Pega la URL de tu Worker: `https://halo-proxy.<tu-sub>.workers.dev`
3. Pulsa "Probar conexión" — debe responder `✓ AI activa · KV activa` (o lo que tengas configurado)
4. Mete tu ID de operario (ej. `marcos.novo`)
5. Selecciona contexto (`real-madrid` por defecto)
6. Guardar

---

## Uso

- **Validar un nombre**: escribe en el campo de la home → "Validar". Si el formato es inválido se rechaza local, sin red. Si no, llama al Worker (con cache 1h KV).
- **Aprobar manualmente**: si el resultado es REVIEW o SUSPICIOUS, aparece botón "Aprobar manualmente". Postea a `/api/approve`, propaga a todos los operarios vía KV global.
- **Métricas**: icono de barras → ve KPIs (cache hit rate, latencia, errores) y distribución de veredictos/sources.

---

## Tests

```bash
flutter test
```

Por ahora sólo el smoke test del format check (8 casos). Conforme vayamos portando blocklists y contextos a Dart añadimos más cobertura.

---

## Roadmap inmediato (tras este scaffold)

1. **Cámara + OCR on-device** — `camera` + `google_mlkit_text_recognition`. Reemplaza Tesseract.js de la web. Privacidad GDPR (la imagen no sale del dispositivo). Descomenta sus líneas en `pubspec.yaml` y `flutter pub get` cuando empiece esta PR.
2. **NFC del DNI 3.0** — `nfc_manager` + implementación de PACE/BAC ICAO 9303. Lectura cripto-firmada del chip, sub-segundo.
3. **Port completo del validador a Dart** — `src/normalize.js` + blocklists ES/EN/FR/PT/DE/IT/RU/PL/AR + contextos. Validación local sin red.
4. **Biometric login** — `local_auth` para Face ID / fingerprint del operario.
5. **Offline mode** — sync de aprobaciones globales en `shared_preferences`, validación local sin red.

> **Nota sobre dependencias diferidas**: las primeras 4 features arriba arrastran código nativo (NDK Android ~1.5 GB, pods iOS pesados). Por eso el `pubspec.yaml` mantiene `camera`, `google_mlkit_text_recognition`, `nfc_manager` y `local_auth` **comentadas** hasta el momento de implementar cada feature. Esto baja el tiempo de la primera build de 30+ min a 2-4 min y permite validar la app base rápido. Cada PR de feature des-comenta su plugin correspondiente.

---

## Arquitectura

- **Estado**: Riverpod (`flutter_riverpod`)
- **Navegación**: `go_router`
- **Red**: `http` directo (sin axios/dio para mantener bundle pequeño)
- **Persistencia**: `shared_preferences`
- **Cripto**: `crypto` (SHA-256 para hash de aprobaciones, mismo algoritmo que el Worker)

Convención de carpetas: feature-first. Cada feature tiene su `domain/`, `data/` y `presentation/` cuando crece. Los providers globales viven en `app/providers.dart`.
