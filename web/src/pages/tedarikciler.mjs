// 15 · Tedarikçi Arama — mirrors designer/v2/pages-a.js BUILD.suppliers (+ trMap)
import { ctx, ic, esc, supplierCard, link, isWide, isTV } from '../lib/html.mjs';
import { pageHead, aiBar, tvSplit } from './_a.mjs';

const SUP = [{ n: 'Ege Tekstil A.Ş.', i: 'ET' }, { n: 'Uşak Örme San.', i: 'UÖ', meta: 'Uşak · 18 yıl · Üretici', match: 'Uyum %91' }, { n: 'Bursa Kumaş', i: 'BK', meta: 'Bursa · 22 yıl · Üretici', match: 'Uyum %89' },
  { n: 'Denizli Dokuma', i: 'DD', meta: 'Denizli · 9 yıl · Üretici', match: 'Uyum %87' }, { n: 'İzmir İplik', i: 'İİ', meta: 'İzmir · 30 yıl · İplik üreticisi', match: 'Uyum %85' }, { n: 'Kahramanmaraş Tekstil', i: 'KT', meta: 'Kahramanmaraş · 14 yıl · Üretici', match: 'Uyum %83' }];
// [x%, y%, size, city, count]
const PINS = [[0.18, 0.5, 64, 'İzmir', '312'], [0.28, 0.62, 48, 'Denizli', '204'], [0.36, 0.36, 72, 'İstanbul', '980'], [0.33, 0.44, 40, 'Bursa', '186'], [0.5, 0.52, 32, 'Konya', '96'], [0.72, 0.62, 36, 'Gaziantep', '120'], [0.62, 0.32, 28, 'Trabzon', '44']];

function trMap(o = {}) {
  const k = o.k || 1;
  const map = `<div class="ted-map" aria-hidden="true"><span class="ted-land"></span>${PINS.map(([x, y, s, , n]) => `<span class="ted-pin" style="left:${x * 100}%;top:${y * 100}%;width:${Math.round(s * k)}px;height:${Math.round(s * k)}px">${n}</span>`).join('')}</div>`;
  if (o.bare) return map;
  // list alternative (the map itself is decorative)
  return `<section class="card ted-mapcard" aria-labelledby="ted-mh"><div class="row between gap8"><h2 id="ted-mh" class="h3">Tedarikçi yoğunluğu</h2><span class="muted">${ic('map-trifold', { s: 16 })} Türkiye</span></div>${map}
<ul class="ted-legend" aria-label="Şehre göre doğrulanmış tedarikçi sayısı">${[...PINS].sort((a, b) => b[4] - a[4]).map(([, , , c, n]) => `<li><a href="${link('tedarikciler')}"><span>${esc(c)}</span><b>${n}</b></a></li>`).join('')}</ul></section>`;
}

export default function suppliers() {
  const f = ctx.fam;
  if (isTV()) {
    const L = `<h1 id="pa-h1">Tekstilde doğrulanmış 1.320 üretici</h1>${trMap({ bare: true, k: 1.4 })}`;
    const R = `<ul class="ted-tvlist" aria-label="Önerilen üreticiler">${SUP.slice(0, 3).map((s, i) => `<li><a class="pa-tvtile${i === 0 ? ' is-focus' : ''}" href="${link('magaza')}" data-tv><span class="icon-tile tint-blue">${ic('factory', { duo: true, s: 36 })}</span><span class="pa-tvtile-t"><b>${esc(s.n)}</b><span class="ai">Uyum %9${4 - i}</span></span></a></li>`).join('')}</ul>
<p class="muted">Haritadaki kümeler: İstanbul 980 · İzmir 312 · Denizli 204 · Bursa 186</p>`;
    return { main: `<div class="pa pa-tv pg-tedarikciler"><section aria-labelledby="pa-h1">${tvSplit(L, R)}</section></div>` };
  }
  const head = pageHead(['Ana sayfa', 'Tedarikçiler'], 'Tedarikçi arama', '1.320 doğrulanmış tekstil üreticisi · kapasite ve sertifikaya göre');
  const ai = `<section class="pa-sub" aria-label="AI yorumu"><div class="container">${aiBar()}</div></section>`;
  let body;
  if (isWide()) {
    const cc = f === 'ultra' ? 3 : 2;
    body = `<div class="container ted-split"><section class="ted-list" aria-labelledby="ted-lh"><div class="row between gap8 wrap"><h2 id="ted-lh" class="ted-count">${cc * 2} / 1.320 tedarikçi</h2></div><div class="grid" style="grid-template-columns:repeat(${cc},minmax(0,1fr))">${SUP.slice(0, cc * 2).map(supplierCard).join('')}</div></section>${trMap({ k: f === 'ultra' ? 1.6 : f === 'wide' ? 1.3 : f === 'tabletL' ? 0.8 : 1 })}</div>`;
  } else {
    const cc = f === 'tablet' || (f === 'phoneL' && ctx.screen.w > 600) ? 2 : 1;
    body = `<div class="container"><h2 class="sr-only">Tedarikçiler</h2><div class="grid" style="grid-template-columns:repeat(${cc},minmax(0,1fr))">${SUP.slice(0, cc * 2).map(supplierCard).join('')}</div></div>`;
  }
  return { main: `<div class="pa pg-tedarikciler">${head}${ai}<section class="pa-body" aria-label="Sonuçlar">${body}</section></div>` };
}
