// 12 · Arama & Liste — mirrors designer/v2/pages-a.js BUILD.search (+ aiBar, filters)
import { ctx, ic, esc, btn, chip, field, check, toggle, productCard, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { PRODS, COLS } from '../data.mjs';
import { pageHead, aiBar, grid, take, tvRow } from './_a.mjs';

function filters(fw) {
  const fs = (legend, inner) => `<fieldset class="ara-fs"><legend>${esc(legend)}</legend>${inner}</fieldset>`;
  return `<aside class="card ara-filters" aria-labelledby="ara-fh" style="--fw:${fw}px"><form onsubmit="event.preventDefault()"><h2 id="ara-fh" class="sr-only">Filtreler</h2>
${fs('Tedarikçi', [['Doğrulanmış üretici', 1, '64'], ['Ticaret Güvencesi', 1, '71'], ['Yerinde denetimli', 0, '38']].map(([t, on, n]) => check(t, on, { count: n })).join(''))}
${fs('Min. sipariş (MOQ)', `<div class="ara-range">${field('En az', { value: '0', inputmode: 'numeric', suffix: 'm' })}${field('En çok', { value: '5.000', inputmode: 'numeric', suffix: 'm' })}</div>`)}
${fs('Şehir', [['Denizli', 1, '42'], ['Bursa', 0, '18'], ['İstanbul', 0, '15'], ['Uşak', 0, '11']].map(([t, on, n]) => check(t, on, { count: n })).join(''))}
${fs('Teslim süresi', `<div class="row wrap gap8">${['≤ 15 gün', '≤ 30 gün', '≤ 60 gün'].map((t, i) => chip(t, { on: i === 1 })).join('')}</div>`)}
${toggle('Yalnızca stokta olanlar', true)}${btn('Filtreleri uygula', 'primary', { block: true, type: 'submit' })}</form></aside>`;
}

export default function search() {
  const f = ctx.fam;
  if (isTV()) {
    return { main: `<div class="pa pa-tv pg-arama"><section class="container pa-tvsec" aria-labelledby="pa-h1"><h1 id="pa-h1">“organik penye denizli” · 1.204 sonuç</h1>
<div class="pa-tvchips" role="group" aria-label="Filtreler">${['Ticaret Güvencesi', 'Denizli', '≤ 30 gün', 'GOTS'].map((t, i) => `<button type="button" class="pa-tvchip${i === 0 ? ' is-focus' : ''}" aria-pressed="${i === 0}" data-tv>${i === 0 ? ic('check', { s: 28 }) : ''}${esc(t)}</button>`).join('')}</div></section>
${tvRow('En iyi eşleşmeler', PRODS.slice(0, 5))}</div>` };
  }
  const cols = COLS[f];
  const head = pageHead(['Ana sayfa', 'Tekstil', 'Arama'], '“organik penye denizli”', '1.204 ürün · 86 tedarikçi · 0,21 sn');
  const ai = `<section class="pa-sub" aria-label="AI yorumu"><div class="container">${aiBar()}</div></section>`;
  let body;
  if (!isWide()) {
    const n = cols * 3;
    body = `<section class="pa-sub" aria-label="Araç çubuğu"><div class="container ara-tools">${btn('Filtreler (3)', 'secondary', { icon: 'sliders-horizontal', attrs: ' data-open="filters" aria-haspopup="dialog"' })}${btn('Sırala', 'secondary', { icon: 'sort-ascending' })}</div></section>
<section class="pa-body" aria-labelledby="ara-rh"><div class="container"><h2 id="ara-rh" class="sr-only">Sonuçlar</h2><div class="grid g-products">${take(PRODS, n).map((p) => productCard(p)).join('')}</div></div></section>`;
  } else {
    const fw = f === 'wide' ? 360 : f === 'ultra' ? 440 : 300;
    const rc = cols - 1;
    body = `<section class="pa-body" aria-label="Filtre ve sonuçlar"><div class="container pa-split ara-split" style="--side:${fw}px">${filters(fw)}
<div class="ara-results"><div class="ara-bar"><h2 id="ara-rh" class="ara-count">1–24 / 1.204 sonuç</h2><span class="grow"></span>${field('Sırala', { kind: 'select', value: 'En iyi eşleşme', options: ['En iyi eşleşme', 'En düşük fiyat', 'En kısa teslim', 'En yüksek puan'], cls: 'ara-sort' })}</div>
${grid(take(PRODS, rc * 3).map((p) => productCard(p)), rc)}</div></div></section>`;
  }
  const more = `<section class="pa-body ara-more" aria-label="Sayfalama"><div class="container">${btn('Daha fazla yükle', 'secondary', { iconR: 'arrow-right', block: isSmall() })}<p class="muted" role="status">36 / 1.204 ürün gösteriliyor</p></div></section>`;
  return { main: `<div class="pa pg-arama">${head}${ai}${body}${more}</div>` };
}
