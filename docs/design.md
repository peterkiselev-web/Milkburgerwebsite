# Milk Burger website: concept design

## Goal
Show Milk Burger's owners two website drafts, each carrying everything public about the restaurant, so they can pick one to refine into the finished site. A draft for review, not a launch.

## Who it's for
1. **The owners**, judging which direction feels like Milk Burger.
2. **Their eventual visitors**, mostly on phones and often on the pavement, asking: is it open, where is it, what's on the menu? Every concept answers that within one screen.

## The two concepts

| | The Griddle | Cream |
| --- | --- | --- |
| Feel | Cinematic, dark, food-film | Minimal, editorial, Instagram-like |
| Hero | A scroll-driven film of one burger being cooked | Big logo, tagline, three-photo grid |
| Signature moment | The smash, the melt, the pour | Milk drips falling into the visit section |
| Effort to maintain | Higher (footage) | Lowest |
| Page weight | Heavy once the footage is in (frames load progressively) | Light |

Both include, from one content file: menu, kitchen philosophy, chef, founders, smash vs juicy, the two rooms, the site's burger history, press quotes, FAQ, live open or closed status, address, transport and Instagram.

## Shared foundation
- **Content:** `src/content/restaurant.json` holds every fact and line of copy. Change it once and both concepts update. Prices are `null` until confirmed and show as TBC.
- **Draft markers:** `TBC` for missing prices, `to confirm` for facts from a single source. A toggle in the draft strip hides them for a clean preview.
- **Open now:** calculated in London time, whatever timezone the visitor is in. `hours.overrides` handles one-off closures, e.g. `{ "date": "2026-12-25", "closed": true, "note": "Christmas Day" }`.
- **Brand:** colours taken from the restaurant's own material: burgundy and cream from the logo, black awning, rust banquettes, stainless steel, pale blue and timber from the rooms. Headings use Milk Burger, a custom two-colour font built from the logo itself: the nine letters in the logo (M, I, L, K, B, U, R, G, E) are traced from it, and the rest of the alphabet, digits and punctuation are drawn in the same melted, outlined style from Darumadrop One, the free font that measured closest to the logo's letters. The outline takes the text colour and the cream letter body can be swapped per section. Lowercase sets as small capitals. Rebuild it from a better logo file with `scripts/font/build.sh`. Body text is Instrument Sans. No serif anywhere.
- **Logo:** a placeholder traced from the Instagram profile picture. Replace `src/brand/logo-placeholder.svg` with the original vector file. Its two layers (`--logo-ink` and `--logo-fill`) let each concept recolour it.
- **Images:** each photo tries its local file, then a hosted fallback, then a styled placeholder. A missing file never shows a broken image.
- **Navigation:** set by usability research rather than taste.
  - On wide screens every section stays visible in a slim bar across the top, underlined where you are. In Nielsen Norman Group's test of 179 people on 6 sites, desktop visitors used navigation hidden behind a button in only 27% of tasks, against 48% when it was visible, and took 5 to 7 seconds longer to reach it.
  - On phones and tablets a "Menu" button floats at the bottom centre. Hiding 7 links on a phone is the accepted trade-off. The word "Menu" is there because the three-line icon on its own isn't universally recognised.
  - The button sits in the middle because Steven Hoober's studies of 1,333 phone users found people tap the centre of the screen most accurately (7 mm targets, against 12 mm in the corners). The top-right corner most sites use is the hardest spot to hit.
  - "See the menu" and "Find us" shortcuts near the top mean the two most common jobs never depend on finding the menu.

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
