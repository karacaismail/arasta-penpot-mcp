// 22 · Sipariş Onayı & Takip — mirrors designer/v2/pages-b.js BUILD.order
import { ic, esc, btn, badge, timeline, iconTile, link, isSmall, isTV } from '../lib/html.mjs';
import { root, two, card, h2, sumRows, divider, tvSplit } from './_b-kit.mjs';

export default function order() {
  if (isTV()) {
    const L = `${badge('Sipariş onaylandı', 'success', 'check-circle')}<h1 class="pgb-tv-h">SIP-2026-10482 · Yolda</h1><p class="pgb-tv-body">Tahmini teslim: 18 Ekim, 10.00–14.00 · İzmir</p><div class="row gap24">${btn('Canlı takibi aç', 'primary', { icon: 'truck', cls: 'tvf pgb-tvfocus', attrs: ' data-tv' })}</div>`;
    const R = `<h2 class="sr-only">Sipariş durumu</h2><ol class="pgb-tvtl">${[['done', 'Ödeme emanette'], ['done', 'Üretim tamamlandı'], ['now', 'Yolda · Manisa'], ['next', 'Teslim ve onay']].map(([s, t]) => `<li class="is-${s}"${s === 'now' ? ' aria-current="step"' : ''}><span aria-hidden="true">${ic(s === 'done' ? 'check' : s === 'now' ? 'truck' : 'clock', { s: 24 })}</span>${esc(t)}</li>`).join('')}</ol>`;
    return { main: root('siparis', tvSplit(L, R)) };
  }
  const ok = `<section class="pgb-okwrap" aria-label="Onay"><div class="container"><div class="pgb-ok${isSmall() ? ' is-stack' : ''}" role="status">${iconTile('check-circle', 'green', 'lg')}<div class="pgb-ok-t"><h1 id="pgb-h1">Siparişiniz alındı · SIP-2026-10482</h1><p class="muted">Ödemeniz Ticaret Güvencesi emanetinde. e-Fatura ve PO eşleşmesi muhasebeye iletildi.</p></div>${isSmall() ? '' : btn('Faturayı indir', 'secondary', { icon: 'download-simple' })}</div></div></section>`;
  const tl = card(`${h2('Sipariş durumu')}${timeline([['done', 'Ödeme emanete alındı', '02 Eki · 14.12'], ['done', 'Üretim başladı · Ege Tekstil', '03 Eki'], ['done', 'Kalite kontrol · SGS raporu yüklendi', '14 Eki'], ['now', 'Yolda · Manisa aktarma', 'Bugün 09.40'], ['next', 'Teslim ve 7 gün inceleme', 'Tahmini 18 Eki'], ['next', 'Ödeme tedarikçiye aktarılır', 'Onayınızla']])}`);
  const map = card(`<div class="pgb-map" aria-hidden="true"><span class="pgb-map-route"></span><span class="pgb-map-pin a">${ic('map-pin', { duo: true, s: 28 })}</span><span class="pgb-map-pin b">${ic('flag', { duo: true, s: 28 })}</span>${ic('truck', { duo: true, s: 72, cls: 'pgb-map-truck' })}</div>
<div class="pgb-map-t">${h2('Canlı konum')}<p><b>Manisa → İzmir · 38 km kaldı</b></p><p class="muted">Tahmini varış 18 Eki, 10.00–14.00</p></div>`, { cls: 'pgb-mapcard', tag: 'section', attrs: ' aria-label="Canlı konum"' });
  const sum = card(`${h2('Sipariş özeti')}${sumRows([['Organik penye · 2.000 m', '₺258.000'], ['Zeytinyağı · 40 teneke', '₺49.600'], ['Lojistik', '₺4.780']])}${divider()}${sumRows([['Toplam', '₺312.480', 1]])}`);
  const acts = `<div class="row wrap gap8">${btn('Tedarikçiye yaz', 'secondary', { icon: 'chat-circle-dots', href: link('mesajlar') })}${btn('Sorun bildir', 'tertiary', { icon: 'warning-circle', href: link('yardim') })}${isSmall() ? btn('Faturayı indir', 'tertiary', { icon: 'download-simple' }) : ''}</div>`;
  return { main: root('siparis', ok + two('Takip', tl, map + sum + acts, { lw: '58%', asideLabel: 'Teslimat ve özet' })) };
}
