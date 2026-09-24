// 14 · Ürün Karşılaştırma — mirrors designer/v2/pages-a.js BUILD.compare
import { ctx, ic, esc, btn, badge, link, isSmall, isTV } from '../lib/html.mjs';
import { PRODS } from '../data.mjs';
import { pageHead } from './_a.mjs';

const ITEMS = [{ ...PRODS[0], t: 'blue' }, { ...PRODS[0], s: 'Uşak Örme · Uşak', p: '₺126 – ₺149', a: 'Uyum %88', t: 'violet' }, { ...PRODS[0], s: 'Bursa Kumaş · Bursa', p: '₺115 – ₺139', a: 'Uyum %84', t: 'teal' }];
const ROWS = [['Birim fiyat (2.000 m)', ['₺129,00', '₺136,00', '₺124,50']], ['Min. sipariş', ['500 m', '1.000 m', '2.000 m']], ['Üretim süresi', ['12–15 gün', '18 gün', '25 gün']], ['Sertifika', ['GOTS, OEKO-TEX', 'OEKO-TEX', 'GOTS']], ['Numune', ['₺450', 'Ücretsiz', '₺600']], ['Zamanında teslim', ['%98,6', '%95,1', '%91,4']], ['AI uyum', ['%92', '%88', '%84']]];
const BEST = 2;

export default function compare() {
  const f = ctx.fam;
  if (isTV()) {
    return { main: `<div class="pa pa-tv pg-karsilastir"><section class="container pa-tvsec" aria-labelledby="pa-h1"><h1 id="pa-h1">3 ürünü karşılaştırın</h1>
<table class="kar-tvtable"><caption class="sr-only">Organik penye kumaş · 3 tedarikçi</caption><thead><tr><td></td>${ITEMS.map((p, i) => `<th scope="col"><span class="icon-tile tint-${p.t}">${ic('t-shirt', { duo: true, s: 32 })}</span>${esc(p.s.split(' · ')[0])}${i === BEST ? `<span class="sr-only"> (en iyi değer)</span>` : ''}</th>`).join('')}</tr></thead>
<tbody>${ROWS.slice(0, 5).map(([k, vs], ri) => `<tr${ri === 0 ? ' class="is-focus"' : ''}><th scope="row">${esc(k)}</th>${vs.map((v, i) => `<td${i === BEST && ri === 0 ? ' class="is-best"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
<div class="pa-tvactions">${btn('En iyi değeri sepete ekle', 'primary', { icon: 'shopping-cart-simple', href: link('sepet'), cls: 'tvf', attrs: ' data-tv' })}${btn('Geri', 'secondary', { icon: 'arrow-left', href: link('arama'), attrs: ' data-tv' })}</div></section></div>` };
  }
  const stacked = isSmall() || f === 'tablet';
  const head = pageHead(['Ana sayfa', 'Karşılaştırma'], 'Ürün karşılaştırma', '3 ürün · en iyi değer AI tarafından işaretlendi', isSmall() ? '' : btn('PDF olarak indir', 'secondary', { icon: 'download-simple' }));
  let body;
  if (stacked) {
    body = `<ul class="kar-cards">${ITEMS.map((p, i) => `<li class="card kar-card${i === BEST ? ' is-best' : ''}"><div class="kar-card-h"><span class="icon-tile tint-${p.t}">${ic('t-shirt', { duo: true, s: 28 })}</span><div class="grow"><h2 class="kar-name">${esc(p.s)}</h2><p class="muted">${esc(p.p)} / m</p></div></div>${i === BEST ? badge('En iyi değer', 'ai', 'sparkle') : ''}
<dl>${ROWS.slice(0, 5).map(([k, vs]) => `<div><dt>${esc(k)}</dt><dd>${esc(vs[i])}</dd></div>`).join('')}</dl>${btn('Sepete ekle', i === BEST ? 'primary' : 'secondary', { icon: 'shopping-cart-simple', href: link('sepet'), block: true })}</li>`).join('')}</ul>`;
  } else {
    body = `<div class="card kar-wrap"><table class="kar-table"><caption class="sr-only">Organik penye kumaş · 3 tedarikçinin karşılaştırması</caption>
<thead><tr><td class="kar-k"></td>${ITEMS.map((p, i) => `<th scope="col" class="${i === BEST ? 'is-best' : ''}"><div class="kar-th"><span class="icon-tile tint-${p.t}">${ic('t-shirt', { duo: true, s: 32 })}</span><span class="kar-name">${esc(p.s)}</span><span class="kar-price">${esc(p.p)} / m</span>${i === BEST ? badge('En iyi değer', 'ai', 'sparkle') : ''}${btn('Sepete ekle', i === BEST ? 'primary' : 'secondary', { icon: 'shopping-cart-simple', href: link('sepet') })}</div></th>`).join('')}</tr></thead>
<tbody>${ROWS.map(([k, vs], ri) => `<tr><th scope="row" class="kar-k">${esc(k)}</th>${vs.map((v, i) => `<td class="${i === BEST ? 'is-best' : ''}">${ri === 0 && i === BEST ? `${ic('trend-up', { s: 16, cls: 'ok' })}<span class="sr-only">En düşük: </span>` : ''}${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return { main: `<div class="pa pg-karsilastir">${head}<section class="pa-body" aria-label="Karşılaştırma tablosu"><div class="container">${body}</div></section></div>` };
}
