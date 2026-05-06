#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
#  setup-android.sh — configura el proyecto Android tras `flutter create`
# ──────────────────────────────────────────────────────────────────────────
#
# Aplica de una sola pasada:
#   1. minSdk = 23 en android/app/build.gradle.kts (necesario para los
#      plugins NFC/Biometric cuando se descomenten).
#   2. Quita ndkVersion para evitar la descarga forzada del NDK (~1.5 GB)
#      mientras no usemos plugins nativos pesados.
#   3. Permisos básicos en AndroidManifest (INTERNET ya viene por defecto;
#      añadimos CAMERA y NFC para cuando se usen).
#
# Idempotente.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "▸ HALO Validator — setup-android.sh"
echo "  mobile/ = $MOBILE_DIR"

if [ ! -d "$MOBILE_DIR/android" ]; then
  echo "✗ No existe $MOBILE_DIR/android — ejecuta primero:"
  echo "    cd $MOBILE_DIR"
  echo "    flutter create . --org com.realmadrid.halo --project-name halo_validator --platforms=ios,android,macos"
  exit 1
fi

# ── 1. minSdk = 23 ───────────────────────────────────────────────────────
APP_GRADLE="$MOBILE_DIR/android/app/build.gradle.kts"
APP_GRADLE_GROOVY="$MOBILE_DIR/android/app/build.gradle"

GRADLE_FILE=""
if [ -f "$APP_GRADLE" ]; then
  GRADLE_FILE="$APP_GRADLE"
elif [ -f "$APP_GRADLE_GROOVY" ]; then
  GRADLE_FILE="$APP_GRADLE_GROOVY"
fi

if [ -n "$GRADLE_FILE" ]; then
  # Reemplaza minSdk = X / minSdkVersion X / minSdk = flutter.minSdkVersion
  if grep -q "minSdk = flutter.minSdkVersion" "$GRADLE_FILE"; then
    sed -i '' 's|minSdk = flutter.minSdkVersion|minSdk = 23|g' "$GRADLE_FILE"
  fi
  if grep -qE "minSdk = [0-9]+" "$GRADLE_FILE"; then
    sed -i '' -E 's|minSdk = [0-9]+|minSdk = 23|g' "$GRADLE_FILE"
  fi
  if grep -qE "minSdkVersion [0-9]+" "$GRADLE_FILE"; then
    sed -i '' -E 's|minSdkVersion [0-9]+|minSdkVersion 23|g' "$GRADLE_FILE"
  fi
  echo "✓ minSdk = 23 en $GRADLE_FILE"
else
  echo "⚠ No encuentro build.gradle de la app — saltando minSdk"
fi

# ── 2. Quitar ndkVersion (forzado por Flutter 3.41+) ───────────────────
# Mientras no usemos plugins nativos pesados (mlkit/nfc/camera), evitamos
# que gradle descargue el NDK.
for f in \
  "$MOBILE_DIR/android/build.gradle.kts" \
  "$MOBILE_DIR/android/build.gradle" \
  "$MOBILE_DIR/android/app/build.gradle.kts" \
  "$MOBILE_DIR/android/app/build.gradle"; do
  if [ -f "$f" ]; then
    sed -i '' '/ndkVersion/d' "$f" 2>/dev/null || true
  fi
done
echo "✓ ndkVersion removed (no NDK download forzado)"

# ── 3. Permisos en AndroidManifest.xml ──────────────────────────────────
MANIFEST="$MOBILE_DIR/android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  # INTERNET ya está por defecto en debug; en release Flutter lo añade vía
  # flutter_tools. Añadimos CAMERA y NFC para preparar futuro.
  if ! grep -q "android.permission.CAMERA" "$MANIFEST"; then
    sed -i '' 's|<application|<uses-permission android:name="android.permission.INTERNET"/>\
    <uses-permission android:name="android.permission.CAMERA"/>\
    <uses-permission android:name="android.permission.NFC"/>\
    <uses-permission android:name="android.permission.USE_BIOMETRIC"/>\
    <application|' "$MANIFEST"
    echo "✓ Permisos en AndroidManifest (INTERNET, CAMERA, NFC, USE_BIOMETRIC)"
  fi
fi

echo ""
echo "✓ Setup Android completo."
