// 27 · Ticaret Güvencesi — mirrors designer/v2/pages-c.js BUILD.trust
import { ctx, ic, esc, btn, badge, secHead, feature, iconTile, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { cols } from './_c-kit.mjs';

const STEPS = [['shopping-cart-simple', 'Sipariş verin', 'Ödeme Arasta emanet hesabına alınır.'], ['factory', 'Üretim ve sevkiyat', 'Tedarikçi sözleşme koşullarıyla sevk eder.'], ['check-circle', 'Teslim alın, kontrol edin', 'İnceleme için 7 gününüz var.'], ['bank', 'Ödeme aktarılır', 'Onayınızla tutar tedarikçiye geçer.']];

export default function trust() {
  if (isTV()) {
    return { main: `<div class="pg-c pg-guvence"><section class="c-tvsec" aria-labelledby="gv-h"><h1 id="gv-h" class="c-tvh">Ödemeniz, siz onaylayana kadar güvende.</h1>
<ol class="c-tvtiles" style="--cols:4">${STEPS.map(([i, t, d], k) => `<li><a class="c-tvtile${k === 0 ? ' is-focus' : ''}" href="${link('yardim')}" data-tv>${iconTile(i, 'blue', 'lg')}<b>${esc(t)}</b><span>${esc(d)}</span></a></li>`).join('')}</ol></section></div>` };
  }
  const wide = isWide(); const f = ctx.fam;
  const hero = `<section class="sec brand c-hero" aria-labelledby="gv-h"><div class="container c-hero-grid${wide ? ' is-split' : ''}"><div class="c-hero-copy">${badge('Ticaret Güvencesi', 'success', 'shield-check')}
<h1 id="gv-h">Ödemeniz, siz onaylayana kadar güvende.</h1><p class="lead">Kalite, miktar veya teslim tarihi sözleşmeye uymazsa tutarın tamamı ya da bir kısmı iade edilir. Alıcıya ek ücret yok.</p>
<div class="row wrap gap12">${btn('Nasıl çalışır', 'secondary', { icon: 'play', href: '#gv-steps' })}${btn('Anlaşmazlık başlat', 'tertiary', { icon: 'scales', href: link('yardim') })}</div></div>
${wide ? `<dl class="c-statcard card">${[['₺2,1 milyar', 'güvence altındaki işlem (2025)'], ['%99,2', 'sorunsuz tamamlanan sipariş'], ['6 gün', 'ortalama anlaşmazlık çözümü']].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}</div></section>`;
  const sc = isSmall() ? 1 : f === 'tablet' ? 2 : 4;
  const steps = `<section class="sec" id="gv-steps" aria-labelledby="gv-s">${'<div class="container">'}${secHead('4 adım', 'Güvenli ticaret nasıl işler?').replace('<h2>', '<h2 id="gv-s">')}
${cols(sc, STEPS.map(([i, t, d]) => `<li class="c-step">${feature(i, 'blue', t, d)}</li>`), { tag: 'ol' })}</div></section>`;
  const cc = isSmall() ? 1 : 3;
  const cover = `<section class="sec surface" aria-labelledby="gv-c"><div class="container">${secHead('Kapsam', 'Neleri korur?').replace('<h2>', '<h2 id="gv-c">')}
${cols(cc, [['check-circle', 'green', 'Ürün kalitesi', 'Sözleşmedeki özelliklere uymayan ürünlerde iade.'], ['timer', 'saffron', 'Zamanında sevkiyat', 'Gecikmede günlük %0,5 telafi.'], ['lock-simple', 'violet', 'Ödeme koruması', 'Ödeme teslim onayına kadar emanette.']].map(([i, t, h, d]) => feature(i, t, h, d)))}</div></section>`;
  const faqs = [['Ticaret Güvencesi ücretli mi?', 'Hayır. Alıcılar için ücretsizdir; hizmet bedeli tedarikçi komisyonuna dahildir.'], ['Hangi ödeme yöntemleri kapsanır?', 'Kredi kartı, havale/EFT, açık hesap ve akreditif ile yapılan tüm Arasta ödemeleri kapsanır.'], ['Anlaşmazlık süreci ne kadar sürer?', 'Ortalama çözüm süresi 6 gündür; belgeler tamamsa arabulucu 48 saat içinde karar önerir.'], ['Numune siparişleri korunur mu?', 'Evet. Numune siparişleri de emanet hesabı ve teslim onayı ile korunur.']];
  const faq = `<section class="sec" aria-labelledby="gv-f"><div class="container">${secHead('Sıkça sorulanlar', 'Sorular ve yanıtlar').replace('<h2>', '<h2 id="gv-f">')}
<div class="c-acc card">${faqs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span>${esc(q)}</span>${ic('plus', { cls: 'c-plus' })}${ic('minus', { cls: 'c-minus' })}</summary><p class="muted">${esc(a)}</p></details>`).join('')}</div></div></section>`;
  return { main: `<div class="pg-c pg-guvence">${hero}${steps}${cover}${faq}</div>` };
}
