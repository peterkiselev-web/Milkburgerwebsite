#!/usr/bin/env bash
# Rebuilds src/brand/fonts/milk-burger.woff2 from the logo SVG and Darumadrop One.
# Usage: scripts/font/build.sh [path/to/logo.svg]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$ROOT/scripts/font"
LOGO="${1:-$ROOT/src/brand/logo-placeholder.svg}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Rendering the logo"
node "$HERE/render-logo.cjs" "$LOGO" "$WORK/logo2x.png"

echo "Fetching Darumadrop One"
mkdir -p "$WORK/pkg" "$WORK/dl/ttf"
(cd "$WORK/pkg" && npm pack @fontsource/darumadrop-one@5.3.0 --silent >/dev/null && tar xzf fontsource-darumadrop-one-5.3.0.tgz)
python3 -c "import sys; from fontTools.ttLib import TTFont; f = TTFont(sys.argv[1]); f.flavor = None; f.save(sys.argv[2])" \
  "$WORK/pkg/package/files/darumadrop-one-latin-400-normal.woff2" "$WORK/dl/ttf/darumadrop-one.ttf"

echo "Splitting the logo into letters"
python3 "$HERE/extract.py" "$WORK"
echo "Drawing the glyphs (a couple of minutes)"
python3 "$HERE/glyphs.py" "$WORK" >/dev/null
echo "Building the font"
mkdir -p "$WORK/out"
python3 "$HERE/font.py" "$WORK" "$WORK/out/milk-burger" | tail -2
cp "$WORK/out/milk-burger.woff2" "$ROOT/src/brand/fonts/milk-burger.woff2"
echo "Wrote src/brand/fonts/milk-burger.woff2"
