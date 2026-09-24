# Brief: convert approved Penpot page designs to frontend pages

Repo: ~/penpot/publish/arasta-penpot-mcp/web (static site generator, no framework). Output of `node build.mjs` is ../docs (GitHub Pages).
The Penpot designs are APPROVED — reproduce them faithfully. The design spec for every page is its Penpot builder:
~/penpot/publish/arasta-penpot-mcp/designer/v2/pages-a.js (home…flash), pages-b.js (rfq…dashboard), pages-c.js (login…states), plus shell.js/ui-*.js for components.
Mapping Penpot builder key → slug: home→ana-sayfa, categories→kategoriler, search→arama, pdp→urun, compare→karsilastir, suppliers→tedarikciler, store→magaza, flash→flash, rfq→teklif-iste, quotes→teklifler, cart→sepet, checkout→odeme, order→siparis, messages→mesajlar, dashboard→panel, login→giris, signup→kayit, trust→guvence, sell→tedarikci-ol, help→yardim, about→hakkimizda, states→durumlar.

## Contract
- Write `src/pages/<slug>.mjs` exporting `default function ({ page, screen }) → { main: htmlString, bottom?: htmlString, title?: string }`.
  `bottom` (phone only) replaces the bottom tab bar with a sticky action bar (e.g. PDP “Sepete ekle”, cart “Ödemeye geç”) — mirror the Penpot `sticky:` option.
- Optional page CSS in `src/pages/<slug>.css` (prefix every selector with a page class you put on your root element, e.g. `.pg-urun …`). Do NOT edit shared files: src/lib/*, src/tokens.css, src/components.css, src/pages.css, src/devices.mjs, src/data.mjs, build.mjs, src/app.js. If you truly need a shared helper, define it locally in your page module.
- Use helpers from `src/lib/html.mjs` (ctx, ic, btn, iconBtn, badge, chip, field, check, toggle, rating, stepper, media, productCard, supplierCard, eventCard, catTile, priceTiers, tierProgress, aiSearch, timeline, statCard, emptyState, secHead, breadcrumb, iconTile, feature, section, grid, link, isSmall, isWide, isTV) and data from `src/data.mjs`. Study `src/pages/ana-sayfa.mjs` + `src/pages.css` as the reference implementation.
- Adaptive, not just responsive: branch on `ctx.fam` (phone | phoneL | tablet | tabletL | desktop | wide | ultra | tv) exactly like the Penpot builders branch on `d.fam` (e.g. WIDE → two columns with sidebar; phone → stacked, filters via `data-open="filters"` button; TV → its own 10-foot layout: dark, large targets, D-pad-friendly rows, QR hand-off for forms/checkout/login-device-code as in the builders). `ctx.screen` has w/h/id.
- Grids: reuse `.g-products .g-cats .g-events .g-suppliers .g-features .g-2 .g-3 .g-4` (columns per family already defined) or define your own per-family rules with `[data-fam=…]` / `[data-screen=…]` selectors.
- Links between pages: `link('<slug>')` (stays inside the current screen folder).
- Rules: min font size 16px everywhere; border-radius ≤ 12px; WCAG 2.2 AA (contrast, visible focus, labels for every control, 44px touch targets on phone/tablet, 64px on TV, errors with icon+text, landmarks/headings in order: one h1 per page); semi-flat 2.0 look (tokens/elevation vars only, no hard-coded colors except the existing tint classes); Roboto; Phosphor icons via `ic()` (any Phosphor name works; add `{duo:true}` for duotone).
- Turkish copy from the builders. Fictional brand/companies only.

## Verify before finishing
1. `cd ~/penpot/publish/arasta-penpot-mcp/web && OUT=/tmp/arasta-$AGENT ONLY=<your,slugs> node build.mjs` → must print no ERRORS and no MISSING icons.
2. Serve it: `cd /tmp/arasta-$AGENT && python3 -m http.server $PORT --bind 127.0.0.1` (run in background; kill when done).
3. Screenshot with headless Chrome using a private profile (it can be slow; wrap with `perl -e 'alarm 90; exec @ARGV'`):
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=/tmp/qa-$AGENT --window-size=W,H --virtual-time-budget=3000 --screenshot=out.png "http://127.0.0.1:$PORT/<cluster>/<screen>/<slug>.html"`
   Check each page at least on: mobil-dikey/320, mobil-dikey/390, mobil-yatay/844x390, tablet-dikey/768, laptop/1440, masaustu/2560, tv/4k. Look at the PNGs and fix overflow/clipping/overlap/illegible issues. Compare with the Penpot design intent.
4. Do not touch ~/penpot/mcp-client, Docker, ports other than yours, the in-app browser, or git (no commits). Do not write into ../docs.
Final answer: files written, pages × screens checked, any known issues.
