# Tripti Crafts — Migration Plan: Static Site → Custom Classic WooCommerce Theme

> **STATUS (2026-08-31): BUILT.** The theme now exists at [`tripti-crafts/`](tripti-crafts/) in this
> repo (see its `README-THEME.md` for install/seed instructions) and is deployed & verified on the
> Local site **tripti-crafts-staging** (`http://tripti-crafts-staging.local`) with WooCommerce +
> ACF (free). The static `.html` files remain as design reference. This document is the record of
> the plan and its rationale.

**Decision:** Build toward a **classic PHP WordPress theme** (not a block/FSE theme, not headless).
**Status:** Planning only. No files have been moved yet — this document is the roadmap.
**Goal of this doc:** Reorganize the *current static project* so that the eventual hand-off into a
classic PHP theme is mostly mechanical (copy → rename → sprinkle PHP), with every structural
choice justified against WordPress's official documentation.

---

## 0. Governing principle — theme = layout only, all content is admin-editable

> **The custom theme supplies the fixed layout, design, and structure — nothing else.**
> **Every image and every piece of text on every page is entered and edited by the admin from the
> WordPress dashboard, with no re-upload of theme files, ever.**

Concretely this means the theme ships with **zero hardcoded user-facing content**. There are no baked-in
prices, headings, paragraphs, captions, alt text, button labels, hero photos, or section images. The
theme only defines *where* things go and *how* they look; the admin fills in *what* they say and show.

**Consequences that drive the whole build (non-negotiable):**
- **Every `<img>`** on every page → sourced from the Media Library via a WooCommerce image, a
  Customizer image control, or an ACF image field. No image file is referenced directly from the theme
  except purely decorative chrome (e.g. the SVG ornaments) — even the logo is a Customizer upload.
- **Every visible string** → sourced from a product field, a Page body, a menu, a Customizer setting,
  or an ACF field. Placeholder/default text may ship as a fallback, but is always overridable.
- **Alt text and captions count as content too** → each image field carries its own editable
  alt/caption, so accessibility text is admin-managed, not frozen in markup.
- The **only** things that require touching theme files afterward are *layout, CSS, and adding a
  brand-new kind of section* — i.e. design changes, never content changes.

§8 is the exhaustive, page-by-page realization of this principle.

---

## 1. Why a classic PHP theme (the decision, recorded)

Three facts about this codebase make the classic path the low-friction, low-risk one:

1. **The markup already speaks WooCommerce's classic vocabulary.** `product.html` and `shop.html`
   already use the exact classes WooCommerce's PHP templates emit — `woocommerce`,
   `single-product-main`, `product_title`, `price`, `single_add_to_cart_button`, `widget-area`,
   `star-rating`. In a classic theme those class names come "for free" from WooCommerce's own
   templates, so our CSS keeps working. In a block theme they would be discarded.
2. **A large bespoke stylesheet** (`warm-heritage.css`, 1,213 lines) and deliberately custom markup
   (hero carousel, custom sticky header, ornaments). A classic theme carries these over verbatim;
   a block theme would force re-expression through `theme.json` + block structures.
3. **Pages map ~1:1 onto the classic template hierarchy** (see §3). The conversion is rename-heavy,
   not rebuild-heavy.

> Trade-off acknowledged: WordPress's *official* strategic direction favors block themes, and
> WooCommerce's newest Cart/Checkout ship as blocks. Classic themes remain fully supported and are
> the pragmatic choice here; this is a deliberate, documented trade-off, not an oversight.

---

## 2. The four WordPress mechanisms that dictate our structure

Everything below is driven by four things WordPress does automatically. Understanding them is what
tells us how to pre-organize the static files.

### 2a. Required theme files
A classic theme is recognized by WordPress from just **`style.css` + `index.php`**. `style.css` must
sit in the theme root and carry a header comment (Theme Name, Author, Version, Text Domain, License,
etc.) — that comment is how the theme appears in **Appearance → Themes**.
→ *Cite:* [Main Stylesheet (style.css)](https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/)

**Implication for us:** `warm-heritage.css` will become the theme's `style.css` (with the header
comment prepended), or stay a separate enqueued stylesheet with a minimal header-only `style.css`.
We should decide this now and name accordingly.

### 2b. The template hierarchy
WordPress "searches down through the template hierarchy until it finds a matching template file …
and uses the **first matching template file**," falling back to `index.php`.
→ *Cite:* [Template Hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/)

Relevant matches for this store:

| Our page | WP template (classic) | Notes |
|---|---|---|
| `index.html` (homepage) | `front-page.php` | Static front page takes `front-page.php` first |
| `shop.html` (product listing) | `archive-product.php` (WooCommerce) | The shop/category archive |
| `product.html` (single product) | `single-product.php` (WooCommerce) | Product detail |
| `cart.html` | Cart page = `page.php` rendering the `[woocommerce_cart]` block/shortcode | Content-driven, not a template file |
| `checkout.html` | Checkout page = `page.php` + Checkout block/shortcode | Content-driven |
| `my-account.html` | My Account page + `myaccount/` templates | Content-driven |
| `our-story.html` | `page-our-story.php` or `page.php` | Static page |
| `contact / faq / shipping / returns / exchange / saree-care / track-order` | `page-{slug}.php` → `page.php` | Static content pages |
| `wishlist.html` | Plugin-driven page (e.g. YITH/TI Wishlist) | Not core WooCommerce |
| (missing) | `404.php`, `search.php` | Add during migration |

**Implication for us:** name and think of each HTML file by the template it will become, so the
rename step is obvious later.

### 2c. Template partials (kill the duplicated header/footer)
Right now the **announce bar + header + mobile search + category nav** block and the **footer +
mobile app-bar** block are copy-pasted into all 15 HTML files. WordPress solves this with
`get_header()` / `get_footer()` / `get_sidebar()` and, for anything reusable,
`get_template_part()`, which "provides a simple mechanism for child themes to overload reusable
sections of code" and is included with `require` so it can be used repeatedly.
→ *Cite:* [get_template_part()](https://developer.wordpress.org/reference/functions/get_template_part/),
[get_header()](https://developer.wordpress.org/reference/functions/get_header/)

**Implication for us:** physically extract the shared header/footer chunks *now* (see §5, step 2) so
that "one header, included everywhere" is already true before any PHP exists. This is the single
biggest friction-reducer.

### 2d. Enqueuing CSS/JS (stop hardcoding `<link>`/`<script>`)
WordPress's documented method is `wp_enqueue_style()` / `wp_enqueue_script()` called from
`functions.php` on the `wp_enqueue_scripts` hook — *not* hardcoded tags in the `<head>`. The docs
warn a site "will also be using many different plugins," and enqueuing "will ensure the site remains
efficient and that there are no incompatibility issues," with proper dependency + version handling.
→ *Cite:* [Including CSS & JavaScript](https://developer.wordpress.org/themes/basics/including-css-javascript/)

Today every page hardcodes the Google Fonts `<link>` and `<link rel="stylesheet" href="warm-heritage.css">`,
plus inline `<script>` and `scroll-hint.js`. All of these become **one `wp_enqueue_scripts` function**.

**Implication for us:** consolidate the inline `<script>` in `index.html` into a real JS file now, so
there's a clean, finite list of assets to enqueue later.

### 2e. WooCommerce template overrides
WooCommerce lets a theme override any of its templates by copying the file into a **`woocommerce/`
folder inside the theme**, mirroring the plugin's structure (minus `/templates/`). "The copied file
will now override the WooCommerce default template file," and this stays upgrade-safe. A theme
declares support via `add_theme_support( 'woocommerce' )`; a top-level `woocommerce.php` takes
priority over other templates. Prefer **hooks/filters** over editing markup where possible.
→ *Cite:* [WooCommerce — Template structure & overriding templates](https://developer.woocommerce.com/docs/theming/theme-development/classic-theme-development/template-structure/)

**Implication for us:** the custom product-gallery / summary markup in `product.html` and the
product-grid markup in `shop.html` map to specific WooCommerce templates
(`content-single-product.php`, `content-product.php`, `archive-product.php`) that we will place in
the theme's `woocommerce/` folder. Keeping our product-card markup close to WooCommerce's default
now makes those overrides small.

---

## 3. Target theme folder structure (where we're heading)

```
tripti-crafts/                     ← the theme folder (wp-content/themes/tripti-crafts)
├── style.css                      ← required header comment (+ maybe the main CSS)
├── functions.php                  ← enqueues, add_theme_support(), menus, image sizes
├── index.php                      ← required fallback template
├── front-page.php                 ← from index.html (homepage)
├── page.php                       ← generic page (contact, faq, shipping, returns, …)
├── page-our-story.php             ← from our-story.html (optional bespoke page template)
├── 404.php                        ← to be created
├── search.php                     ← to be created
├── header.php                     ← the announce+header+msearch+mcats block
├── footer.php                     ← the footer + mobile app-bar block
├── sidebar.php                    ← shop filters (widget-area) if used as a real sidebar
├── template-parts/                ← get_template_part() targets
│   ├── product-card.php           ← the <article class="product"> card
│   ├── hero-slider.php
│   ├── section-values.php
│   └── section-newsletter.php
├── woocommerce/                   ← WooCommerce template overrides (upgrade-safe)
│   ├── archive-product.php        ← from shop.html
│   ├── content-product.php        ← product card in loops
│   ├── single-product.php         ← from product.html
│   └── single-product/            ← gallery, tabs, add-to-cart partials as needed
├── inc/                           ← PHP helpers/classes (optional)
│   └── woocommerce.php            ← WooCommerce-specific hooks/filters
└── assets/
    ├── css/warm-heritage.css
    ├── js/main.js  (carousel + appbar)  and  scroll-hint.js
    └── images/  (logo.svg, product photos)
```

This mirrors the handbook's recommended split of `assets/` (CSS/JS/images) and `inc/` (PHP helpers),
with `template-parts/` for reusable sections.
→ *Cite:* [Theme structure](https://developer.wordpress.org/themes/core-concepts/theme-structure/)
(the `assets` + `inc` convention is called out as the common optional structure).

---

## 4. File-by-file mapping (current → theme)

| Current file | Becomes | Mechanism |
|---|---|---|
| `index.html` | `front-page.php` (+ template-parts) | Template hierarchy §2b |
| `shop.html` | `woocommerce/archive-product.php` | WC override §2e |
| `product.html` | `woocommerce/single-product.php` | WC override §2e |
| `cart / checkout / my-account.html` | WordPress *pages* w/ WooCommerce shortcodes/blocks | Content, not templates |
| `our-story.html` | `page-our-story.php` | Template hierarchy |
| `contact/faq/shipping/returns/exchange/saree-care/track-order.html` | `page.php` (content in editor) | Template hierarchy |
| `wishlist.html` | wishlist plugin page | Plugin |
| shared header block (all files) | `header.php` | Partials §2c |
| shared footer + app-bar (all files) | `footer.php` | Partials §2c |
| `<article class="product">` card | `template-parts/product-card.php` / `content-product.php` | Partials + WC |
| Google Fonts `<link>` + `warm-heritage.css` link | `wp_enqueue_style()` in `functions.php` | Enqueue §2d |
| inline `<script>` + `scroll-hint.js` | `assets/js/*.js` → `wp_enqueue_script()` | Enqueue §2d |
| `logo.svg`, `images/` | `assets/images/` + `get_template_directory_uri()` refs | Asset paths |
| hardcoded prices/codes/stock in HTML | WooCommerce product fields (DB) | Data → WooCommerce |

---

## 5. What to do NOW (while it's still static HTML) — ordered, low-risk

These steps keep the site a working static site *and* shrink the future PHP step. Each is safe to do
before any WordPress exists. **I have not done these yet — this is the proposed work.**

1. **Introduce the theme folder layout for assets.** Create `assets/css/`, `assets/js/`,
   `assets/images/`; move `warm-heritage.css`, `scroll-hint.js`, `logo.svg`, and `images/` into it;
   update the `<link>`/`<img>`/`<script>` paths. *Why:* the final `assets/` tree exists on day one, so
   enqueue paths and `get_template_directory_uri()` references are trivial later. (§2d, §3)

2. **De-duplicate the header and footer into single source files.** Extract the announce+header+
   msearch+mcats block into one `partials/header.html` and the footer+app-bar into
   `partials/footer.html`, then include them into every page via a tiny build step **or** at minimum
   reduce them to one canonical copy that all pages are kept identical to. *Why:* this is the exact
   boundary of `get_header()`/`get_footer()`; when the header markup lives in one place, becoming
   `header.php` is a rename. (§2c) — *Note:* pure static HTML can't `include`, so options are (a) a
   trivial Node/PHP include step, (b) keep a single canonical partial and copy on change, or (c) do
   this extraction *at* the WordPress step. Recommend (a) or (b); flagged for your call in §7.

3. **Extract the product card into one canonical partial.** The `<article class="product">…</article>`
   block repeats in `index.html` and `shop.html`. Make it one snippet. *Why:* becomes
   `template-parts/product-card.php` / WooCommerce `content-product.php`. (§2c, §2e)

4. **Move inline JS out of `index.html`.** Consolidate the carousel + app-bar scripts into
   `assets/js/main.js`. *Why:* gives a finite, enqueueable asset list. (§2d)

5. **Externalize product data into one place.** Today prices, product codes (`TC10227`), weights,
   and stock state are hardcoded across cards. Pull them into a single `data/products.json` and (if
   we add the build step) render cards from it. *Why:* this is the data that will live in WooCommerce
   products; centralizing it now makes the eventual WooCommerce import a mapping exercise, not a
   scavenger hunt across HTML. (§2e)

6. **Fix aspirational internal links & add missing pages.** CLAUDE.md notes some `.html` links are
   aspirational. Make the link targets match the future permalink slugs (`/shop/`, `/product/…`,
   `/our-story/`), and stub `404` and `search`. *Why:* fewer surprises when permalinks go live.

7. **Prepend a `style.css` theme header comment (draft).** Even in the static repo, keep a ready
   theme header (Theme Name: Tripti Crafts, Text Domain: tripti-crafts, etc.) so `style.css` is
   valid the moment it's dropped into `wp-content/themes/`. (§2a)

**Deliberately deferred to the WordPress step (don't do now):** writing `functions.php`, the actual
`.php` renames, WooCommerce template overrides, i18n wrapping of strings (`__()`, `esc_html_e()`),
and escaping. These need a running WP + WooCommerce install to test against.

---

## 6. Naming & convention rules to adopt immediately

- **Text domain / theme slug:** `tripti-crafts` everywhere (folder, `Text Domain:`, enqueue handles).
- **Keep WooCommerce class names intact.** Continue using `product`, `product__price`,
  `single_add_to_cart_button`, `widget-area`, etc. — do *not* rename them; they're the contract with
  WooCommerce's templates. (§2e)
- **Relative, root-anchored asset paths** (`assets/images/logo.svg`) so a later swap to
  `get_template_directory_uri() . '/assets/images/logo.svg'` is find-and-replace.
- **One section = one includable chunk**, matching the future `template-parts/` split.

---

## 7. Open questions for you (need a decision, not access)

No new connectors or credentials are required for planning or for the static reorganization. I'd want
your call on these before executing §5:

1. **Build step or not?** Static HTML can't natively `include` partials. Do you want a tiny
   include/build step (Node or PHP) so the header/footer/product-card genuinely live in one file, or
   keep a single canonical copy and sync by hand until the WP step? (Recommendation: minimal build
   step — it makes step 2, 3, 5 real rather than conventions on paper.)
2. **`style.css` as the main stylesheet, or header-only?** Fold `warm-heritage.css` into `style.css`,
   or keep it separate and enqueue it (header-only `style.css`)? (Recommendation: keep separate +
   enqueue — cleaner, and matches the `assets/css/` layout.)
3. **Wishlist plugin choice** (YITH vs. TI Wishlist vs. custom) — affects how `wishlist.html` maps.
4. **When you're ready to actually build the theme,** I'll need a local WordPress + WooCommerce
   environment to test against (Local by Flywheel, `wp-env`, or Studio). That runs on your machine; I
   don't need any special access — just tell me which you'll use and I'll target it.

---

## 8. Content editability map — what the admin can change from the dashboard

**Principle:** anything the admin should edit *without a developer or a re-upload* must be stored as
**content (database)**, never hardcoded in a theme file. The theme reads it and renders it. Only the
*design/layout/logic* stays in files.

**Recommended storage per region** (three mechanisms):
- **WooCommerce** → products, prices, stock, product images, categories.
- **Pages + block editor** → long-form page bodies (Our Story, FAQ, Shipping, Returns…).
- **Customizer** → a few global values (announce bar, footer contact, social links).
- **Advanced Custom Fields (ACF)** → structured homepage/section content (hero slides, story
  paragraphs, section images). Recommended because it gives the admin clean, labeled fields and
  repeaters (e.g. "add another hero slide", "add another story line") with no code.

### Homepage (`front-page.php`) — every region admin-editable

| Region (in `index.html`) | Becomes editable via | Admin action later |
|---|---|---|
| Announce bar text | Customizer (or ACF options) | Type new shipping-offer text |
| Hero eyebrow / title / body / button labels | ACF text fields | Edit copy inline in dashboard |
| **Hero slider images + captions** | **ACF repeater** (image + caption per slide) | Upload hero images later; add/remove/reorder slides |
| Founder's favourites | WooCommerce (featured products) | Mark products as featured |
| Shop-by-weave tiles (label + image) | ACF repeater (or product categories) | Swap weave images/labels |
| Values strip (100% Handwoven…) | ACF repeater | Edit/add value items |
| **Story section text** | **ACF textarea / WYSIWYG** | **Add a few more lines to the story later** |
| Story section image | ACF image field | Swap the portrait later |
| Instagram section | ACF repeater or Instagram plugin | Update handle/tiles |
| Newsletter copy | ACF text (form via plugin) | Edit heading/blurb |

### Our Story / About (`our-story.html`)

| Region | Editable via | Admin action |
|---|---|---|
| Body copy | Page block editor **or** ACF fields | Rewrite/extend text |
| **About images** | ACF image fields (or image blocks in the editor) | **Upload/replace images later** |

### Global (header/footer, all pages)

| Region | Editable via | Admin action |
|---|---|---|
| Header nav links | Appearance → Menus | Add/rename/reorder links |
| Category nav | WooCommerce product categories | Manage categories |
| Logo | Customizer (Site Identity) | Upload a new logo |
| Footer email / address / socials | Customizer or ACF options | Update contact details |

### Shop & Product pages (`archive-product.php`, `single-product.php`)

| Region | Editable via | Admin action |
|---|---|---|
| Every product image / gallery | WooCommerce product → Images | Upload/replace per product |
| Product name, price, code, stock, description | WooCommerce product fields | Edit per product |
| Category names, filter sidebar terms | WooCommerce categories/attributes | Manage taxonomy |
| Shop page intro heading/lead | ACF fields on the Shop page | Edit copy |

### Content pages (Contact, FAQ, Shipping, Returns, Exchange, Saree Care, Track Order)

| Region | Editable via | Admin action |
|---|---|---|
| All body text | Page block editor | Rewrite freely |
| **All images on these pages** | Media Library via image blocks / ACF image fields | Upload/replace anytime |
| Headings, eyebrows, contact details | Page editor / ACF fields | Edit inline |

> These 7 pages become ordinary WordPress **Pages** — the admin owns 100% of their text and images
> from the editor. The theme only styles them.

### What still needs a developer + file change (correct boundary)
- Adding a **new type of section** or changing the **layout/CSS**.
- New **template logic** or WooCommerce template overrides.
- New **field definitions** (e.g. adding a brand-new editable region → register the ACF field once).

> Net effect: after build, the admin freely uploads hero images, swaps About photos, extends the
> story copy, edits every product, and updates menus — all from the dashboard, zero re-uploads.
> Only structural/design changes touch the theme files.

**New open question (adds to §7):** confirm we'll use **ACF** (free plugin) for structured homepage/
section fields. It's the standard choice and makes the hero/story/section editing above possible with
labeled dashboard fields. Alternative is hand-rolled Customizer settings (more code, clunkier admin
UI for repeaters). *Recommendation: ACF.*

---

### Sources (WordPress / WooCommerce official docs)
- Theme structure & recommended folders — https://developer.wordpress.org/themes/core-concepts/theme-structure/
- Template hierarchy — https://developer.wordpress.org/themes/basics/template-hierarchy/
- Main stylesheet (style.css) requirements — https://developer.wordpress.org/themes/basics/main-stylesheet-style-css/
- Including CSS & JavaScript (enqueuing) — https://developer.wordpress.org/themes/basics/including-css-javascript/
- get_template_part() — https://developer.wordpress.org/reference/functions/get_template_part/
- get_header() — https://developer.wordpress.org/reference/functions/get_header/
- WooCommerce template structure & overrides — https://developer.woocommerce.com/docs/theming/theme-development/classic-theme-development/template-structure/
