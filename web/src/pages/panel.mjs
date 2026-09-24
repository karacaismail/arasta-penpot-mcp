// 24 · Alıcı Paneli — mirrors designer/v2/pages-b.js BUILD.dashboard
import { ctx, ic, esc, btn, badge, statCard, link, isSmall, isTV } from '../lib/html.mjs';
import { root, pageHead, two, card, h2 } from './_b-kit.mjs';

const MONTHS = ['Kasım 2025', 'Aralık 2025', 'Ocak 2026', 'Şubat 2026', 'Mart 2026', 'Nisan 2026', 'Mayıs 2026', 'Haziran 2026', 'Temmuz 2026', 'Ağustos 2026', 'Eylül 2026', 'Ekim 2026'];
const VALS = [42, 55, 38, 61, 72, 58, 66, 80, 74, 88, 69, 94];
const tl = (v) => '₺' + (Math.round((v / 94) * 1284500 / 100) * 100).toLocaleString('tr-TR');

function chart() {
  return card(`<div class="pgb-chart-h">${h2('Aylık harcama', { id: 'chart-h' })}${badge('Son 12 ay', 'neutral', 'calendar-blank')}</div>
<div class="pgb-bars" aria-hidden="true">${VALS.map((v, i) => `<span class="${i === 11 ? 'is-cur' : ''}" style="height:${v}%" title="${MONTHS[i]}: ${tl(v)}"></span>`).join('')}</div>
<div class="pgb-axis" aria-hidden="true">${['Kas', 'Oca', 'Mar', 'May', 'Tem', 'Eyl', 'Eki'].map((m) => `<span>${m}</span>`).join('')}</div>
<table class="sr-only"><caption>Aylık harcama, son 12 ay</caption><thead><tr><th scope="col">Ay</th><th scope="col">Harcama</th></tr></thead><tbody>${VALS.map((v, i) => `<tr><th scope="row">${MONTHS[i]}</th><td>${tl(v)}</td></tr>`).join('')}</tbody></table>`, { tag: 'section', cls: 'pgb-chart', attrs: ' aria-labelledby="chart-h"' });
}

export default function dashboard() {
  if (isTV()) {
    const K = [['Bu ay harcama', '₺1.284.500', 'panel'], ['Açık teklif', '6', 'teklifler'], ['Yoldaki sipariş', '3', 'siparis'], ['Onay bekleyen', '2', 'panel']];
    return { main: root('panel', `<section class="pgb-tvdash" aria-labelledby="pgb-h1"><h1 id="pgb-h1" class="pgb-tv-h">Günaydın, Demir Tekstil</h1><ul class="pgb-tvkpi">${K.map(([l, v, s], i) => `<li><a href="${link(s)}" class="${i === 0 ? 'is-first' : ''}" data-tv><span class="l">${esc(l)}</span><b class="v">${esc(v)}</b></a></li>`).join('')}</ul></section>`) };
  }
  const small = isSmall();
  const actions = small ? '' : btn('CSV ile toplu sipariş', 'secondary', { icon: 'file-csv' }) + btn('Yeni teklif talebi', 'primary', { icon: 'plus', href: link('teklif-iste') });
  const kc = small ? (ctx.screen.w <= 360 ? 1 : 2) : 4;
  const kpi = `<section class="pgb-kpisec" aria-label="Özet göstergeler"><div class="container"><div class="pgb-kpi" style="--cols:${kc}">${[['receipt', 'Bu ay harcama', '₺1.284.500', '%12 geçen aya göre'], ['file-text', 'Açık teklif talebi', '6', '14 yeni teklif'], ['truck', 'Yoldaki sipariş', '3', '1’i bugün teslim'], ['list-checks', 'Onay bekleyen', '2', '₺486.000 toplam']].map((k) => statCard(...k)).join('')}</div></div></section>`;
  const orders = card(`${h2('Son siparişler', { id: 'ord-h' })}<div class="pgb-tscroll"><table class="pgb-tbl" aria-labelledby="ord-h"><thead><tr><th scope="col">Sipariş no</th><th scope="col">Tedarikçi</th>${small ? '' : '<th scope="col" class="num">Tutar</th>'}<th scope="col">Durum</th></tr></thead><tbody>${[['SIP-10482', 'Ege Tekstil', '₺258.000', 'Yolda', 'brand'], ['SIP-10471', 'Gebze Ambalaj', '₺36.800', 'Teslim edildi', 'success'], ['SIP-10466', 'Işık Elektrik', '₺94.000', 'Onay bekliyor', 'warning']].map(([no, s, t, st, tone]) => `<tr><th scope="row"><a class="mono" href="${link('siparis')}">${no}</a></th><td>${esc(s)}</td>${small ? '' : `<td class="num"><b>${t}</b></td>`}<td>${badge(st, tone)}</td></tr>`).join('')}</tbody></table></div>`, { tag: 'section', attrs: ' aria-labelledby="ord-h"' });
  const appr = card(`${h2('Onayınızı bekleyenler')}<ul class="pgb-appr">${[['PO-1187 · Organik penye', '₺258.000 · Mehmet K. talep etti'], ['PO-1190 · LED panel', '₺228.000 · Selin A. talep etti']].map(([t, s]) => `<li><p><b>${esc(t)}</b></p><p class="muted">${esc(s)}</p><div class="row wrap gap8">${btn('Onayla', 'primary', { icon: 'check', attrs: ` aria-label="Onayla: ${esc(t)}"` })}${btn('Reddet', 'secondary', { attrs: ` aria-label="Reddet: ${esc(t)}"` })}</div></li>`).join('')}</ul>`);
  const ai = card(`<div>${badge('Tasarruf fırsatı', 'ai', 'sparkle')}</div><p>Penye alımlarınızı çeyreklik birleştirirseniz 10.000 m kademesine geçip yılda ≈ ₺96.000 tasarruf edersiniz.</p><div>${btn('Senaryoyu gör', 'tertiary', { icon: 'chart-line-up' })}</div>`, { cls: 'pgb-aicard', tag: 'section', attrs: ' aria-label="AI içgörü"' });
  return { main: root('panel', pageHead(['Hesabım', 'Panel'], 'Günaydın, Ayşe', 'Demir Tekstil A.Ş. · Satın alma müdürü', actions) + kpi + two('Analitik ve görevler', chart() + orders, appr + ai, { lw: '62%', asideLabel: 'Görevler' })) };
}
