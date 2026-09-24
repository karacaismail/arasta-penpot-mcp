// 16 · Tedarikçi Mağazası — mirrors designer/v2/pages-a.js BUILD.store
import { ctx, ic, esc, btn, badge, timeline, secHead, productCard, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { PRODS, COLS } from '../data.mjs';
import { take, tvRow, tvBtn } from './_a.mjs';

export default function store() {
  const f = ctx.fam;
  if (isTV()) {
    return { main: `<div class="pa pa-tv pg-magaza"><section class="container mag-tvid" aria-labelledby="pa-h1"><span class="logo-tile mag-tvlogo" aria-hidden="true">ET</span><div class="grow"><h1 id="pa-h1">Ege Tekstil A.Ş.</h1><p class="muted">Doğrulanmış üretici · Denizli · 12 yıl · Yanıt ≤ 4 saat</p></div>${tvBtn('Takip et', 'plus')}</section>
${tvRow('Mağazanın çok satanları', PRODS.slice(0, 5))}</div>` };
  }
  const small = isSmall(), wide = isWide();
  const cover = `<section class="sec brand mag-cover" aria-labelledby="pa-h1"><div class="container mag-cover-in"><span class="mag-logo" aria-hidden="true">ET</span>
<div class="mag-id"><h1 id="pa-h1">Ege Tekstil A.Ş.</h1><p class="lead">Organik örme kumaş üreticisi · Denizli · 1998’den beri</p><p class="row wrap gap8">${badge('Doğrulanmış', 'success', 'seal-check')}${badge('GOTS', 'brand', 'certificate')}${badge('ISO 9001', 'brand', 'certificate')}</p></div>
<div class="mag-act">${btn('Mesaj gönder', 'secondary', { icon: 'chat-circle-dots', href: link('mesajlar') })}${btn('Teklif iste', 'primary', { icon: 'file-text', href: link('teklif-iste') })}</div></div></section>`;
  const stats = `<section class="pa-body mag-stats" aria-label="Performans"><div class="container"><ul class="grid mag-statgrid">${[['clock', 'blue', '≤ 4 saat', 'Ortalama yanıt'], ['truck', 'green', '%98,6', 'Zamanında teslim'], ['chart-line-up', 'violet', '$10–25 M', 'Yıllık ihracat'], ['users-three', 'saffron', '250+', 'Çalışan']].map(([i, t, v, l]) => `<li class="card mag-stat"><span class="icon-tile tint-${t}">${ic(i, { duo: true, s: 24 })}</span><p><b>${esc(v)}</b><span>${esc(l)}</span></p></li>`).join('')}</ul></div></section>`;
  const pc = wide ? Math.max(2, COLS[f] - 2) : small && ctx.screen.w <= 320 ? 1 : COLS[f];
  const tl = `<section class="card mag-tl" aria-labelledby="mag-tlh"><h2 id="mag-tlh" class="h3">Doğrulama geçmişi</h2>${timeline([['done', 'Yerinde denetim · SGS', 'Mar 2026'], ['done', 'GOTS sertifikası yenilendi', 'Oca 2026'], ['now', 'Kapasite doğrulaması sürüyor', 'Eki 2026']])}</section>`;
  const prods = `<section class="mag-prods" aria-label="Çok satan ürünler">${secHead('Mağaza', 'Çok satan ürünler', { link: 'Tüm ürünler (148)', href: link('arama') })}<div class="grid" style="grid-template-columns:repeat(${pc},minmax(0,1fr))">${take(PRODS, pc * 2).map((p) => productCard(p)).join('')}</div></section>`;
  const au = `<div class="sec"><div class="container${wide ? ' mag-split' : ' mag-stack'}">${tl}${prods}</div></div>`;
  return { main: `<div class="pa pg-magaza">${cover}${stats}${au}</div>` };
}
