# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page marketing site for **Tripti Crafts**, a handwoven-saree house. No build step, no framework, no package manager — plain HTML + CSS served as files. Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Structure

- `index.html` — the entire homepage (hero, story, shop-by-weave, founder favourites, makers, values, newsletter, footer). All markup lives here.
- `warm-heritage.css` — the only stylesheet. Header comment marks it as design "Direction 1b — Warm Heritage".
- `logo.svg` — brand logo used in the header.

## Conventions to follow

- **BEM-style class names** scoped by section: block (`hero`, `story`, `weave`, `product`), element (`hero__title`, `product__price`), modifier (`btn--solid`, `stock--low`, `eyebrow--gold`). Match this when adding markup.
- **Design tokens are raw hex literals, not CSS variables.** The warm palette is consistent: accent maroon `#7a2e2e`/`#6e2b2b`, gold `#a97d3a`/`#d9b98a`, cream background `#faf4e9`, text `#332a20`. Reuse these exact values rather than introducing new colors.
- **Fonts** load from Google Fonts in the `<head>`: `Marcellus` (serif headings), `Jost` (body), `DM Mono` (eyebrows/captions), `Noto Serif Bengali`. Keep new type within this set.
- **Placeholder imagery** uses `.ph` (diagonal-stripe background) with a `.ph__cap` caption chip instead of real `<img>`s — real photography has not been dropped in yet.

## Known gaps

Nav links point to `our-story.html`, and the footer/back-link point to `index.html` as an "All designs" gallery — **neither of those extra pages exists yet**. Treat internal `.html` links as aspirational until those files are created.
