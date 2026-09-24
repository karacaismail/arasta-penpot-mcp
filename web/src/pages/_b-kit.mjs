// Agent B shared helpers (teklif-iste, teklifler, sepet, odeme, siparis, mesajlar, panel).
// Not a page module (build.mjs only loads <slug>.mjs). Local equivalents of Penpot PAGEHEAD / TWO / SUMROWS / STICKYBAR / TV_SPLIT / TV_HANDOFF / QR.
import { ctx, ic, esc, btn, badge, breadcrumb, link, isSmall, isWide } from '../lib/html.mjs';

// Page root: every agent-B selector is prefixed with .pgb or .pg-<slug>
export const root = (slug, inner) => `<div class="pgb pg-${slug}">${inner}</div>`;
export const narrow = () => ctx.screen.w < 500; // Penpot `d.w < 500`

// PAGEHEAD: breadcrumb (not on phones) + h1 at h2 scale + sub + actions (row on wide, stacked otherwise)
export function pageHead(crumbs, title, sub, actions = '') {
  return `<section class="pgb-head" aria-labelledby="pgb-h1"><div class="container">${crumbs && !isSmall() ? breadcrumb(crumbs) : ''}<div class="pgb-titlerow${isWide() ? ' is-row' : ''}"><div class="pgb-titles"><h1 id="pgb-h1">${esc(title)}</h1>${sub ? `<p class="muted">${esc(sub)}</p>` : ''}</div>${actions ? `<div class="pgb-actions">${actions}</div>` : ''}</div></div></section>`;
}

// TWO: main column (lw = fraction or css length) + aside; stacked below WIDE
export function two(name, main, aside, o = {}) {
  const lw = o.lw || '64%';
  return `<section class="pgb-two${isWide() ? ' is-split' : ''}" aria-label="${esc(name)}"><div class="container" style="--lw:${lw}">${o.mainTag ? main : `<div class="pgb-col">${main}</div>`}${aside ? `<${o.asideTag || 'aside'} class="pgb-col" aria-label="${esc(o.asideLabel || 'Özet')}">${aside}</${o.asideTag || 'aside'}>` : ''}</div></section>`;
}

export const card = (inner, o = {}) => `<${o.tag || 'div'} class="pgb-card${o.cls ? ' ' + o.cls : ''}"${o.attrs || ''}>${inner}</${o.tag || 'div'}>`;
export const h2 = (t, o = {}) => `<h2 class="pgb-h"${o.id ? ` id="${o.id}"` : ''}>${esc(t)}</h2>`;
export const divider = () => '<hr class="pgb-div">';

// SUMROWS: key/value rows (dl)
export const sumRows = (rows) => `<dl class="pgb-sum">${rows.map(([k, v, strong]) => `<div class="${strong ? 'is-strong' : ''}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

// Steps (ol, aria-current=step) as badges
export const steps = (items, label = 'Adımlar') => `<ol class="pgb-steps" aria-label="${esc(label)}">${items.map(([tone, l, icon, cur]) => `<li${cur ? ' aria-current="step"' : ''}>${badge(l, tone, icon)}${cur ? '<span class="sr-only"> (geçerli adım)</span>' : tone === 'success' ? '<span class="sr-only"> (tamamlandı)</span>' : ''}</li>`).join('')}</ol>`;

// initials logo tile
export const logoTile = (ini, size = 44) => `<span class="pgb-logo" style="--s:${size}px" aria-hidden="true">${esc(ini)}</span>`;

// STICKYBAR content (phone `bottom`)
export const stickyBar = (title, sub, label, icon, href) => `<div class="pgb-sb"><b class="pgb-sb-v">${esc(title)}</b><span class="muted">${esc(sub)}</span></div><span class="grow"></span>${btn(label, 'primary', { icon, href })}`;

// ---- TV ----
export function qr(label) {
  const M = Array.from({ length: 25 }, () => Array(25).fill(0));
  for (const [x0, y0] of [[0, 0], [18, 0], [0, 18]]) for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const e = Math.min(x, y, 6 - x, 6 - y); M[y0 + y][x0 + x] = e === 0 ? 1 : e === 1 ? 0 : 2; }
  let s = 11; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue; if (rnd() > 0.56) M[y][x] = 1; }
  return `<figure class="pgb-qr"><div class="pgb-qr-g" aria-hidden="true">${M.flat().map((v) => `<i${v ? ` class="${v === 1 ? 'd' : 'b'}"` : ''}></i>`).join('')}</div><figcaption>${esc(label)}</figcaption></figure>`;
}
export const tvSplit = (L, R) => `<div class="pgb-tv"><div class="pgb-tv-l">${L}</div><div class="pgb-tv-r">${R}</div></div>`;
export function tvHandoff(o) {
  const L = `<p class="pgb-tv-over">${esc(o.over)}</p><h1 class="pgb-tv-h">${esc(o.h1)}</h1><p class="pgb-tv-body">${esc(o.body)}</p>
<ol class="pgb-tv-steps">${o.steps.map((s, i) => `<li><span aria-hidden="true">${i + 1}</span>${esc(s)}</li>`).join('')}</ol>
<div class="row gap24">${btn(o.cta, 'primary', { icon: o.ctaIcon || 'arrow-right', cls: 'tvf pgb-tvfocus', attrs: ' data-tv' })}${btn('Geri', 'secondary', { icon: 'arrow-left', href: o.back || link('ana-sayfa'), attrs: ' data-tv' })}</div>`;
  const R = `${qr(o.qr)}<p class="pgb-tv-side">QR kodu telefon kameranızla okutun. Kamera yoksa arasta.com.tr/tv adresine gidip <b>K7M-42Q</b> kodunu girin.</p>${o.side ? `<p class="pgb-tv-side">${esc(o.side)}</p>` : ''}`;
  return tvSplit(L, R);
}
export { ic };
