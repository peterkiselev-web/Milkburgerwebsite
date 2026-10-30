#!/usr/bin/env bash
# Turns the Higgsfield clips into the still frames The Griddle scrubs through on scroll.
#
#   1. Put the clips in footage/ named 01-drop.mp4, 02-smash.mp4 ... 08-hero.mp4
#   2. Run: bash scripts/extract-frames.sh
#   3. Reload /griddle/ and the stand-in animation is replaced by the real film.
#
# Needs ffmpeg with libwebp. FRAMES sets the total number of stills (more = smoother, heavier).

set -euo pipefail

FRAMES="${FRAMES:-240}"
SRC="footage"
OUT="public/griddle/frames"

shopt -s nullglob
clips=("$SRC"/*.mp4)
if [ ${#clips[@]} -eq 0 ]; then
  echo "No clips found in $SRC/. Add the Higgsfield exports first." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# Join the clips in name order into one continuous film.
for clip in "${clips[@]}"; do
  printf "file '%s'\n" "$(realpath "$clip")" >> "$tmp/list.txt"
done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/list.txt" -an -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24" "$tmp/film.mp4"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$tmp/film.mp4")"
rate="$(awk -v f="$FRAMES" -v d="$duration" 'BEGIN { printf "%.4f", f / d }')"

rm -rf "$OUT"
mkdir -p "$OUT/landscape" "$OUT/portrait"

# Landscape for desktop, a centre-cropped portrait set for phones.
ffmpeg -loglevel error -y -i "$tmp/film.mp4" -vf "fps=$rate,scale=1600:-2" -c:v libwebp -quality 72 "$OUT/landscape/frame-%04d.webp"
ffmpeg -loglevel error -y -i "$tmp/film.mp4" -vf "fps=$rate,crop=ih*9/16:ih,scale=720:-2" -c:v libwebp -quality 70 "$OUT/portrait/frame-%04d.webp"

count="$(find "$OUT/landscape" -name 'frame-*.webp' | wc -l | tr -d ' ')"
printf '{ "count": %s, "ext": "webp", "portrait": true }\n' "$count" > "$OUT/manifest.json"

echo "Wrote $count frames to $OUT ($(du -sh "$OUT" | cut -f1))."
