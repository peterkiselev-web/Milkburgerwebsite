# Milk Burger: website concepts

Draft website concepts for **Milk Burger**, the burger and Champagne restaurant at 50 Westbourne Grove, Notting Hill.

Three directions, the same content:

| Concept | Path | In one line |
| --- | --- | --- |
| The Griddle | `/griddle/` | Scroll and a burger is cooked in front of you |
| Cream | `/cream/` | Minimal, like the Instagram and the printed burger papers |
| Smash vs Juicy | `/smash-vs-juicy/` | Pick a side and the site re-themes around it |

The landing page at `/` links all three.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Where things live

| What | Where |
| --- | --- |
| Every fact, menu item and line of copy | `src/content/restaurant.json` |
| Research, with sources | `docs/research.md` |
| What still needs the owners' answer | `docs/questions-for-owners.md` |
| Concept design and decisions | `docs/design.md` |
| Shot list for the scroll film | `docs/higgsfield-shot-list.md` |
| Placeholder logo (swap for the original) | `src/brand/logo-placeholder.svg` |
| Photos | `public/images/` |

## Updating content
- **Prices:** set `price` on a menu item (for example `"price": "14"`). Anything left as `null` shows as TBC.
- **Confirmed facts:** remove `"confirmed": false` or `"nameConfirmed": false` once the owners have signed off.
- **Closed for a day:** add to `hours.overrides`, e.g. `{ "date": "2026-12-25", "closed": true, "note": "Christmas Day" }`.

## Adding the film to The Griddle
1. Export the clips from Higgsfield as described in `docs/higgsfield-shot-list.md`.
2. Put them in `footage/` named `01-drop.mp4`, `02-smash.mp4` and so on.
3. Run `bash scripts/extract-frames.sh` (needs ffmpeg).
4. Reload `/griddle/`. The stand-in animation is replaced by the real footage.

## Photos
Each photo tries its local file in `public/images/` first, then a hosted copy, then a placeholder. To use a full-resolution original, save it under the filename listed in `src/shared/images.js`. For example, the burgers and Champagne shot goes in `public/images/burgers-champagne.jpg`.
