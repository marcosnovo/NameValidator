# Permisos a añadir tras `flutter create`

Cuando ejecutes `flutter create .` en `mobile/`, Flutter creará `ios/Runner/Info.plist` y `android/app/src/main/AndroidManifest.xml` con valores por defecto. Hay que añadir los permisos abajo para que NFC, cámara, MLKit y red funcionen.

---

## iOS — `ios/Runner/Info.plist`

Añade dentro del `<dict>` raíz:

```xml
<!-- ──────────────────────────────────────────────── -->
<!-- HALO Validator — permisos                         -->
<!-- ──────────────────────────────────────────────── -->

<!-- Cámara (escaneo del documento) -->
<key>NSCameraUsageDescription</key>
<string>El operario del Tour escanea el DNI / pasaporte del visitante para verificar identidad antes de mostrar el nombre en el HALO.</string>

<!-- NFC (lectura del chip del DNI 3.0) -->
<key>NFCReaderUsageDescription</key>
<string>Lectura del chip electrónico del DNI 3.0 para verificación criptográfica de identidad.</string>

<!-- AID requerido por CoreNFC para leer documentos ICAO 9303 -->
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
  <string>A0000002471001</string>     <!-- ICAO 9303 — pasaportes y DNI 3.0 -->
  <string>A0000002472001</string>     <!-- LDS variant -->
</array>

<!-- Permitir HTTP (sólo si testeas contra Worker dev sin SSL — quitar en prod) -->
<!--
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
-->
```

Y en `ios/Runner/Runner.entitlements` (créalo si no existe):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- NFC — requiere capability "Near Field Communication Tag Reading" en Xcode -->
  <key>com.apple.developer.nfc.readersession.formats</key>
  <array>
    <string>TAG</string>
  </array>
</dict>
</plist>
```

> En Xcode, abre `Runner.xcworkspace` → Signing & Capabilities → "+ Capability" → **Near Field Communication Tag Reading**. Esto liga el entitlement.

---

## Android — `android/app/src/main/AndroidManifest.xml`

Añade dentro del `<manifest>` (al lado de los permisos existentes):

```xml
<!-- Internet (Cloudflare Worker) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Cámara (escaneo del documento) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

<!-- NFC (lectura del DNI 3.0) -->
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />

<!-- Biometric login (opcional) -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

Y dentro del `<application>` añade soporte de NFC IsoDep:

```xml
<!-- IsoDep tech filter para leer el chip ICAO 9303 -->
<meta-data
    android:name="android.nfc.action.TECH_DISCOVERED"
    android:resource="@xml/nfc_tech_filter" />
```

Crea `android/app/src/main/res/xml/nfc_tech_filter.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:xliff="urn:oasis:names:tc:xliff:document:1.2">
  <tech-list>
    <tech>android.nfc.tech.IsoDep</tech>
    <tech>android.nfc.tech.NfcA</tech>
    <tech>android.nfc.tech.NfcB</tech>
  </tech-list>
</resources>
```

---

## Versiones mínimas

### Android — `android/app/build.gradle.kts` (o `build.gradle`)

Asegúrate de:
```kotlin
android {
    compileSdk = 36
    defaultConfig {
        minSdk = 23      // Android 6.0 — necesario para nfc_manager + biometric
        targetSdk = 36
    }
}
```

### iOS — `ios/Podfile`

```ruby
platform :ios, '15.0'    # google_mlkit_text_recognition requiere 15+
```

Y en Xcode: General → Deployment Info → iOS 15.0 mínimo.

---

## Reset cuando todo esté metido

```bash
cd mobile
flutter clean
flutter pub get
cd ios && pod install && cd ..
flutter run
```
