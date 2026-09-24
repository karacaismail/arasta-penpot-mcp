// 13 · Ürün Detayı (PDP) — mirrors designer/v2/pages-a.js BUILD.pdp (+ landed)
import { ctx, ic, esc, btn, badge, chip, rating, stepper, priceTiers, productCard, secHead, breadcrumb, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { PRODS, COLS } from '../data.mjs';
import { take, tvSplit, tvBtn } from './_a.mjs';

const P0 = PRODS[0];
const SPECS = [['Kompozisyon', '%100 organik pamuk'], ['Gramaj', '180 g/m² (±%5)'], ['En', '180 cm, açık en'], ['Sertifikalar', 'GOTS, OEKO-TEX Standard 100'], ['Menşe', 'Denizli, Türkiye'], ['Üretim süresi', '2.000 m için 12–15 iş günü']];

function landed() {
  return `<section class="urun-landed card-sub" aria-labelledby="urun-lh"><div class="row gap8 wrap">${ic('calculator', { cls: 'brand' })}<h2 id="urun-lh" class="grow">Varış maliyeti · İzmir, 2.000 m</h2>${badge('EXW → DAP', 'brand', 'truck')}</div>
<dl>${[['Ürün (2.000 m × ₺129)', '₺258.000'], ['Lojistik (Denizli → İzmir)', '₺6.400'], ['Sigorta', '₺520'], ['Ticaret Güvencesi', 'Ücretsiz']].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
<div class="urun-total"><dt>Toplam · birim başına ₺132,46</dt><dd>₺264.920</dd></div></dl></section>`;
}

export default function pdp() {
  const f = ctx.fam;
  if (isTV()) {
    const L = `<div class="media tint-blue urun-tvmedia" role="img" aria-label="${esc(P0.n)} görseli">${ic('t-shirt', { duo: true, s: 240 })}</div>`;
    const R = `${badge('Ege Tekstil · Doğrulanmış', 'success', 'seal-check')}<h1 id="pa-h1">${esc(P0.n)}</h1><p class="urun-tvprice">₺118 – ₺142,50 / metre</p><p class="muted">Min. 500 metre · 3 fiyat kademesi · 12–15 gün</p>
<div class="pa-tvactions">${tvBtn('Telefona gönder ve teklif iste', 'paper-plane-right', { href: link('teklif-iste') })}${btn('Favorilere ekle', 'secondary', { icon: 'heart', attrs: ' data-tv' })}</div>`;
    return { main: `<div class="pa pa-tv pg-urun"><section aria-labelledby="pa-h1">${tvSplit(L, R)}</section></div>` };
  }
  const wide = isWide(), small = isSmall(), phone = f === 'phone';
  const crumbs = small ? '' : `<div class="container urun-crumbs">${breadcrumb(['Ana sayfa', 'Tekstil', 'Örme kumaş', 'Organik penye'])}</div>`;
  const gallery = `<div class="urun-gal"><div class="media tint-blue urun-main" role="img" aria-label="${esc(P0.n)}, ekru renk, ana görsel"><span class="pos-tl">${badge('Flash −%18 · 23 sa 14 dk', 'danger', 'lightning')}</span>${ic('t-shirt', { duo: true, s: 160 })}</div>
<div class="urun-thumbs" role="group" aria-label="Ürün görselleri">${[['t-shirt', 'Kumaş'], ['eye', 'Yakın çekim'], ['certificate', 'Sertifika'], ['factory', 'Üretim tesisi'], ['truck', 'Sevkiyat']].map(([i, l], k) => `<button type="button" class="urun-thumb${k === 0 ? ' is-on' : ''}" aria-pressed="${k === 0}" aria-label="${l}">${ic(i, { duo: true, s: 32 })}</button>`).join('')}</div></div>`;
  const actions = phone ? '' : `<div class="row wrap gap12">${btn('Sepete ekle', 'primary', { icon: 'shopping-cart-simple', href: link('sepet') })}${btn('Numune iste', 'secondary', { icon: 'package' })}${btn('Teklif iste', 'tertiary', { icon: 'file-text', href: link('teklif-iste') })}</div>`;
  const info = `<div class="urun-info"><p class="row wrap gap8"><a class="urun-sup" href="${link('magaza')}">Ege Tekstil A.Ş.</a>${badge('Doğrulanmış', 'success', 'seal-check')}${badge('Uyum %92', 'ai', 'sparkle')}</p>
<h1 id="pa-h1">${esc(P0.n)}, GOTS sertifikalı</h1>${rating('4,8', '(312 değerlendirme)')}
${priceTiers()}
<fieldset class="urun-colors"><legend>Renk: <span>Ekru</span></legend><div class="row wrap gap8">${['Ekru', 'Antrasit', 'Lacivert', 'Bordo'].map((c, i) => chip(c, { on: i === 0 })).join('')}</div></fieldset>
<div class="urun-qty"><div class="urun-q"><span class="urun-ql" aria-hidden="true">Miktar (metre)</span>${stepper('2.000', 'Miktar (metre)')}</div><div class="urun-sub" aria-live="polite"><span class="muted">Ara toplam</span><b>₺258.000</b></div></div>
${actions}${landed()}
<div class="urun-ta">${ic('shield-check', { s: 24 })}<div><b>Ticaret Güvencesi ile korunur</b><p class="muted">Ödeme teslim onayına kadar emanette; gecikme ve kalite sorunlarında iade.</p></div></div></div>`;
  const top = `<section class="pa-body urun-top" aria-labelledby="pa-h1"><div class="container${wide ? ' urun-split' : ' urun-stack'}">${gallery}${info}</div></section>`;
  const tabs = ['Özellikler', 'Sertifikalar (3)', 'Değerlendirmeler (312)', 'Soru-cevap (48)'];
  const details = `<section class="sec surface urun-det" aria-label="Ayrıntılar"><div class="container"><div class="urun-tabs" role="tablist" aria-label="Ürün ayrıntıları">${tabs.map((t, i) => `<button type="button" role="tab" id="urun-t${i}" aria-selected="${i === 0}" aria-controls="urun-p0"${i ? ' tabindex="-1"' : ''}>${esc(t)}</button>`).join('')}</div>
<div id="urun-p0" role="tabpanel" aria-labelledby="urun-t0"><table class="urun-spec${ctx.screen.w < 400 ? ' is-stacked' : ''}"><caption class="sr-only">Ürün özellikleri</caption><tbody>${SPECS.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></div></section>`;
  const cols = COLS[f];
  const sim = `<section class="sec" aria-label="Benzer ürünler"><div class="container">${secHead('Benzer', 'Bunlar da ilginizi çekebilir', { link: 'Tümü', href: link('arama') })}<div class="grid g-products">${take(PRODS, cols, 4).map((p) => productCard(p)).join('')}</div></div></section>`;
  const bottom = `<div class="urun-bar"><div class="urun-bar-p"><b>₺258.000</b><span>2.000 m</span></div>${btn('Sepete ekle', 'primary', { icon: 'shopping-cart-simple', href: link('sepet') })}</div>`;
  return { main: `<div class="pa pg-urun">${crumbs}${top}${details}${sim}</div>`, bottom };
}
