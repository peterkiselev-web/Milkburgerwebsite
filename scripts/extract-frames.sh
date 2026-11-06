#!/usr/bin/env bash
# Turns the Higgsfield clips into the still frames The Griddle scrubs through on scroll.
#
#   1. Put the clips in footage/, named so they sort in film order (01-smash.mp4, 02-crust.mp4 ...)
#   2. Run: bash scripts/extract-frames.sh
#   3. Reload /griddle/ and the stand-in animation is replaced by the real film.
#
# Each clip gets its own framing: a landscape version for desktop (clips that aren't
# widescreen sit on a blurred copy of themselves instead of being cropped) and a
# portrait version for phones, centre-cropped from the original clip.
#
# Needs ffmpeg with libwebp. FRAMES sets the total number of stills (more = smoother, heavier).

set -euo pipefail

FRAMES="${FRAMES:-300}"
SRC="footage"
OUT="public/griddle/frames"
LW=1280 LH=720   # landscape frame size
PW=720 PH=1280   # portrait frame size

shopt -s nullglob
clips=("$SRC"/*.mp4)
if [ ${#clips[@]} -eq 0 ]; then
  echo "No clips found in $SRC/. Add the Higgsfield exports first." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cover() { echo "scale=$1:$2:force_original_aspect_ratio=increase,crop=$1:$2"; }

i=0
for clip in "${clips[@]}"; do
  i=$((i + 1))
  IFS=x read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$clip")

  # Within 5% of 16:9 counts as widescreen and is simply cropped to fit.
  if awk -v w="$w" -v h="$h" 'BEGIN { r = (w / h) / (16 / 9); exit !(r > 0.95 && r < 1.05) }'; then
    land="$(cover $LW $LH),setsar=1,fps=24"
  else
    land="split[a][b];[a]$(cover $LW $LH),boxblur=40:4,eq=brightness=-0.12[bg];[b]scale=-2:$LH[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=24"
  fi
  ffmpeg -loglevel error -y -i "$clip" -an -filter_complex "$land" "$tmp/land-$i.mp4"
  ffmpeg -loglevel error -y -i "$clip" -an -vf "$(cover $PW $PH),setsar=1,fps=24" "$tmp/port-$i.mp4"
  printf "file '%s'\n" "$tmp/land-$i.mp4" >> "$tmp/land.txt"
  printf "file '%s'\n" "$tmp/port-$i.mp4" >> "$tmp/port.txt"
done

ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/land.txt" -c copy "$tmp/land.mp4"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/port.txt" -c copy "$tmp/port.mp4"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$tmp/land.mp4")"
rate="$(awk -v f="$FRAMES" -v d="$duration" 'BEGIN { printf "%.4f", f / d }')"

rm -rf "$OUT"
mkdir -p "$OUT/landscape" "$OUT/portrait"
ffmpeg -loglevel error -y -i "$tmp/land.mp4" -vf "fps=$rate" -c:v libwebp -quality 72 "$OUT/landscape/frame-%04d.webp"
ffmpeg -loglevel error -y -i "$tmp/port.mp4" -vf "fps=$rate" -c:v libwebp -quality 70 "$OUT/portrait/frame-%04d.webp"

# Use the smaller set's count so every index exists in both.
land_count="$(find "$OUT/landscape" -name 'frame-*.webp' | wc -l | tr -d ' ')"
port_count="$(find "$OUT/portrait" -name 'frame-*.webp' | wc -l | tr -d ' ')"
count=$(( land_count < port_count ? land_count : port_count ))
printf '{ "count": %s, "ext": "webp", "portrait": true, "clips": %s }\n' "$count" "${#clips[@]}" > "$OUT/manifest.json"

echo "Wrote $count frames from ${#clips[@]} clips to $OUT ($(du -sh "$OUT" | cut -f1))."
