// Local helpers shared by agent-a pages (kategoriler, arama, urun, karsilastir, tedarikciler, magaza, flash).
// Not a page module (build.mjs only loads <slug>.mjs). Mirrors PAGEHEAD / aiBar / TV_SPLIT / TV_ROW from designer/v2.
import { ctx, ic, esc, btn, chip, breadcrumb, productCard } from '../lib/html.mjs';
import { PRODS } from '../data.mjs';

// cycle through a list so large grids (ultra, 7 cols × 3 rows) never run short
export const take = (arr, n, from = 0) => Array.from({ length: Math.max(0, n) }, (_, i) => arr[(from + i) % arr.length]);

// PAGEHEAD: breadcrumb (hidden on phones by components.css) + h1 (h2 scale) + sub + optional actions
export function pageHead(crumbs, title, sub, actions = '') {
  return `<section class="pa-head" aria-labelledby="pa-h1"><div class="container">${crumbs ? breadcrumb(crumbs) : ''}<div class="pa-head-row"><div class="pa-titles"><h1 id="pa-h1">${esc(title)}</h1>${sub ? `<p class="muted">${esc(sub)}</p>` : ''}</div>${actions}</div></div></section>`;
}

// AI interpretation bar (aria-live polite)
export function aiBar() {
  return `<div class="pa-aibar" aria-live="polite"><p class="pa-aibar-l">${ic('sparkle')}<b>Anladığımız:</b></p><div class="pa-aibar-chips" role="group" aria-label="Sorgu yorumu">${['Organik penye', 'Denizli', '≥ 5.000 m', '≤ 30 gün', 'GOTS'].map((t) => chip(t, { on: true })).join('')}</div><button type="button" class="pa-aibar-edit">${ic('pencil-simple')}<span>Düzenle</span></button></div>`;
}

export const grid = (items, n, cls = '') => `<div class="grid pa-grid${cls ? ' ' + cls : ''}" style="--n:${n}">${items.join('')}</div>`;

// ---- TV (10-foot) ----
export const tvSplit = (left, right, o = {}) => `<div class="container pa-tvsplit${o.cls ? ' ' + o.cls : ''}"><div class="pa-tvl">${left}</div><div class="pa-tvr">${right}</div></div>`;
export function tvRow(title, items, id = 'tvr') {
  return `<section class="container tv-row" aria-labelledby="${id}"><h2 id="${id}">${esc(title)}</h2><div class="tv-rail">${items.map((p) => productCard(p, { cls: 'tv-card' })).join('')}</div></section>`;
}
export const tvBtn = (label, icon, o = {}) => btn(label, o.kind || 'primary', { icon, href: o.href, cls: 'tvf' + (o.cls ? ' ' + o.cls : ''), attrs: ' data-tv' });
export { PRODS, ctx };
