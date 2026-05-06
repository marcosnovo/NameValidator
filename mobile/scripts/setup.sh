#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
#  setup.sh — ejecuta el setup completo de mobile/ tras clonar el repo
# ──────────────────────────────────────────────────────────────────────────
#
# 1. flutter create (si no se ha hecho)
# 2. flutter pub get
# 3. setup-ios.sh
# 4. setup-android.sh
# 5. cd ios && pod install
#
# Idempotente. Lo puedes correr varias veces.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$MOBILE_DIR"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  HALO Validator — setup.sh"
echo "════════════════════════════════════════════════════════════"
echo ""

# ── Verificar Flutter ─────────────────────────────────────────────────
if ! command -v flutter >/dev/null 2>&1; then
  echo "✗ flutter no está en PATH. Verifica tu instalación del SDK."
  exit 1
fi
echo "✓ flutter detectado: $(flutter --version | head -1)"

# ── 1. flutter create si los nativos no existen ───────────────────────
if [ ! -d "ios" ] || [ ! -d "android" ]; then
  echo ""
  echo "▸ Generando proyectos nativos iOS+Android+macOS..."
  flutter create . \
    --org com.realmadrid.halo \
    --project-name halo_validator \
    --platforms=ios,android,macos
  echo "✓ flutter create completado"
fi

# ── 2. flutter pub get ────────────────────────────────────────────────
echo ""
echo "▸ flutter pub get..."
flutter pub get

# ── 3. setup-ios.sh (sólo en macOS) ───────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo ""
  bash "$SCRIPT_DIR/setup-ios.sh"
else
  echo "⊘ Sistema no-macOS: saltando setup-ios.sh"
fi

# ── 4. setup-android.sh ───────────────────────────────────────────────
echo ""
bash "$SCRIPT_DIR/setup-android.sh"

# ── 5. pod install (sólo en macOS) ────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
  echo ""
  echo "▸ pod install..."
  cd ios && pod install >/dev/null 2>&1 && cd ..
  echo "✓ Pods instalados"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✓ Setup completo"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Lanza la app:"
echo ""
echo "  iOS Simulator:"
echo "    flutter run -d \"iPhone 17\""
echo ""
echo "  Android emulator:"
echo "    flutter emulators --launch Medium_Phone_API_36"
echo "    flutter run -d emulator-5554"
echo ""
echo "  Auto-config (sin tener que tocar settings):"
echo "    flutter run -d emulator-5554 \\"
echo "      --dart-define=WORKER_URL=https://halo-proxy.<sub>.workers.dev \\"
echo "      --dart-define=OPERATOR_ID=marcos"
echo ""
