#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
#  setup-ios.sh — configura el proyecto iOS tras `flutter create`
# ──────────────────────────────────────────────────────────────────────────
#
# Aplica de una sola pasada:
#   1. platform :ios, '15.5' en Podfile
#   2. IPHONEOS_DEPLOYMENT_TARGET = 15.5 en project.pbxproj
#   3. Bypass codesign para Debug + Simulator (workaround macOS Tahoe quirk)
#   4. Strip de xattrs en Run Script post-build (segunda red de seguridad)
#   5. Patch del wrapper xcode_backend.sh del Flutter SDK (xattrs antes de
#      codesign — el problema macOS Tahoe ataca aquí)
#
# Uso:
#   ./scripts/setup-ios.sh
#
# Idempotente: lo puedes ejecutar varias veces sin problema.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Auto-detect Flutter (bash no hereda PATH del ~/.zshrc del usuario)
if ! command -v flutter >/dev/null 2>&1; then
  for candidate in \
    "$HOME/Documents/develop/flutter/bin" \
    "$HOME/develop/flutter/bin" \
    "$HOME/flutter/bin" \
    "$HOME/development/flutter/bin" \
    "$HOME/.fvm/default/bin" \
    "/opt/homebrew/bin" \
    "/usr/local/bin"; do
    if [ -x "$candidate/flutter" ]; then
      export PATH="$candidate:$PATH"
      break
    fi
  done
fi

echo "▸ HALO Validator — setup-ios.sh"
echo "  mobile/ = $MOBILE_DIR"

if [ ! -d "$MOBILE_DIR/ios" ]; then
  echo "✗ No existe $MOBILE_DIR/ios — ejecuta primero:"
  echo "    cd $MOBILE_DIR"
  echo "    flutter create . --org com.realmadrid.halo --project-name halo_validator --platforms=ios,android,macos"
  exit 1
fi

# ── 1. Podfile platform :ios, '15.5' ────────────────────────────────────
PODFILE="$MOBILE_DIR/ios/Podfile"
if [ -f "$PODFILE" ]; then
  if grep -q "^platform :ios" "$PODFILE"; then
    sed -i '' "s|^platform :ios.*|platform :ios, '15.5'|" "$PODFILE"
  elif grep -q "^# platform :ios" "$PODFILE"; then
    sed -i '' "s|^# platform :ios.*|platform :ios, '15.5'|" "$PODFILE"
  else
    # Insertar al principio del archivo
    printf "platform :ios, '15.5'\n%s" "$(cat "$PODFILE")" > "$PODFILE"
  fi
  echo "✓ Podfile platform :ios, '15.5'"
else
  echo "⚠ Podfile no existe aún. Ejecuta 'cd ios && pod install' después."
fi

# ── 2. IPHONEOS_DEPLOYMENT_TARGET en project.pbxproj ────────────────────
PBXPROJ="$MOBILE_DIR/ios/Runner.xcodeproj/project.pbxproj"
if [ -f "$PBXPROJ" ]; then
  sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*;/IPHONEOS_DEPLOYMENT_TARGET = 15.5;/g' "$PBXPROJ"
  echo "✓ Deployment target → iOS 15.5"
fi

# ── 3. Bypass codesign para Debug + Simulator (post_install hook) ───────
if [ -f "$PODFILE" ]; then
  # Si ya existe el bloque post_install lo dejamos (asumimos manual).
  # Si no existe, lo añadimos al final.
  if ! grep -q "post_install do |installer|" "$PODFILE"; then
    cat >> "$PODFILE" <<'EOF'

post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.5'
      # Bypass codesign para Debug + Simulator (macOS Tahoe quirk)
      if config.name.include?('Debug')
        config.build_settings['CODE_SIGN_IDENTITY'] = ''
        config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      end
    end
  end
end
EOF
    echo "✓ post_install hook con bypass codesign añadido"
  else
    echo "✓ Podfile post_install ya existe (no se modifica — ajusta a mano si hace falta)"
  fi
fi

# ── 4. Bypass codesign en project.pbxproj para Debug ───────────────────
if [ -f "$PBXPROJ" ]; then
  sed -i '' 's/CODE_SIGN_IDENTITY = "[^"]*"/CODE_SIGN_IDENTITY = ""/g' "$PBXPROJ" || true
  sed -i '' 's/CODE_SIGNING_REQUIRED = YES/CODE_SIGNING_REQUIRED = NO/g' "$PBXPROJ" || true
  sed -i '' 's/CODE_SIGNING_ALLOWED = YES/CODE_SIGNING_ALLOWED = NO/g' "$PBXPROJ" || true
  echo "✓ project.pbxproj codesign disabled"
fi

# ── 5. Patch del wrapper Flutter xcode_backend.sh ───────────────────────
# Sólo si el SDK está en una ruta esperada y el patch no está ya aplicado.
if [ -n "${FLUTTER_ROOT:-}" ]; then
  FLUTTER_SDK="$FLUTTER_ROOT"
elif command -v flutter >/dev/null 2>&1; then
  FLUTTER_SDK="$(dirname "$(dirname "$(readlink -f "$(which flutter)")")")"
else
  FLUTTER_SDK=""
fi

if [ -n "$FLUTTER_SDK" ] && [ -d "$FLUTTER_SDK" ]; then
  XCODE_BACKEND="$FLUTTER_SDK/packages/flutter_tools/bin/xcode_backend.sh"
  if [ -f "$XCODE_BACKEND" ]; then
    if ! grep -q "Tahoe codesign fix" "$XCODE_BACKEND"; then
      cp "$XCODE_BACKEND" "$XCODE_BACKEND.bak"
      cat > "$XCODE_BACKEND" <<'PATCHED'
#!/usr/bin/env bash
# Patched by HALO Validator setup-ios.sh — Tahoe codesign fix.
set -euo pipefail
unset CDPATH

function follow_links() (
  cd -P "$(dirname -- "$1")"
  file="$PWD/$(basename -- "$1")"
  while [[ -h "$file" ]]; do
    cd -P "$(dirname -- "$file")"
    file="$(readlink -- "$file")"
    cd -P "$(dirname -- "$file")"
    file="$PWD/$(basename -- "$file")"
  done
  echo "$file"
)

PROG_NAME="$(follow_links "${BASH_SOURCE[0]}")"
BIN_DIR="$(cd "${PROG_NAME%/*}" ; pwd -P)"
FLUTTER_ROOT="$BIN_DIR/../../.."
DART="$FLUTTER_ROOT/bin/dart"

# Tahoe codesign fix — strip xattrs antes del dart backend.
if [[ -n "${BUILT_PRODUCTS_DIR:-}" && -d "$BUILT_PRODUCTS_DIR" ]]; then
  find "$BUILT_PRODUCTS_DIR" -name "*.framework" -type d -exec xattr -cr {} \; 2>/dev/null || true
fi

"$DART" "$BIN_DIR/xcode_backend.dart" "$@" "ios"
PATCHED
      echo "✓ Flutter SDK xcode_backend.sh patched (backup en .bak)"
    else
      echo "✓ Flutter SDK xcode_backend.sh ya parcheado"
    fi
  else
    echo "⚠ No encuentro xcode_backend.sh en $FLUTTER_SDK"
  fi
else
  echo "⚠ No detecto FLUTTER_ROOT — no parcheo el SDK. Si iOS sigue fallando con codesign, ejecuta el patch manual del README."
fi

# ── 6. Permisos en Info.plist (Camera, NFC) — sólo si no están ya ──────
INFO_PLIST="$MOBILE_DIR/ios/Runner/Info.plist"
if [ -f "$INFO_PLIST" ]; then
  if ! grep -q "NSCameraUsageDescription" "$INFO_PLIST"; then
    /usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'Para escanear el DNI / pasaporte del visitante.'" "$INFO_PLIST" 2>/dev/null || true
    echo "✓ Info.plist + NSCameraUsageDescription"
  fi
  if ! grep -q "NFCReaderUsageDescription" "$INFO_PLIST"; then
    /usr/libexec/PlistBuddy -c "Add :NFCReaderUsageDescription string 'Para leer el chip del DNI 3.0.'" "$INFO_PLIST" 2>/dev/null || true
    echo "✓ Info.plist + NFCReaderUsageDescription"
  fi
fi

echo ""
echo "✓ Setup iOS completo."
echo ""
echo "Siguiente paso:"
echo "  cd $MOBILE_DIR/ios && pod install && cd .."
echo "  flutter run -d \"iPhone 17\""
