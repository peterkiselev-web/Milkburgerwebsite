# Milk Burger website: concept design

## Goal
Show Milk Burger's owners three website directions, each carrying everything public about the restaurant, so they can pick one to take to a finished site. A draft for review, not a launch.

## Who it's for
1. **The owners**, judging which direction feels like Milk Burger.
2. **Their eventual visitors**, mostly on phones and often on the pavement, asking: is it open, where is it, what's on the menu? Every concept answers that within one screen.

## The three concepts

| | The Griddle | Cream | Smash vs Juicy |
| --- | --- | --- | --- |
| Feel | Cinematic, dark, food-film | Minimal, editorial, Instagram-like | Playful, two-tone, interactive |
| Hero | A scroll-driven film of one burger being cooked | Big logo, tagline, three-photo grid | Split screen of the two rooms; pick a side |
| Signature moment | The smash, the melt, the pour | Milk drips falling into the visit section | The site re-themes around your team |
| Effort to maintain | Highest (footage) | Lowest | Medium |
| Page weight | Heavy once the footage is in (frames load progressively) | Light | Light |

All three include, from one content file: menu, kitchen philosophy, chef, founders, smash vs juicy, the two rooms, the site's burger history, press quotes, FAQ, live open or closed status, address, transport and Instagram.

## Shared foundation
- **Content:** `src/content/restaurant.json` holds every fact and line of copy. Change it once and all three concepts update. Prices are `null` until confirmed and show as TBC.
- **Draft markers:** `TBC` for missing prices, `to confirm` for facts from a single source. A toggle in the draft strip hides them for a clean preview.
- **Open now:** calculated in London time, whatever timezone the visitor is in. `hours.overrides` handles one-off closures, e.g. `{ "date": "2026-12-25", "closed": true, "note": "Christmas Day" }`.
- **Brand:** colours taken from the restaurant's own material: burgundy and cream from the logo, black awning, rust banquettes, stainless steel, pale blue and timber from the rooms. Instrument Serif and Instrument Sans throughout; Bricolage Grotesque adds punch in Smash vs Juicy. The logo is the only hand-drawn element.
- **Logo:** a placeholder traced from the Instagram profile picture. Replace `src/brand/logo-placeholder.svg` with the original vector file. Its two layers (`--logo-ink` and `--logo-fill`) let each concept recolour it.
- **Images:** each photo tries its local file, then a hosted fallback, then a styled placeholder. A missing file never shows a broken image.

## The Griddle: how the film works
- The film section is tall (about 85% of a screen per beat) with a sticky full-screen canvas inside. Scroll position maps to progress from 0 to 1, eased so it glides.
- **Until the footage exists**, a stand-in drawn in code plays the same eight beats as `docs/higgsfield-shot-list.md`, so pacing and captions can be judged now.
- **When the footage arrives**, `scripts/extract-frames.sh` joins the clips, samples them into about 240 stills (a landscape set and a portrait set for phones) and writes a manifest. The page detects the manifest and switches to the real film. Stills load sparsely first, then fill in, so scrubbing works immediately.
- Still frames rather than a scrubbed video, because seeking a video on scroll stutters on iPhones.
- Reduced-motion users get the finished frame and the captions without scrubbing.

## Accessibility and performance
- Semantic sections and headings, real buttons, visible focus states, `prefers-reduced-motion` respected everywhere.
- No horizontal scrolling at phone widths (tested at 390px).
- Prototypes render with JavaScript. The final build should pre-render the HTML for search engines and add Restaurant structured data (JSON-LD).
- All pages are `noindex` while in draft.

## What is not in the drafts yet
- Real prices, final dish names, allergen information.
- The vector logo and full-resolution photography.
- The Higgsfield footage.
- A domain, analytics and a cookie banner (only needed if analytics are added).

## Next steps after the owners choose
1. Owners answer `questions-for-owners.md` and supply the logo, photos and menu.
2. Build the chosen concept as the real site: pre-rendered pages, structured data, a proper menu page, social sharing images.
3. For The Griddle: generate the clips, run the frame script, tune pacing.
4. Launch on their domain.
