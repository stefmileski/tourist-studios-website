#!/bin/bash
# Prism Lens FX – macOS CEP Extension Installer
# Run: bash install.sh

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/Library/Application Support/Adobe/CEP/extensions/com.touriststudios.prismlensfx"

echo "Installing Prism Lens FX panel..."
echo "  Source: $PLUGIN_DIR"
echo "  Dest:   $DEST"

mkdir -p "$DEST"
rsync -av --exclude='install.sh' --exclude='install-windows.bat' --exclude='.DS_Store' "$PLUGIN_DIR/" "$DEST/"

# Enable unsigned CEP extensions (required for development / self-built plugins)
PLIST="com.adobe.CSXS.9"
CURRENT=$(defaults read "$PLIST" PlayerDebugMode 2>/dev/null || echo "")
if [ "$CURRENT" != "1" ]; then
    defaults write "$PLIST" PlayerDebugMode 1
    echo "  Enabled CEP debug mode (required for unsigned extensions)"
fi

echo ""
echo "Done! Restart Premiere Pro, then open: Window > Extensions > Prism Lens FX"
