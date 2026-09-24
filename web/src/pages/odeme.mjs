// 21 · Ödeme — mirrors designer/v2/pages-b.js BUILD.checkout
import { ctx, ic, esc, btn, field, iconTile, link, isTV } from '../lib/html.mjs';
import { root, pageHead, two, card, h2, sumRows, divider, steps, stickyBar, tvHandoff } from './_b-kit.mjs';

const radioCard = (name, i, on, inner) => `<label class="pgb-rcard"><input type="radio" name="${name}" value="${i}"${on ? ' checked' : ''}>${inner}</label>`;

export default function checkout() {
  if (isTV()) return { main: root('odeme', tvHandoff({ over: 'Güvenli ödeme', h1: 'Ödemeyi telefonunuzda tamamlayın', body: 'Kart ve hesap bilgileri TV’de girilmez. Kodu okutun; ödeme Ticaret Güvencesi emanetine alınsın.', steps: ['QR kodu okutun', 'Passkey ile onaylayın'], qr: 'Ödemeyi telefonda aç', cta: 'Telefona gönder', ctaIcon: 'lock-simple', back: link('sepet') })) };
  const phone = ctx.fam === 'phone';
  const addr = card(`<legend class="pgb-legend">Teslimat adresi</legend><div class="pgb-rgroup">${[['Merkez depo · Karşıyaka, İzmir', 'Demir Tekstil A.Ş. · 8400 m² depo', 1], ['Fabrika · Çiğli OSB, İzmir', 'Rampa: 08.00–17.00', 0]].map(([t, s, on], i) => radioCard('addr', i, on, `<span class="pgb-radio" aria-hidden="true"></span><span class="pgb-rc-t"><b>${esc(t)}</b><span class="muted">${esc(s)}</span></span>`)).join('')}</div>`, { tag: 'fieldset' });
  const pay = card(`<legend class="pgb-legend">Ödeme yöntemi</legend><div class="pgb-rgroup">${[['bank', 'Havale / EFT', 'Emanet hesabına · IBAN sipariş sonrası', 1], ['credit-card', 'Kurumsal kart', '3D Secure · 12 aya kadar taksit', 0], ['receipt', 'Açık hesap (60 gün)', 'Onaylı alıcılar · limit ₺2.000.000', 0]].map(([i, t, s, on], k) => radioCard('pay', k, on, `<span class="pgb-rc-tile">${iconTile(i, 'blue', 'md')}</span><span class="pgb-rc-t"><b>${esc(t)}</b><span class="muted">${esc(s)}</span></span>${ic('check-circle', { s: 24, duo: true, cls: 'pgb-rc-ok' })}`)).join('')}</div>`, { tag: 'fieldset', cls: 'is-pay' });
  const inv = card(`<legend class="pgb-legend">Fatura ve iç onay</legend>${field('Vergi numarası', { value: '1234567890', icon: 'receipt', help: 'e-Fatura otomatik düzenlenir', inputmode: 'numeric' })}${field('Satın alma sipariş no (PO)', { value: 'PO-2026-1187', opt: true })}
<p class="pgb-notice">${ic('list-checks')}<span>₺250.000 üzeri: Finans onayı gerekir (Ayşe D.)</span></p>`, { tag: 'fieldset' });
  const form = `<form class="pgb-col" id="checkout" aria-labelledby="pgb-h1" onsubmit="event.preventDefault();location.href='${link('siparis')}'">${steps([['success', '1 · Sepet', 'check'], ['brand', '2 · Teslimat & ödeme', 'credit-card', 1], ['neutral', '3 · Onay', 'list-checks']], 'Ödeme adımları')}${addr}${pay}${inv}</form>`;
  const sum = card(`${h2('Sipariş özeti')}${sumRows([['Ürünler (2 tedarikçi)', '₺307.180'], ['Lojistik', '₺4.780'], ['KDV', 'Dahil']])}${divider()}${sumRows([['Toplam', '₺312.480', 1]])}
<p class="pgb-safe">${ic('shield-check')}<span>Ödeme teslim onayına kadar emanette</span></p>${phone ? '' : btn('Onaya gönder ve öde', 'primary', { icon: 'lock-simple', block: true, type: 'submit', attrs: ' form="checkout"' })}`);
  return {
    main: root('odeme', pageHead(['Sepet', 'Ödeme'], 'Güvenli ödeme', 'Adım 2 / 3 · Teslimat ve ödeme') + two('Ödeme', form, sum, { lw: '62%', mainTag: true, asideLabel: 'Sipariş özeti' })),
    bottom: stickyBar('₺312.480', 'Finans onayı gerekir', 'Onaya gönder', 'lock-simple', link('siparis')),
  };
}
