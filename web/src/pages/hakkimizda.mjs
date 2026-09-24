// 30 · Hakkımızda — mirrors designer/v2/pages-c.js BUILD.about
import { ctx, esc, btn, badge, secHead, feature, link, isSmall, isTV } from '../lib/html.mjs';
import { cols, tvSplit, tvFocusBtn } from './_c-kit.mjs';

export default function about() {
  if (isTV()) {
    const left = `${badge('Hakkımızda', 'brand', 'buildings')}<h1 class="c-tvdisplay">Anadolu’nun üretim gücünü dünyayla buluşturuyoruz.</h1><div>${tvFocusBtn('Hikâyemizi izle', 'play')}</div>`;
    const right = `<dl class="c-tvmetrics">${[['48.000+', 'doğrulanmış üretici'], ['190', 'ülkeye ihracat'], ['2019', 'kuruluş']].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    return { main: `<div class="pg-c pg-hakkimizda">${tvSplit(left, right)}</div>` };
  }
  const small = isSmall();
  const hero = `<section class="sec c-abouthero" aria-labelledby="hk-h"><div class="container c-hero-copy">${badge('Hakkımızda', 'brand', 'buildings')}<h1 id="hk-h">Anadolu’nun üretim gücünü dünyayla buluşturuyoruz.</h1><p class="lead">2019’da Denizli’de 12 atölyeyle başladık. Bugün 48.000 doğrulanmış üretici ve 3.200 kurumsal alıcıyla Türkiye’nin B2B ticaret altyapısıyız.</p></div></section>`;
  const metrics = `<section class="sec c-metrics" aria-label="Rakamlarla Arasta"><div class="container">${cols(small ? 2 : 4, [['48.000+', 'doğrulanmış üretici'], ['190', 'ülkeye ihracat'], ['₺2,1 mlr', 'güvenceli işlem'], ['%42', 'kadın liderliğinde tedarikçi']].map(([v, l]) => `<div class="c-metric card"><dt>${l}</dt><dd>${v}</dd></div>`), { tag: 'dl' })}</div></section>`;
  const values = `<section class="sec surface" aria-labelledby="hk-v"><div class="container">${secHead('Değerlerimiz', 'Ne için çalışıyoruz?').replace('<h2>', '<h2 id="hk-v">')}${cols(small ? 1 : 3, [['handshake', 'blue', 'Güven', 'Her işlem emanet ve denetimle korunur.'], ['leaf', 'green', 'Sürdürülebilirlik', 'Karbon ayak izi etiketi ve yeşil tedarikçi rozeti.'], ['users-three', 'violet', 'Kapsayıcılık', 'Erişilebilir ürün, KOBİ’lere eşit görünürlük.']].map(([i, t, h, d]) => feature(i, t, h, d)))}</div></section>`;
  const careers = `<section class="sec brand" id="kariyer" aria-labelledby="hk-k"><div class="container c-band${small ? ' is-stacked' : ''}"><div><h2 id="hk-k">Ekibimize katılın</h2><p class="lead">İstanbul, Denizli ve uzaktan 24 açık pozisyon.</p></div>${btn('Açık pozisyonlar', 'secondary', { iconR: 'arrow-right', href: "#kariyer", block: small })}</div></section>`;
  return { main: `<div class="pg-c pg-hakkimizda">${hero}${metrics}${values}${careers}</div>` };
}
