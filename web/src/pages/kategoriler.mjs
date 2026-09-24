// 11 · Kategoriler — mirrors designer/v2/pages-a.js BUILD.categories
import { ctx, ic, esc, chip, field, productCard, link, isSmall, isWide, isTV, TINT } from '../lib/html.mjs';
import { CATS, PRODS, COLS } from '../data.mjs';
import { pageHead, grid, take } from './_a.mjs';

const SUBS = [['Örme kumaş', 'Dokuma kumaş', 'Ev tekstili', 'İplik', 'Hazır giyim', 'Aksesuar'], ['Gıda makineleri', 'Paketleme', 'CNC tezgâh', 'Kompresör', 'Pompa', 'Yedek parça'], ['Zeytinyağı', 'Kuru meyve', 'Bakliyat', 'Baharat', 'Süt ürünleri', 'Organik']];

export default function categories() {
  const f = ctx.fam;
  if (isTV()) {
    return { main: `<div class="pa pa-tv pg-kategoriler"><section class="container pa-tvsec" aria-labelledby="pa-h1"><h1 id="pa-h1">Kategoriler</h1>
<ul class="pa-tvgrid kat-tvgrid">${CATS.slice(0, 8).map(([n, key, , cnt], k) => { const [tint, icon] = TINT[key]; return `<li><a class="pa-tvtile${k === 0 ? ' is-focus' : ''}" href="${link('arama')}" data-tv><span class="icon-tile tint-${tint}">${ic(icon, { duo: true, s: 40 })}</span><span class="pa-tvtile-t"><b>${esc(n)}</b><span>${esc(cnt.split(' · ')[0])}</span></span></a></li>`; }).join('')}</ul></section></div>` };
  }
  const wide = isWide(), small = isSmall();
  const head = pageHead(['Ana sayfa', 'Kategoriler'], 'Tüm kategoriler', '10 sektör · 76.000+ ürün · 8.400+ doğrulanmış tedarikçi',
    wide ? `<form class="kat-find" role="search" onsubmit="event.preventDefault()">${field('Kategori içinde ara', { icon: 'magnifying-glass', ph: 'örn. penye, CNC, zeytinyağı', type: 'search' })}</form>` : '');
  const secs = small ? 2 : 3;
  const pc = small ? (ctx.screen.w <= 320 ? 1 : 2) : Math.max(2, COLS[f] - (wide ? 1 : 0));
  const sectors = CATS.slice(0, secs).map(([n, key, , cnt], si) => {
    const [tint, icon] = TINT[key];
    return `<section class="card kat-sec" aria-labelledby="kat-s${si}"><div class="kat-sec-h"><span class="icon-tile tint-${tint}">${ic(icon, { duo: true, s: small ? 24 : 32 })}</span><div class="grow"><h2 id="kat-s${si}" class="h3">${esc(n)}</h2><p class="muted">${esc(cnt)}</p></div>${small ? '' : `<a class="more" href="${link('arama')}">Tümünü gör${ic('arrow-right')}</a>`}</div>
<div class="row wrap gap8" role="group" aria-label="${esc(n)} alt kategorileri">${SUBS[si].slice(0, small ? 4 : 6).map((t, i) => chip(t, { on: i === 0 && si === 0 })).join('')}</div>
${grid(take(PRODS, pc, si * 3).map((p) => productCard(p)), pc)}${small ? `<a class="btn btn-tertiary btn-block" href="${link('arama')}"><span>Tümünü gör</span>${ic('arrow-right')}</a>` : ''}</section>`;
  }).join('');
  const nav = wide ? `<nav class="card kat-nav" aria-label="Sektörler"><ul>${CATS.map(([n, key], i) => `<li><a href="${link('kategoriler')}"${i === 0 ? ' aria-current="true"' : ''}>${ic(TINT[key][1], { duo: i === 0 })}<span>${esc(n)}</span></a></li>`).join('')}</ul></nav>` : '';
  const body = `<section class="pa-body" aria-label="Sektörler"><div class="container${wide ? ' pa-split kat-split' : ''}">${nav}<div class="kat-list">${sectors}</div></div></section>`;
  return { main: `<div class="pa pg-kategoriler">${head}${body}</div>` };
}
