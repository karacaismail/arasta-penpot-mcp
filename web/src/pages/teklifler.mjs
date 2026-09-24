// 19 · Teklif Karşılaştırma — mirrors designer/v2/pages-b.js BUILD.quotes
import { ic, esc, btn, badge, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { root, pageHead, card, sumRows, logoTile } from './_b-kit.mjs';

const Q = [['Ege Tekstil A.Ş.', 'ET', '₺121,00 / m', '18 gün', 'Ücretsiz', '%30 peşin', 1], ['Uşak Örme San.', 'UÖ', '₺126,50 / m', '24 gün', '₺350', '%50 peşin'], ['Bursa Kumaş', 'BK', '₺119,00 / m', '35 gün', '₺600', '%100 peşin'], ['Denizli Dokuma', 'DD', '₺131,00 / m', '15 gün', 'Ücretsiz', 'Vadeli 30 gün']];

export default function quotes() {
  if (isTV()) {
    return { main: root('teklifler', `<section class="pgb-tvq" aria-labelledby="tvq-h"><h1 id="tvq-h" class="pgb-tv-h">4 teklif · organik penye 5.000 m</h1><ul class="pgb-tvq-list">${Q.slice(0, 3).map(([n, , p, l, , , best], i) => `<li><a href="${link('siparis')}" class="pgb-tvq-row${i === 0 ? ' is-best' : ''}" data-tv><b class="n">${esc(n)}</b><b class="p">${esc(p)}</b><span class="l">${esc(l)} teslim</span>${best ? badge('En iyi değer', 'ai', 'sparkle') : ''}</a></li>`).join('')}</ul></section>`) };
  }
  const actions = isSmall() ? '' : btn('Excel’e aktar', 'secondary', { icon: 'download-simple' }) + btn('Onaya gönder', 'primary', { icon: 'list-checks' });
  const insight = `<div class="pgb-insight${isSmall() ? ' is-stack' : ''}" role="note" aria-label="AI önerisi">${ic('sparkle', { s: 24 })}<p>Ege Tekstil; fiyat, teslim süresi ve zamanında teslim geçmişinde en iyi dengeyi sunuyor. Bursa Kumaş daha ucuz ama 35 gün teslim hedefinizi aşıyor.</p></div>`;
  let list;
  if (isWide()) {
    list = `<table class="pgb-qt"><caption class="sr-only">Gelen teklifler; en iyi değer vurgulu</caption><thead><tr><th scope="col">Tedarikçi</th><th scope="col">Birim fiyat</th><th scope="col">Teslim</th><th scope="col">Numune</th><th scope="col">Ödeme</th><th scope="col"><span class="sr-only">Eylem</span></th></tr></thead><tbody>${Q.map(([n, ini, p, l, sm, tr, best]) => `<tr class="${best ? 'is-best' : ''}"><th scope="row"><span class="pgb-qt-id">${logoTile(ini)}<span><b>${esc(n)}</b><span class="muted">Doğrulanmış üretici</span>${best ? badge('En iyi değer', 'ai', 'sparkle') : ''}</span></span></th><td class="pgb-qt-p">${esc(p)}</td><td>${esc(l)}</td><td>${esc(sm)}</td><td>${esc(tr)}</td><td>${btn('Teklifi kabul et', best ? 'primary' : 'secondary', { href: link('sepet') })}</td></tr>`).join('')}</tbody></table>`;
  } else {
    list = `<ul class="pgb-qcards">${Q.map(([n, ini, p, l, sm, tr, best]) => `<li>${card(`<div class="row gap12">${logoTile(ini)}<h2 class="pgb-qn">${esc(n)}</h2></div>${best ? `<div>${badge('En iyi değer', 'ai', 'sparkle')}</div>` : ''}${sumRows([['Birim fiyat', p], ['Teslim', l], ['Numune', sm], ['Ödeme', tr]])}${btn('Teklifi kabul et', best ? 'primary' : 'secondary', { block: true, href: link('sepet') })}`, { cls: best ? 'is-best' : '' })}</li>`).join('')}</ul>`;
  }
  return {
    main: root('teklifler', pageHead(['Hesabım', 'Teklif talepleri', 'RFQ-2026-0412'], 'Organik penye · 5.000 m', '4 teklif geldi · 2 bekleniyor · son yanıt 16 Eki', actions)
      + `<section class="pgb-sec" aria-label="Teklifler"><div class="container pgb-stack">${insight}${list}</div></section>`),
  };
}
