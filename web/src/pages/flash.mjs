// 17 · Flash Fırsatlar — mirrors designer/v2/pages-a.js BUILD.flash
import { ctx, ic, esc, btn, badge, chip, secHead, eventCard, productCard, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { PRODS, EVENTS, COLS } from '../data.mjs';
import { take, tvSplit, tvRow, tvBtn } from './_a.mjs';

const count = (units) => `<div class="fl-count" role="timer" aria-live="off" aria-label="Kalan süre 23 saat 14 dakika, kontenjanın %64’ü doldu">${units.map(([v, l]) => `<div aria-hidden="true"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;

export default function flash() {
  const f = ctx.fam;
  const deals = PRODS.filter((p) => p.b).concat(PRODS);
  if (isTV()) {
    const L = `${badge('Flash · 48 saat', 'danger', 'lightning')}<h1 id="pa-h1">Ege’nin Pamuk Atölyeleri</h1>${count([['23', 'saat'], ['14', 'dakika']])}<div class="pa-tvactions">${tvBtn('Etkinliğe göz at', 'arrow-right', { href: link('arama') })}</div>`;
    const R = `<div class="fl-art tint-saffron" aria-hidden="true">${ic('t-shirt', { duo: true, s: 160 })}</div>`;
    return { main: `<div class="pa pa-tv pg-flash"><section aria-labelledby="pa-h1">${tvSplit(L, R, { cls: 'fl-tvsplit' })}</section>${tvRow('Etkinlikteki ürünler', deals.slice(0, 5))}</div>` };
  }
  const wide = isWide(), small = isSmall();
  const hero = `<section class="sec inverse fl-hero" aria-labelledby="pa-h1"><div class="container${wide ? ' fl-split' : ' fl-stack'}"><div class="fl-copy">${badge('Flash · 48 saatlik seçki', 'danger', 'lightning')}
<h1 id="pa-h1">Ege’nin Pamuk Atölyeleri</h1><p class="lead">Denizli ve Uşak’tan organik penye, havlu ve nevresim kumaşları; %18’e varan kontenjanlı toptan indirim.</p>
${count([['23', 'saat'], ['14', 'dakika'], ['%64', 'kontenjan']])}${btn('Etkinliğe göz at', 'primary', { iconR: 'arrow-right', href: '#fl-deals', block: small })}</div>
<div class="fl-art tint-saffron" aria-hidden="true">${ic('t-shirt', { duo: true, s: wide ? 200 : 120 })}</div></div></section>`;
  const tabs = `<section class="pa-sub" aria-label="Etkinlik durumu"><div class="container"><div class="row wrap gap8" role="group" aria-label="Etkinlik durumu">${['Şu an yayında (6)', 'Yakında (4)', 'Son şans (2)'].map((t, i) => chip(t, { on: i === 0 })).join('')}</div></div></section>`;
  const ec = { phone: 1, phoneL: 2, tablet: 2 }[f] || 3;
  const events = `<section class="pa-body" aria-labelledby="fl-eh"><div class="container"><h2 id="fl-eh" class="sr-only">Etkinlikler</h2><div class="grid g-events">${EVENTS.slice(0, ec * 2).map(eventCard).join('')}</div></div></section>`;
  const cols = COLS[f];
  const dealSec = `<section class="sec surface" id="fl-deals" aria-label="Fırsat ürünleri"><div class="container">${secHead('Kontenjanlı', 'Etkinlikteki ürünler', { link: 'Tümü', href: link('arama') })}<div class="grid g-products">${take(deals, cols * 2).map((p) => productCard(p)).join('')}</div></div></section>`;
  return { main: `<div class="pa pg-flash">${hero}${tabs}${events}${dealSec}</div>` };
}
