# Milk Burger display font

`src/brand/fonts/milk-burger.woff2` is built from the restaurant's logo.

- **M, I, L, K, B, U, R, G, E** are the logo's own letters, traced from `src/brand/logo-placeholder.svg`. Both R's from the logo are kept: typing `BURGER` picks the long-drip R automatically, so `MILK BURGER` typed in the font matches the logo.
- **Every other letter, the digits and punctuation** start from [Darumadrop One](https://github.com/ManiackersDesign/darumadrop), the free font whose capitals overlap the logo's letters most closely (we scored 15 rounded display fonts). Each one is thickened to the logo's stroke weight, given a hand-drawn tilt and wobble, and a few milk drips.
- **Every glyph** then gets the logo's outline: an even burgundy edge around a cream body, with counters (the holes in B, R, O) filled in the outline colour.
- **Lowercase** sets as small capitals.

It is a two-colour (COLR) font. The outline follows the CSS `color`; the body comes from the font palette, cream by default, and can be changed with `font-palette` (see the `@font-palette-values` rules in `src/shared/base.css`). Kerning pulls letters together until their outlines merge, as on the logo, without one letter's outline covering the next one's body.

## Rebuilding

When the owners send the original logo artwork, export it as an SVG that paints the letter bodies with `var(--logo-fill)` and the outlines with `var(--logo-ink)` (as the placeholder does), then run:

```sh
pip install numpy scipy pillow fonttools brotli potracer
scripts/font/build.sh path/to/logo.svg
```

It needs Node with Playwright (to render the SVG) and npm (to fetch Darumadrop One).

## Licence

Because part of the font is derived from Darumadrop One, the font file is released under the SIL Open Font License 1.1 (`src/brand/fonts/OFL.txt`). The logo itself remains the restaurant's trademark.
