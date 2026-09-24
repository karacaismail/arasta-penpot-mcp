// 20 · Sepet — mirrors designer/v2/pages-b.js BUILD.cart
import { ctx, ic, esc, btn, badge, check, stepper, iconBtn, tierProgress, TINT, link, isTV } from '../lib/html.mjs';
import { PRODS } from '../data.mjs';
import { root, narrow, pageHead, two, card, h2, sumRows, divider, stickyBar, tvHandoff } from './_b-kit.mjs';

function line(p, qty, unit, total, n) {
  const [tint, icon] = TINT[p.i] || ['blue', 'package'];
  return `<li class="pgb-line"><span class="pgb-thumb tint-${tint}" aria-hidden="true">${ic(icon, { duo: true, s: n ? 36 : 56 })}</span><div class="pgb-line-i"><h3 class="pgb-line-n"><a href="${link('urun')}">${esc(p.n)}</a></h3><p class="muted">Renk: Ekru · ${esc(unit)}</p>
<div class="pgb-line-c${n ? ' is-stack' : ''}">${stepper(qty, 'Miktar: ' + p.n)}<span class="pgb-line-t"><b class="pgb-price">${esc(total)}</b>${iconBtn('trash', 'Kaldır: ' + p.n)}</span></div></div></li>`;
}

export default function cart() {
  if (isTV()) return { main: root('sepet', tvHandoff({ over: 'Sepetiniz · 3 ürün', h1: 'Toplam ₺312.480', body: 'Siparişi güvenle onaylamak için telefonunuza aktarın; sepetiniz tüm cihazlarda eşit kalır.', steps: ['QR kodu okutun', 'Teslimat ve ödeme adımlarını onaylayın'], qr: 'Sepeti telefonda aç', cta: 'Telefona gönder', ctaIcon: 'paper-plane-right' })) };
  const n = narrow();
  const grp = (sup, lines) => card(`<div class="pgb-grp-h">${ic('seal-check', { cls: 'ok' })}<h2 class="pgb-grp-n">${esc(sup)}</h2><span class="muted">Tahmini teslim: 12–15 gün</span></div><ul class="pgb-lines">${lines.map((l) => line(...l, n)).join('')}</ul>`, { tag: 'section', cls: 'pgb-grp', attrs: ` aria-label="Tedarikçi: ${esc(sup)}"` });
  const tip = `<div class="pgb-tip" role="note">${ic('trend-up', { s: 24 })}<div class="pgb-tip-t"><p>8.000 m daha ekleyin, birim fiyat ₺118’e düşsün (−₺22.000).</p>${tierProgress()}</div></div>`;
  const main = grp('Ege Tekstil A.Ş. · Denizli', [[PRODS[0], '2.000', '₺129 / m (2.000+ kademesi)', '₺258.000']]) + tip + grp('Ayvalık Zeytincilik · Balıkesir', [[PRODS[2], '40', '₺1.240 / teneke', '₺49.600']]);
  const phone = ctx.fam === 'phone';
  const sum = card(`${h2('Sipariş özeti')}${sumRows([['Ara toplam', '₺307.600'], ['Kademe indirimi', '−₺420'], ['Lojistik (tahmini)', '₺4.780'], ['KDV (%20)', 'Dahil']])}${divider()}${sumRows([['Toplam', '₺312.480', 1]])}
${check('Ticaret Güvencesi ile öde', true)}${phone ? '' : btn('Ödemeye geç', 'primary', { icon: 'lock-simple', block: true, href: link('odeme') })}
<ul class="row wrap gap8" aria-label="Ödeme yöntemleri">${[['bank', 'Havale/EFT'], ['credit-card', 'Kurumsal kart'], ['receipt', 'Açık hesap 60 gün']].map(([i, t]) => `<li>${badge(t, 'neutral', i)}</li>`).join('')}</ul>`);
  return {
    main: root('sepet', pageHead(['Ana sayfa', 'Sepet'], 'Sepetiniz', '3 ürün · 2 tedarikçi · Ticaret Güvencesi dahil') + two('Sepet içeriği', main, sum, { lw: '64%', asideLabel: 'Sipariş özeti' })),
    bottom: stickyBar('₺312.480', 'KDV dahil', 'Ödemeye geç', 'lock-simple', link('odeme')),
  };
}
