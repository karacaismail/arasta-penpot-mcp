// 29 · Yardım Merkezi — mirrors designer/v2/pages-c.js BUILD.help
import { ctx, ic, esc, secHead, feature, aiSearch, link, isSmall, isTV } from '../lib/html.mjs';
import { cols, qr, tvSplit } from './_c-kit.mjs';

export default function help() {
  if (isTV()) {
    const left = `<h1 class="c-tvh">Size nasıl yardımcı olabiliriz?</h1><ul class="c-tvlist">${['Siparişim nerede?', 'Ticaret Güvencesi', 'Kodla giriş yapamıyorum'].map((t, i) => `<li><a class="c-tvrow${i === 0 ? ' is-focus' : ''}" href="${link(i === 1 ? 'guvence' : i === 2 ? 'giris' : 'siparis')}" data-tv>${ic('question', { s: 32 })}<span>${esc(t)}</span></a></li>`).join('')}</ul>`;
    return { main: `<div class="pg-c pg-yardim">${tvSplit(left, qr('Canlı destek telefonda', 260))}</div>` };
  }
  const f = ctx.fam;
  const hero = `<section class="sec c-helphero" aria-labelledby="yd-h"><div class="container"><h1 id="yd-h">Size nasıl yardımcı olabiliriz?</h1><div class="c-helpsearch">${aiSearch({ q: 'Siparişim gecikti, ne yapmalıyım?', badge: 'AI asistan', chips: ['Sipariş takibi', 'İade ve anlaşmazlık', 'Fatura', 'Kurumsal hesap'] })}</div></div></section>`;
  const tc = isSmall() ? 1 : f === 'tablet' ? 2 : 3;
  const topics = [['truck', 'blue', 'Sipariş ve teslimat', '32 makale'], ['shield-check', 'green', 'Ticaret Güvencesi', '18 makale'], ['credit-card', 'violet', 'Ödeme ve fatura', '26 makale'], ['file-text', 'saffron', 'Teklif talepleri', '14 makale'], ['users-three', 'teal', 'Kurumsal hesap', '21 makale'], ['storefront', 'slate', 'Tedarikçi mağazası', '40 makale']].slice(0, tc * 2);
  const tsec = `<section class="sec" aria-labelledby="yd-t"><div class="container">${secHead('Konular', 'Popüler başlıklar').replace('<h2>', '<h2 id="yd-t">')}${cols(tc, topics.map(([i, t, h, d]) => feature(i, t, h, d)))}</div></section>`;
  const cc = isSmall() ? 1 : 3;
  const csec = `<section class="sec surface" aria-labelledby="yd-c"><div class="container">${secHead('Hâlâ yardım mı gerekiyor?', 'Bize ulaşın').replace('<h2>', '<h2 id="yd-c">')}${cols(cc, [['chat-circle-dots', 'blue', 'Canlı destek', '7/24 · ortalama 2 dk'], ['headset', 'green', 'Telefon', '0850 000 00 00 · 09–18'], ['envelope-simple', 'violet', 'E-posta', 'destek@arasta.com.tr · 4 sa']].map(([i, t, h, d]) => feature(i, t, h, d)))}</div></section>`;
  return { main: `<div class="pg-c pg-yardim">${hero}${tsec}${csec}</div>` };
}
