// 28 · Tedarikçi Olun — mirrors designer/v2/pages-c.js BUILD.sell
import { ctx, ic, esc, btn, badge, secHead, feature, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { cols, tvHandoff } from './_c-kit.mjs';

export default function sell() {
  if (isTV()) return { main: `<div class="pg-c pg-tedarikci-ol">${tvHandoff({ over: 'Tedarikçi olun', h1: '190 ülkedeki alıcılara ulaşın', body: 'Mağazanızı 1 günde açın; doğrulama rozeti ve AI eşleştirme ile ilk teklifinizi bu hafta alın.', steps: ['QR kodu okutun', 'Şirket ve ürün bilgilerini girin', 'Doğrulama randevusu seçin'], qr: 'Başvuruyu telefonda aç', cta: 'Başvur', ctaIcon: 'storefront' })}</div>` };
  const wide = isWide(); const f = ctx.fam;
  const hero = `<section class="sec inverse c-hero" aria-labelledby="to-h"><div class="container c-hero-grid${wide ? ' is-split is-half' : ''}"><div class="c-hero-copy">${badge('AI alıcı eşleştirme', 'ai', 'sparkle')}
<h1 id="to-h">Üretiminizi 190 ülkedeki kurumsal alıcılara açın.</h1><p class="lead c-invlead">Komisyon yalnızca tamamlanan siparişten; mağaza, doğrulama ve ilk 3 ay reklam ücretsiz.</p>
<div class="row wrap gap12">${btn('Ücretsiz başvur', 'primary', { icon: 'storefront', href: link('kayit') })}${btn('Satış ekibiyle görüş', 'secondary', { icon: 'headset', href: link('yardim') })}</div></div>
<dl class="c-kpis${wide ? ' is-col' : ''}">${[['3.200+', 'kurumsal alıcı'], ['₺118 bin', 'ortalama sipariş'], ['24 sa', 'ilk teklif süresi']].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl></div></section>`;
  const fc = isSmall() ? 1 : f === 'tablet' ? 2 : 3;
  const feats = [['sparkle', 'violet', 'AI alıcı eşleştirme', 'Teklif taleplerini kapasitenize göre size getirir.'], ['seal-check', 'green', 'Doğrulama rozeti', 'Yerinde denetim ile güven ve dönüşüm artışı.'], ['chart-line-up', 'blue', 'Satış analitiği', 'Görüntülenme, teklif ve kazanma oranı.'], ['translate', 'saffron', 'Canlı çeviri', '14 dilde alıcı yazışması.'], ['truck', 'teal', 'Lojistik ağı', 'Anlaşmalı fiyatlarla kapıdan kapıya.'], ['bank', 'slate', 'Güvenli tahsilat', 'Emanet sistemiyle garantili ödeme.']].slice(0, fc * 2);
  const fsec = `<section class="sec" aria-labelledby="to-f"><div class="container">${secHead('Neden Arasta', 'Satış ekibiniz için güçlü araçlar').replace('<h2>', '<h2 id="to-f">')}${cols(fc, feats.map(([i, t, h, d]) => feature(i, t, h, d)))}</div></section>`;
  const plans = [['Başlangıç', '₺0', '%4 komisyon', ['Mağaza', '50 ürün', 'Standart destek'], 0], ['Profesyonel', '₺2.490/ay', '%2,5 komisyon', ['Sınırsız ürün', 'AI eşleştirme', 'Öncelikli destek'], 1], ['Kurumsal', 'Teklif alın', 'Özel komisyon', ['API ve ERP', 'Hesap yöneticisi', 'SLA'], 0]];
  const pc = isSmall() ? 1 : 3;
  const psec = `<section class="sec surface" aria-labelledby="to-p"><div class="container">${secHead('Şeffaf fiyatlandırma', 'Paketler').replace('<h2>', '<h2 id="to-p">')}
${cols(pc, plans.map(([n, p, c, fs, hi]) => `<article class="c-plan card${hi ? ' is-hi' : ''}" aria-labelledby="pl-${n}">${hi ? badge('En çok tercih edilen', 'brand', 'star') : ''}<h3 id="pl-${n}">${esc(n)}</h3><p class="c-plan-p">${esc(p)}</p><p class="help">${esc(c)}</p>
<ul class="c-plan-f">${fs.map((x) => `<li>${ic('check', { cls: 'ok' })}<span>${esc(x)}</span></li>`).join('')}</ul>${btn(hi ? 'Profesyonel’e başla' : 'Seç', hi ? 'primary' : 'secondary', { block: true, href: link('kayit'), attrs: hi ? '' : ` aria-label="${esc(n)} paketini seç"` })}</article>`), { cls: 'c-plans' })}</div></section>`;
  return { main: `<div class="pg-c pg-tedarikci-ol">${hero}${fsec}${psec}</div>` };
}
