// Agent C shared helpers (login…states) — local equivalents of the Penpot shell.js TV_* / QR / SPLITAUTH helpers.
import { ctx, ic, esc, btn } from '../lib/html.mjs';

const GUT = { phone: 16, phoneL: 24, tablet: 32, tabletL: 32, desktop: 40, wide: 64, ultra: 96, tv: 96 };
const MAXW = { desktop: 1760, wide: 2240, ultra: 3200 };
// content width (Penpot d.cw)
export const cw = () => { const w = ctx.screen.w - 2 * (GUT[ctx.fam] || 16); return Math.min(w, MAXW[ctx.fam] || w); };
// columns grid helper (mirrors Penpot ROWS(parent, items, cols …))
export const cols = (n, items, o = {}) => `<${o.tag || 'div'} class="c-grid${o.cls ? ' ' + o.cls : ''}" style="--cols:${n}"${o.attrs || ''}>${items.join('')}</${o.tag || 'div'}>`;

// Decorative QR code (same pseudo-random pattern as Penpot QR())
export function qr(label, size = 300) {
  const m = size / 25; let r = ''; const sq = (x, y, n, c) => { r += `<rect x="${x * m}" y="${y * m}" width="${n * m}" height="${n * m}" rx="${n >= 5 ? Math.min(12, m) : 1}" fill="var(${c})"/>`; };
  for (const [x, y] of [[0, 0], [18, 0], [0, 18]]) { sq(x, y, 7, '--bg-inverse'); sq(x + 1, y + 1, 5, '--text-inverse'); sq(x + 2, y + 2, 3, '--action-primary'); }
  let s = 11; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue; if (rnd() > 0.56) sq(x, y, 1, '--bg-inverse'); }
  return `<figure class="c-qr"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false">${r}</svg><figcaption>${esc(label)}</figcaption></figure>`;
}
export const tvFocusBtn = (label, icon, o = {}) => btn(label, 'primary', { icon, cls: 'tvf c-tvfocus', href: o.href, attrs: ' data-tv' });
export const tvSplit = (left, right) => `<div class="c-tvsplit"><div class="c-tvl">${left}</div><div class="c-tvr">${right}</div></div>`;
// TV hand-off screen (login device code / signup / sell)
export function tvHandoff(o) {
  const left = `<p class="over c-tvover">${esc(o.over)}</p><h1 class="c-tvh">${esc(o.h1)}</h1><p class="c-tvbody">${esc(o.body)}</p>
${o.steps ? `<ol class="c-tvsteps">${o.steps.map((t, i) => `<li><span aria-hidden="true">${i + 1}</span>${esc(t)}</li>`).join('')}</ol>` : ''}
${o.code ? `<p class="sr-only">Cihaz kodu: ${o.code.split('').join(' ')}</p><div class="c-code" aria-hidden="true">${o.code.split('').map((ch) => `<span>${esc(ch)}</span>`).join('')}</div>` : ''}
<div class="row gap24">${tvFocusBtn(o.cta, o.ctaIcon || 'arrow-right')}${btn('Geri', 'secondary', { icon: 'arrow-left', href: o.back || ctx.href('ana-sayfa'), attrs: ' data-tv' })}</div>`;
  const right = qr(o.qr, 300) + (o.side ? `<p class="c-tvside">${esc(o.side)}</p>` : '');
  return tvSplit(left, right);
}
// Split auth layout (Penpot SPLITAUTH): wide → gradient editorial panel + form card; else centered card
export function splitAuth(page, illuTitle, illuText, form) {
  const wide = ['tabletL', 'desktop', 'wide', 'ultra'].includes(ctx.fam);
  if (wide) {
    const w = cw(); const is = Math.min(Math.round(w * 0.1), 240);
    return `<section class="c-auth is-split pg-${page}-auth" aria-label="Hesap"><div class="container c-auth-grid"><div class="c-edit"><div class="c-edit-illu" aria-hidden="true">${ic('handshake', { duo: true, s: is })}</div><p class="c-edit-h">${esc(illuTitle)}</p><p class="c-edit-t">${esc(illuText)}</p></div><div class="c-formcard card">${form}</div></div></section>`;
  }
  return `<section class="c-auth pg-${page}-auth" aria-label="Hesap"><div class="container"><div class="c-formcard card">${form}</div></div></section>`;
}
