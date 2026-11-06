# Milk Burger: website concepts

Draft website concepts for **Milk Burger**, the burger and Champagne restaurant at 50 Westbourne Grove, Notting Hill.

Two drafts, the same content, to compare before refining the preferred one:

| Concept | Path | In one line |
| --- | --- | --- |
| The Griddle | `/griddle/` | Scroll and a burger is cooked in front of you |
| Cream | `/cream/` | Minimal, like the Instagram and the printed burger papers |

The landing page at `/` links both.

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
2. Put them in `footage/`, named so they sort in film order (`01-smash.mp4`, `02-crust.mp4` and so on). The current six are listed at the end of the shot list.
3. Run `bash scripts/extract-frames.sh` (needs ffmpeg).
4. Reload `/griddle/`. The stand-in animation is replaced by the real footage.

## Photos
Each photo tries its local file in `public/images/` first, then a hosted copy, then a placeholder. To use a full-resolution original, save it under the filename listed in `src/shared/images.js`. For example, the burgers and Champagne shot goes in `public/images/burgers-champagne.jpg`.

## Forms (contact and newsletter)
Both drafts have a contact form, a newsletter sign-up in the footer and a newsletter slide-in that appears after 10 seconds (`newsletter.delaySeconds` in the content file). While `"draft": true`, the forms check the fields and thank the visitor but **send nothing**. The draft strip's "Preview pop-up" button shows the slide-in on demand.

To go live, the owners need a mailing tool (for example Mailchimp or Klaviyo), an inbox for enquiries and a privacy policy. Then replace `send()` in `src/shared/forms.js` with calls to those services and set `"draft": false`.
