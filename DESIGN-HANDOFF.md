# Tripti Crafts — Complete Design Handoff

> **Purpose.** This document lets a fresh Claude Code session recreate the Tripti Crafts
> marketing site **exactly as it looks right now, with no design changes**. It is the map;
> the source files (`warm-heritage.css`, the 15 `.html` pages, `scroll-hint.js`) are the
> ground truth. Where a value appears here it is quoted verbatim from those files — reuse
> the exact literals, never "close enough" substitutes.

---

## 0. Non-negotiable constraints

- **No build step, no framework, no package manager.** Plain HTML + one CSS file + two tiny
  vanilla-JS blocks. Open `index.html` in a browser, or serve the folder:
  ```bash
  python3 -m http.server 8000
  ```
- **One shared stylesheet:** `warm-heritage.css` (design "Direction 1b — Warm Heritage").
  Every page links it. There are **no inline `<style>` blocks anywhere** and no other CSS file.
- **Design tokens are CSS custom properties** declared in `:root` at the top of
  `warm-heritage.css`. Colours are also referenced as raw hex in a few `data:` SVG URIs
  (chevrons, dropdown carets) — keep those hex values in sync with the tokens.
- **BEM-style class names** scoped by section: block (`hero`, `weave`, `product`), element
  (`hero__title`, `product__price`), modifier (`btn--solid`, `stock--low`, `chapter--rev`).
- **Placeholder imagery** uses `.ph` (diagonal woven stripe via `repeating-linear-gradient`)
  with a `.ph__cap` caption chip. Only a handful of real photos exist (see §14); everything
  else is intentionally a placeholder.
- Preserve the **known quirks in §15 exactly** — they are part of "as it looks right now."

---

## 1. File manifest

Create these at the project root (mirror the tree exactly):

```
index.html            our-story.html      shop.html          product.html
cart.html             checkout.html       my-account.html    wishlist.html
contact.html          faq.html            track-order.html   returns.html
exchange.html         shipping.html       saree-care.html
warm-heritage.css     scroll-hint.js      logo.svg
images/
  products/tc10227-noir.jpeg
  products/tc10228-copper.jpeg
  products/tc10229-aubergine.jpeg
  products/tc10230-azure-kantha.jpeg
  story/tripti-bagchi-portrait.jpg
  story/family-gathering.jpg
```

`logo.svg` is a large (~71 KB) multi-path brand mark rendered at `height:56px` in the header.
(Not present in the current tree but referenced: none — every `<img src>` above exists.)

---

## 2. Global document shell (identical on every page)

Every page's `<head>`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{Page} — Tripti Crafts</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Noto+Serif+Bengali:wght@400;500&family=Jost:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="warm-heritage.css" />
</head>
```

Exact `<title>` values:

| Page | Title |
|---|---|
| index | `Tripti Crafts — Warm Heritage` |
| our-story | `Our Story — Tripti Crafts` |
| shop | `Shop Sarees — Tripti Crafts` |
| product | `Tusser Silk Jal — Tripti Crafts` |
| cart | `Cart — Tripti Crafts` |
| checkout | `Checkout — Tripti Crafts` |
| my-account | `My Account — Tripti Crafts` |
| wishlist | `Wishlist — Tripti Crafts` |
| contact | `Contact — Tripti Crafts` |
| faq | `FAQs — Tripti Crafts` |
| track-order | `Track Order — Tripti Crafts` |
| returns | `Returns — Tripti Crafts` |
| exchange | `Exchange — Tripti Crafts` |
| shipping | `Shipping — Tripti Crafts` |
| saree-care | `Saree care — Tripti Crafts` |

Every page's `<body>` follows the same envelope, top to bottom:
1. `.announce` bar
2. `.topbar` — hidden `#nav-toggle` checkbox, `.hdr`, `.msearch`, `.mcats`
3. Page `<main>` / content
4. `.footer`
5. `.appbar` (mobile bottom bar)
6. Two `<script>` blocks: an inline block (always contains the appbar hide-on-scroll IIFE,
   plus any page-specific JS) then `<script src="scroll-hint.js"></script>`.

---

## 3. Design tokens (`:root`)

Reproduce verbatim. Header comment: `/* ===== Direction 1b — Warm Heritage ===== */`.

```css
:root {
  /* accents */
  --maroon:        #7a2e2e;  /* buttons, announce bar, makers band */
  --maroon-deep:   #6e2b2b;  /* links, outlines */
  --maroon-shade:  #5e2525;  /* darkest — makers weave texture, insta bg */
  --maroon-tint:   #732f2f;  /* lighter stripe in makers weave */
  --gold:          #a97d3a;  /* ornament lines, product codes, hover */
  --gold-light:    #d9b98a;  /* gold on dark surfaces */
  --gold-pale:     #fbeedb;  /* palest gold, text on maroon */
  --amber:         #c98a2c;  /* low-stock warning dot */
  --green:         #123d1a;  /* heritage green — Deep Bottle */
  --green-bright:  #1f5a2c;  /* divider diamond, green accents */

  /* surfaces */
  --cream:         #faf4e9;  /* page background */
  --cream-warm:    #f3ead6;  /* alternating section background */
  --cream-soft:    #f6e9d6;  /* text on the announce bar */
  --line:          #e6d9bf;  /* hairline borders on cream */
  --line-gold:     #d8c39a;  /* divider lines, input borders */

  /* text */
  --ink:           #332a20;  /* body text + footer background */
  --ink-heading:   #3a2a20;  /* headings */
  --ink-price:     #3a342a;
  --ink-body:      #5f5340;  /* paragraph copy */
  --ink-muted:     #5a4b34;  /* nav, labels */
  --ink-caption:   #4a4034;  /* placeholder captions */
  --ink-faint:     #8a7350;  /* fine print, sub-labels */
  --on-maroon:     #f4e4cf;  /* text on maroon band */
  --on-maroon-dim: #e6cfb4;

  /* placeholder weave textures */
  --ph-a: #ecdcc3; --ph-b: #f3e6cf; --ph-c: #e6d3b8; --ph-d: #efe0c6;
  --ph-e: #e9d8bb; --ph-f: #e2cdb0; --ph-g: #e9d6b8; --ph-h: #f1e2c6;
  --ph-i: #e6d3b3; --ph-j: #efe0c4;

  /* footer */
  --footer-bg:    #332a20; --footer-text:  #e6ddcb; --footer-col:   #c8bda6;
  --footer-tag:   #b3a892; --footer-label: #8a7d66; --footer-rule:  #47402f;

  /* neutrals */
  --white: #fff;
  --scrim-light: rgba(255,255,255,.75);
  --scrim-dark:  rgba(0,0,0,.35);
  --caption-brdr: rgba(74,64,52,.25);
  --orn-line:    rgba(169,125,58,.6);
}
```

Derived colours use `color-mix(in srgb, var(--green) N%, …)` for the green-tinted bands
(`.values`, `.belief`, `.lexicon`, `.welcome`, borders). Keep the mix percentages exact
(e.g. `.values` background = `color-mix(in srgb, var(--green) 10%, var(--cream))`).

**Global resets:** `* { box-sizing:border-box }`, `html{overflow-x:hidden}`,
`body{margin:0; overflow-x:hidden; max-width:100%; font-family:'Jost',sans-serif;
background:var(--cream); color:var(--ink); -webkit-font-smoothing:antialiased;
text-rendering:optimizeLegibility}`. Links: `var(--maroon-deep)`, no underline, hover
`var(--gold)`. `img{display:block; max-width:100%}`.

---

## 4. Typography

Four Google fonts, used strictly by role:

| Font | Role | Weights |
|---|---|---|
| **Marcellus** (serif) | All display/headings, product names, quotes | 400 only |
| **Jost** (sans) | Body copy, UI, inputs, buttons | 300 / 400 / 500 |
| **DM Mono** (mono) | Eyebrows, captions, codes, labels, breadcrumbs | 400 / 500 |
| **Noto Serif Bengali** | Bengali wordmark & lexicon glyphs | 400 / 500 |

Headings are always `font-weight:400` (Marcellus has no bold). Recurring type primitives:

- `.eyebrow` — DM Mono, 12px, `letter-spacing:.24em`, uppercase, `margin:0 0 20px`.
  Modifiers: `--accent` (maroon), `--gold` (gold-light), `--green` (green-bright).
- `.section-title` — Marcellus 40px, `var(--ink-heading)`.
- `.body` — 16px, `line-height:1.8`, `var(--ink-body)`, `max-width:520px`.
- `.link-underline` — 13px, `.14em`, uppercase, 1px maroon bottom-border, used for text CTAs
  (usually ending in `→`).

Display sizes by context (desktop): hero title **66px/1.06**, ostory-hero **62px**,
story/makers/newsletter titles **42–46px**, chapter titles **38px**, product title **38px**,
page-head title **46px**. Most drop to ~28–40px at ≤768px (see §13).

---

## 5. Shared components

### 5.1 Announcement bar `.announce`
Maroon band, `--cream-soft` text, centered, 12px, `.14em`, uppercase, `padding:11px`.
Copy: `Handwoven in Bengal · Complimentary shipping on orders over ₹5,000`.
Mobile ≤768: 10px, `.08em`, `padding:9px`.

### 5.2 Header `.hdr` (desktop)
`display:flex; justify-content:space-between; padding:24px 56px; border-bottom:1px solid var(--line)`.
Three parts, in DOM order:
1. `.hdr__burger` (hamburger `<label for="nav-toggle">`, **hidden on desktop**).
2. `.hdr__nav.hdr__nav--left` — links: **Shop**, then three `.navgroup` blocks
   (**Mens / Women / Accessories**), each a hidden checkbox + `.navgroup__head` label +
   `.navgroup__menu` of `shop.html` links. **See §15.1 — `.navgroup` has no CSS.**
3. `.hdr__brand` (center) — `logo.svg` at `height:56px` + `<span>Tripti Crafts</span>`,
   Marcellus 30px, `.06em`, `var(--maroon-deep)`.
4. `.hdr__nav.hdr__nav--right` — **Our Story**, **Search** (→shop), **Cart (0)**.
5. `.hdr__actions` — wishlist + cart SVG icons (**hidden on desktop**, shown on mobile).

Nav links: 12px, `.14em`, uppercase, `var(--ink-muted)`; left gap 34px, right gap 26px.

Navgroup / Mens / Women / Accessories link sets (all point to `shop.html`):
- **Mens:** Panjabi, Lower, Johar Coat, Dhooti
- **Women:** Sarees, Kurti, Kaftan, Salwar Suits, Dupatta / Stole, Ladies Jacket
- **Accessories:** Jewelry, Bags

### 5.3 Mobile search `.msearch` & categories `.mcats`
Hidden on desktop (`.hdr__actions, .msearch, .mcats, .appbar { display:none }`).
- `.msearch` — pill search input (`border-radius:999px`, magnifier SVG + `type="search"`).
- `.mcats` — horizontal scroll row of links: **Collections, Mens, Women, Accessories**.

### 5.4 Mobile bottom app bar `.appbar`
Fixed 5-column bar, shown only ≤768. Items (left→right): **Login** (my-account),
**Categories** (shop), center **Search** FAB (raised maroon circle), **New Arrivals** (shop),
**Cart**. Hides on scroll-down / returns on scroll-up via `.appbar--hidden`
(`transform:translateY(115%)`). Each item: icon + 10px label, `var(--ink-muted)`; FAB is a
46px maroon circle with 4px cream border, icon in cream.

### 5.5 Footer `.footer`
`background:var(--footer-bg)`(#332a20), `padding:76px 56px 46px`. Grid `1.4fr 1fr 1fr 1.2fr`:
- **Brand** — `.footer__wordmark` (Marcellus 26px, cream) + tagline
  "Carrying her spirit forward — handwoven sarees made slowly, with love."
- **Shop** — All sarees / Shop by weave / New arrivals / Gift a saree (plain text).
- **House** — Our story (link) / The makers / Journal / Contact.
- **Contact** — hello@tripticrafts.com / Kolkata, West Bengal / social:
  Instagram · Facebook.
- `.footer__copy` — DM Mono 11px: `© 2026 Tripti Crafts · Handwoven in India`.

### 5.6 Buttons
- `.btn` base — 13px, `.12em`, uppercase, inline-block.
- `.btn--solid` — maroon bg, cream text, `padding:16px 30px`; hover text→white.
- `.btn--outline` — 1px maroon-deep border, maroon-deep text, `padding:15px 28px`.
- `.btn--outline-gold` — gold-light border, gold-pale text (for dark bands).
- `.btn--full` — full-width, `padding:17px 30px` (cart/checkout CTAs).
- `.single_add_to_cart_button` maroon; `.buy-now-button` green (`--green` bg, gold-pale text).

### 5.7 Dividers, ornaments, placeholders
- `.divider` — centered: two `.divider__line` (110px, `--line-gold`) around a rotated 9px
  `.divider__diamond` (`--green-bright`). `--sm` line = 90px; `--gold` diamond variant.
- `.orn-frame` — 1px inset border (`--orn-line`); `.orn-corner--tl/--br` — 2px gold L-corners.
  Used on the hero image and the Our-Story hero frame (there in green-bright).
- `.ph` — `repeating-linear-gradient(135deg, var(--ph-a) 0 11px, var(--ph-b) 11px 22px)`
  (the woven-stripe placeholder). `.ph__cap` — DM Mono 10px caption chip, scrim-light bg;
  `--dark` variant for dark surfaces. `.ratio-45` = `aspect-ratio:4/5`.

### 5.8 Horizontal-scroll affordance (`.scroller`, from `scroll-hint.js`)
JS wraps every rail matching `.mcats, .weave__grid, .grid-4, .wc-tabs, .account-nav` in a
`.scroller`. While content fits, the wrapper is `display:contents` (inert). When a rail
overflows, the wrapper gets `.scroller--more` / `.scroller--back`, painting a 64px edge fade
plus a maroon chevron (inline `data:image/svg+xml` with `stroke='%237a2e2e'`) on the side that
has more to scroll. `--scroll-fade` defaults to `#faf4e9`, overridden to `#f3ead6` inside
`.weave`.

### 5.9 Shared page furniture (store + support pages)
- `.breadcrumb` — `padding:22px 56px 0`, DM Mono 11px, uppercase, faint; `·`/`›`-style
  `.breadcrumb__sep` in line-gold.
- `.page-head` — centered, `padding:52px 56px 40px`; `--warm` adds cream-warm bg.
  `.page-head__title` Marcellus 46px; optional `.page-head__lead` 16px body.

---

## 6. Homepage (`index.html`) — section order

1. **Hero** `.hero` — 2-col grid `1fr 1.15fr`.
   - Left `.hero__text` (cream-warm bg, `padding:92px 56px`): eyebrow
     "Since 2023 · In her memory"; `.hero__title` "Every saree / remembers / a woman."
     (66px, `<br>` line breaks); `.hero__body` intro copy; `.btn-row` with
     **Explore the collection** (solid) + **Our story** (outline).
   - Right `.hero__img.hero__slider` — a 4-slide carousel (`.hero__track` / `.hero__slide.ph`),
     each slide a `.ph` with a caption ("hero portrait · draped saree", "jamdani weave · in
     progress", "gold zari border · detail", "the maker at her loom"). Slides 2–4 vary the
     weave tint (see nth-child gradients). Overlaid: `.orn-frame`, two `.orn-corner`,
     `.hero__dots` (built by JS). Autoplay 4500ms, swipe/drag, pause on hover/hidden. See §14.1.
2. **Founder's favourites** `.favourites` — `.section-head` (eyebrow "Handpicked" +
   title "Founder's favourites" + "View all →") over a `.grid-4` of four `.product` cards.
   Card anatomy: `.product__img.ratio-45` (real product photo) with optional `.mark`
   ("Handloom mark") badge, `.product__name` (Marcellus 20px), `.product__sub`,
   `.product__code` (DM Mono, gold) + `.product__weight`, `.stock` (dot + label; `--low`
   turns amber/gold), `.product__foot` (`.product__price` + `.add` outline button).
   The four products (exact data):
   | Img | Name | Sub | Code · weight | Price |
   |---|---|---|---|---|
   | tc10227-noir.jpeg | Tusser Silk Jal | copper zari jaal | TC10227 · 300 g | ₹28,500 |
   | tc10228-copper.jpeg | Tissue Kora Jal | peach | TC10227 · 100 g | ₹4,999 |
   | tc10229-aubergine.jpeg | Georgette Jam Jal Work | aubergine floral jaal | TC10080 · 350 g | ₹18,500 |
   | tc10230-azure-kantha.jpeg | Cotton Emb Mirror Work | blue kantha embroidery | TC10046 · 290 g | ₹4,650 |
   (First card carries the `.mark` badge; all four show green "In stock".)
3. **Divider** (green diamond).
4. **Shop by craft** `.weave` (cream-warm) — eyebrow "Find your drape" + title "Shop by craft";
   `.weave__grid` = a horizontally-scrolling row of **24** `.weave__item` circles, each a
   `.weave__circle` (150px, `.ph`-style gradient) + `.weave__label`. Labels in order:
   Ajrakh, Bandhej, Kalamkari, Appliqué, Batik, Jamewar, Tissue, Organza, Kantha, Zardozi,
   Gujrati / Sindhi, Banarasi, Chikankari, Ikkat, Paithani, Madhubani, Jamdani, Kota, Gadwal,
   Khadi, Lambani, Digital Print, Katan, Cutwork. All link `shop.html`.
5. **Makers band** `.makers` — **present in DOM but `hidden style="display:none"`** (see §15.2).
6. **Values strip** `.values` — 4-col green-tinted band: 100% Handwoven · Natural Fibres ·
   Ready Blouse Option · Ships Worldwide (each a rotated diamond + label).
7. **Story ribbon** `.story` — 2-col `.9fr 1.1fr`: left `.ph` ("portrait of Tripti Bagchi");
   right eyebrow "Our story" + title "Tripti means satisfaction." + two `.body` paragraphs +
   "Read the full story →" link.
8. **Instagram** `.insta` (`--maroon-shade` bg) — head: title "Follow the weave" + handle
   `@tripticrafts` (**no eyebrow** — removed, see §15.3). `.filmstrip` auto-scrolls a
   `.filmstrip__track` of `.insta__tile` reels (captions "Reel — 02"…"Reel — 07"), duplicated
   once (`aria-hidden`, `tabindex="-1"`) for a seamless `insta-scroll` 48s loop, paused on
   hover. Each tile: 9:16, reel play badge, hover scrim + icon. Footer CTA "Follow @tripticrafts →".
   All links → `https://www.instagram.com/tripticrafts/`.
9. **Newsletter** `.newsletter-sec` (cream-warm, centered) — gold divider, eyebrow "Join the
   Tripti circle", title "Her story, and the newest weaves, / straight to your inbox.", body,
   `.subscribe` form (email input + Subscribe button, `onsubmit="return false"`), fine print.

---

## 7. Our Story (`our-story.html`)

- `.ostory-hero` — 2-col `1.05fr .95fr`, radial green-tint + cream bg. Left: title (62px),
  `.ostory-hero__lead`, `.ostory-hero__meta` (signature note + rule). Right: `.ostory-hero__frame`
  with `.ostory-hero__img.ratio-45` (real photo `images/story/tripti-bagchi-portrait.jpg`) and
  **green** corner ornaments.
- `.pull` — centered pull-quote block (rotated mark, Marcellus 34px `.pull__q`, `.pull__by`).
- **`.story-stack`** — a sticky "card stack": its direct `<section>` children pin with
  `position:sticky` at staggered `top` offsets (0/26/52/78px), each with a 26px top radius and
  upward shadow, opaque bg so each incoming card hides the one beneath. Contains alternating
  `.chapter` blocks (`--rev` reverses media order, `--warm` cream-warm bg) — each with
  `.chapter__num`, `.chapter__title` (38px), body, and a left-bordered `.chapter__quote`
  (green) — plus a `.belief` band. On ≤768 the stack falls back to normal flow (`position:static`).
- `.welcome` — "The welcome" 3-card grid (`.welcome__card`, cream-warm, bordered).
- `.journey` — 4-step numbered grid (`.journey__step`, top-ruled, DM Mono numbers).
- `.threads` — "three threads" 3-col grid of `.thread__img` (4:5 `.ph`) + region/name/note,
  with a Marcellus `.threads__foot` line.
- `.manifesto` — deep-green diagonal-stripe band (`repeating-linear-gradient` mixing green with
  black), gold-pale text, centered title + body.
- `.closing` — centered closing quote block.
- `.lexicon` — 5-col green-tinted band of Bengali/English word pairs (`.lexicon__bn` in Noto
  Serif Bengali 30px, `.lexicon__en` DM Mono). Collapses to 2-col at ≤768.

---

## 8. Shop / archive (`shop.html`)

Layout `.woocommerce > .shop-layout` = **`250px 1fr`** grid (sidebar + product grid). Markup
mirrors WooCommerce default template classes so a WordPress build can drop native templates onto
this CSS.

- **Sidebar `.widget-area`** (sticky `top:20px`). Each `.widget` is a collapsible accordion:
  hidden `.widget__toggle` checkbox + `.widget__title` (DM Mono 11px label with a `+`/`–`
  indicator via `::after`) + `.widget__body` (shown only when checked). Filter groups: **Shop
  for** (category list with counts), **Technique** (`.widget--scroll`, capped 232px scroll),
  colour **swatch-list**, and a **dual-handle price slider** (`.price-slider` with two range
  inputs, painted `.price-slider__fill`, `₹`-formatted `.price-slider__values`). On ≤768 the
  sidebar becomes an off-canvas drawer (`.filter-toggle` checkbox opens it; `.filter-backdrop`
  scrim; `.filter-open` pill button in the toolbar; `.widget-area__head` with title + close).
- **`.shop-toolbar`** — `.woocommerce-result-count` + `.woocommerce-ordering select` (custom
  gold caret). Stacks vertically on mobile with the Filters pill.
- **`ul.products`** — 3-col grid (`repeat(3,1fr)`, gap `34px 30px`) of `li.product` cards
  reusing the `.product` anatomy from §6; sale badge `.woo-onsale` (maroon). 2-col at ≤768.
- **`.woocommerce-pagination`** — 40px square page links, `.current` filled maroon.

---

## 9. Product (`product.html`)

- **`.single-product-main`** — `1.05fr .95fr` grid.
  - `.product-gallery` = `76px 1fr` (vertical thumbs + main 4:5 image). Thumb `.is-active`
    gets a maroon border; clicking a thumb swaps the main image (JS). Thumbs go horizontal at ≤768.
  - `.summary` — `.product_title` (Marcellus 38px), `.product__code`,
    `.woocommerce-product-rating` (gold `.star-rating`), `.price` (Jost 26px maroon, optional
    `del`), short description, `.product-meta-list` (2-col label/value grid, top+bottom ruled),
    `.cart-form` (`.qty-row` with `.quantity` stepper + full-width **Add to cart** and green
    **Buy now**; `.wishlist-add`), and `.assurances` (green-icon checklist).
- **`.the-details`** — cream-warm band, 5-col `.the-details__grid` of `.detail-cell` (rotated
  gold square mark + DM Mono title + note). 2-col at ≤768.
- **`.woocommerce-tabs`** — centered `.wc-tabs` tab strip (DM Mono, active underlined maroon) +
  `.wc-tab` panels (`[hidden]` toggled by JS).
- **`.related.products`** — reuses `.favourites`/`.grid-4` product grid under a centered
  Marcellus h2.

---

## 10. Cart / Checkout / Account / Wishlist

- **Cart** `.cart-page` = `1fr 360px`. Left: `.shop_table` line items (`.cart-item` thumb +
  name/meta, `.quantity` stepper, `.cart-remove`). Right: sticky `.cart_totals` (cream-warm,
  bordered) with `.totals-row`s, `--grand` total, `.coupon` field. On ≤768 the line-item table
  reflows into cards (thead hidden; rows become a grid with an absolutely-placed 72px thumbnail).
- **Checkout** `.checkout.checkout-page` = `1fr 400px`. Left: billing form (`.form-row`,
  `--split` two-up, `.input`/`.select`, `fieldset.payment` with `.pay-option` radios). Right:
  sticky `.order-review` (cream-warm) with `.order-line`s and grand total.
- **My Account** `my-account.html` shows both states: `.account-auth` (`1fr 1fr` login +
  register `.auth-card`s) and `.account-dash` (`230px 1fr` — `.account-nav` sidebar with
  `.is-active` maroon item + `.account-panel` order-history `.shop_table`). Nav goes horizontal
  scroll at ≤768.
- **Wishlist** `.wishlist-grid` — 4-col grid of `.product` cards (2-col at ≤768);
  `.wishlist-empty` empty state.

Shared form controls: `.input/.select/textarea.input` — cream bg, 1px line-gold border,
`padding:14px 15px`, Jost 15px; focus border → maroon.

---

## 11. Support / help pages

`contact.html`, `faq.html`, `track-order.html`, `returns.html`, `exchange.html`,
`shipping.html`, `saree-care.html` — all use `.breadcrumb` + `.page-head`, then:

- **`.prose`** — 760px centered article: Marcellus h2 (26px), 16px body, lists, `.note`
  (cream-warm, gold left-border callout). Used by returns / exchange / shipping / saree-care.
- **`.contact-layout`** — 2-col (`1fr 1fr`) info column (`.contact-info__item` label/value) +
  message form.
- **`.faq`** — native `<details>` accordion `.faq__item` (Marcellus 19px summary with `+`/`–`
  gold marker; default marker hidden).
- **`.track-box`** — 520px centered order-tracking form.

---

## 12. Responsive system

Mobile-first overrides live in two `@media (max-width:768px)` blocks plus a `@media
(max-width:480px)` tweak. Key breakpoint behaviors at **≤768px**:

- Header: burger + `.hdr__actions` icons appear; `.hdr__nav--left` becomes a dropdown panel
  toggled by `#nav-toggle` (`.nav-toggle:checked ~ .hdr .hdr__nav--left { display:flex }`);
  `.hdr__nav--right` hidden; brand `<span>` hidden, logo 42px. `.msearch`, `.mcats`, `.appbar`
  become visible.
- Hero, story, makers → single column (image first). Weave & favourites become
  edge-to-edge horizontal scrollers. Values → 2-col. Footer → 2-col with full-width brand and
  bottom padding clearing the app bar (`calc(32px + 72px + env(safe-area-inset-bottom))`).
- Type shrinks: hero 40px, section titles 30px, most section titles ~28px.
- Store pages: shop → 1-col with off-canvas filter drawer; `ul.products` 2-col; product →
  1-col with horizontal thumbs; cart/checkout → 1-col, totals un-stick; cart table → card
  reflow. At **≤480px** favourite cards widen to `78vw`.
- `@media (prefers-reduced-motion:reduce)` disables the hero track transition and filmstrip
  animation.

Section horizontal padding is **56px** on desktop, **24px** on mobile (some scrollers use
`0 …px 24px` to bleed to the edge).

---

## 13. JavaScript behaviors (vanilla, no libraries)

1. **App-bar hide-on-scroll** — present inline on every page. Toggles `.appbar--hidden` when
   scrolling down past `REVEAL_AT=90`, ignores jitter under `THRESHOLD=8`.
2. **Hero slider** (`index.html` only) — builds `.hero__dot`s, autoplays every `4500ms`,
   transitions `transform .6s cubic-bezier(.4,0,.2,1)`, supports touch + mouse drag (15% width
   threshold to advance), pauses on hover and when the tab is hidden.
3. **Price slider** (`shop.html`) — keeps the two range thumbs from crossing, paints the
   selected range on the rail, mirrors `₹`-formatted values (`toLocaleString('en-IN')`) into
   the labels; reads `data-min/-max/-step` off `.price-slider`.
4. **Product page** (`product.html`) — thumbnail→main image swap, `.wc-tabs` tab switching
   (toggles `panel.hidden`), and the `.quantity` +/– stepper (min 1, via `data-dir`).
5. **`scroll-hint.js`** (linked last on every page) — the `.scroller` edge-fade/chevron
   affordance described in §5.8.

No analytics, no cookies, no external JS. Forms use `onsubmit="return false"` (non-functional
by design — this is a static marketing shell).

---

## 14. Assets

- **Fonts** — loaded from Google Fonts only (§2). Fallbacks: `'Marcellus', serif`,
  `'Jost', sans-serif`, `'DM Mono', monospace`, `'Noto Serif Bengali', serif`.
- **Logo** — `logo.svg` (root), rendered `height:56px` in header (42px mobile).
- **Real photos** (the only non-placeholder imagery):
  - `images/products/tc10227-noir.jpeg`, `tc10228-copper.jpeg`, `tc10229-aubergine.jpeg`,
    `tc10230-azure-kantha.jpeg` — homepage & product cards.
  - `images/story/tripti-bagchi-portrait.jpg`, `images/story/family-gathering.jpg` — Our Story.
- **Everything else is a `.ph` placeholder** (woven-stripe gradient + caption). Icons are
  **inline SVG** (stroke `currentColor`), never icon fonts or image files.

---

## 15. Known quirks — reproduce exactly (do NOT "fix")

1. **`.navgroup` dropdowns have no CSS.** The Mens/Women/Accessories groups in the desktop left
   nav use `.navgroup`, `.navgroup__toggle` (hidden checkbox), `.navgroup__head` (label), and
   `.navgroup__menu` — **none of which are styled in `warm-heritage.css`**. As a result the
   label and all sub-links render as default inline/block text (no hover panel). This is the
   current state; keep it unless explicitly asked to add the menu styling.
2. **Homepage makers band is hidden.** `<section class="makers" hidden style="display:none">`
   ships in the DOM but is not visible. Preserve both the `hidden` attribute and inline
   `display:none`.
3. **Instagram section has no eyebrow.** The eyebrow line above "Follow the weave" was removed
   (latest commit). Head contains only the title + `@tripticrafts` handle.
4. **Internal links are partly aspirational.** Most nav/footer/category links point to
   `shop.html` (or are plain text). Footer "Shop" column items and several "House"/"Contact"
   entries are non-links. Keep the exact `href`s from the source.
5. **Product code repetition** — the second homepage card intentionally shows code `TC10227`
   (same as the first). Reproduce as-is.
6. There is a separate `tripti-crafts/` subdirectory (an in-progress WordPress port) and
   `MIGRATION-TO-WORDPRESS.md`. **They are not part of this static site** — ignore them when
   recreating the design.

---

## 16. Recreation checklist

- [ ] `warm-heritage.css` reproduced verbatim (tokens, all component rules, both media blocks).
- [ ] All 15 HTML pages with the shared shell (§2), exact titles, and identical header/footer/
      appbar markup.
- [ ] `scroll-hint.js` and the per-page inline scripts (§13) in place, in the right order.
- [ ] `logo.svg` + the 6 real images present at the exact paths in §1.
- [ ] Placeholders left as `.ph` where no real photo exists.
- [ ] All §15 quirks preserved.
- [ ] Spot-check at 1440px and 375px against the breakpoints in §12.
```