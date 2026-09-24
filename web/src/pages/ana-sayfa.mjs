// 10 · Ana Sayfa — reference page (mirrors designer/v2/pages-a.js BUILD.home)
import { ctx, ic, esc, btn, badge, section, secHead, grid, productCard, supplierCard, eventCard, catTile, aiSearch, feature, iconTile, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { CATS, PRODS, EVENTS, SUPPLIERS, COLS } from '../data.mjs';

export default function home() {
  const f = ctx.fam;
  if (isTV()) {
    return { main: `<section class="tv-hero container"><div class="tv-hero-copy">${badge('Sesli akıllı arama', 'ai', 'microphone')}<h1>Üreticiden doğrudan, akıllı toptan alım.</h1><p class="lead">“Denizli’den organik penye, 5.000 metre” deyin; tekliflerinizi bu ekranda takip edin.</p>
<div class="row gap24">${btn('Sesli ara', 'primary', { icon: 'microphone', cls: 'tvf' })}${btn('Flash fırsatlar', 'secondary', { icon: 'lightning', href: link('flash') })}</div></div><div class="tv-hero-art" aria-hidden="true">${ic('storefront', { duo: true, s: 180 })}</div></section>
<section class="tv-row container" aria-labelledby="tvr1"><h2 id="tvr1">Flash fırsatlar · şu an yayında</h2><div class="tv-rail">${PRODS.slice(0, 5).map((p) => productCard(p, { cls: 'tv-card' })).join('')}</div></section>` };
  }
  const stackedHero = !isWide();
  const hero = `<section class="sec brand hero" aria-labelledby="h1"><div class="container hero-grid${stackedHero ? ' is-stacked' : ''}">
<div class="hero-copy"><span class="eyebrow">${ic('seal-check', { s: 16 })}48.000 doğrulanmış üretici</span>
<h1 id="h1">${ctx.screen.w <= 360 ? 'Üreticiden doğrudan, akıllı toptan alım.' : 'Türkiye’nin üreticilerinden doğrudan, akıllı toptan alım.'}</h1>
<p class="lead">İhtiyacınızı doğal dille yazın; yapay zekâ doğru üreticiyi, kademeli fiyatı ve teslim süresini sizin için eşleştirsin.</p>
${aiSearch()}
<dl class="hero-stats"><div><dt>üretici</dt><dd>48.000+</dd></div><div><dt>ile teslimat</dt><dd>81</dd></div><div><dt>güvenceli işlem</dt><dd>₺2,1 mlr</dd></div></dl></div>
${stackedHero ? '' : `<div class="hero-collage" aria-hidden="true"><div class="toast-static card">${ic('check-circle', { cls: 'ok', s: 24 })}<div><b>3 yeni teklif geldi</b><p class="muted">En iyi fiyat ₺121/m · 18 gün teslim</p></div></div>${supplierCard()}<div class="collage-stat">${`<div class="stat card"><div class="row gap8"><span class="icon-tile sm">${ic('receipt')}</span><span class="muted">Bu ay harcama</span></div><b class="stat-v">₺1.284.500</b><span class="delta">${ic('trend-up', { s: 16 })}%12 geçen aya göre</span></div>`}</div></div>`}
</div></section>`;
  const values = [['shield-check', 'green', 'Ticaret Güvencesi', 'Ödeme teslim onayına kadar emanette.'], ['seal-check', 'blue', 'Doğrulanmış üretici', 'Yerinde denetim, belge ve kapasite kontrolü.'], ['truck', 'saffron', 'Uçtan uca lojistik', '81 ile ve 190 ülkeye varış maliyeti hesabı.'], ['sparkle', 'violet', 'AI eşleştirme', 'İhtiyacınıza en uygun 6 üretici, 24 saatte.']];
  const trust = section('Güvence şeridi', `<ul class="values card">${values.map(([i, t, h, d]) => `<li>${iconTile(i, t)}<div><b>${esc(h)}</b><p class="muted">${esc(d)}</p></div></li>`).join('')}</ul>`, { cls: 'sec-tight' });
  const catN = isSmall() ? 6 : 10;
  const cats = section('Sektörler', secHead('Sektörler', 'Kategorilere göz atın', { link: 'Tüm kategoriler', href: link('kategoriler') }) + grid(CATS.slice(0, catN).map(catTile), { cls: 'g-cats' }));
  const evN = isSmall() ? 2 : f === 'tablet' ? 2 : 3;
  const events = section('Flash etkinlikler', secHead('Sınırlı süre', 'Flash satış etkinlikleri', { link: 'Tüm etkinlikler', href: link('flash'), sub: isSmall() ? '' : 'Üreticilerin kontenjanlı toptan kampanyaları. Süre bitince fiyatlar liste fiyatına döner.' }) + grid(EVENTS.slice(0, evN).map(eventCard), { cls: 'g-events' }), { cls: 'surface' });
  const rfq = section('AI teklif asistanı', `<div class="rfq-band${isWide() ? ' is-split' : ''}"><div class="rfq-copy">${badge('Teklif asistanı', 'ai', 'robot')}<h2>Tek cümle yazın, yapay zekâ teklif talebinizi oluştursun.</h2>
<ol class="steps">${['İhtiyacı yazın veya teknik çizimi yükleyin', 'AI; miktar, sertifika ve teslimatı ayrıştırır', '24 saatte doğrulanmış üreticilerden teklif'].map((t, i) => `<li><span>${i + 1}</span>${esc(t)}</li>`).join('')}</ol>${btn('Teklif talebi oluştur', 'primary', { icon: 'sparkle', href: link('teklif-iste'), block: isSmall() })}</div>
${isWide() ? `<div class="quote-preview" aria-label="Örnek teklifler">${[['ET', 'Ege Tekstil A.Ş.', '₺121,00 / m', '18 gün', 1], ['UÖ', 'Uşak Örme San.', '₺126,50 / m', '24 gün']].map(([i, n, p, l, best]) => `<div class="qrow${best ? ' is-best' : ''}"><span class="logo-tile sm">${i}</span><div class="grow"><b>${n}</b><span class="muted">Denizli · Doğrulanmış</span></div><b class="qprice">${p}</b><span>${l}</span>${best ? badge('En iyi değer', 'ai', 'sparkle') : ''}</div>`).join('')}</div>` : ''}</div>`, { cls: 'inverse' });
  const cols = COLS[f]; const prodN = isSmall() ? (ctx.screen.w <= 320 ? 3 : 4) : cols * 2;
  const prods = section('Önerilenler', secHead('Sizin için', 'Öne çıkan toptan ürünler', { link: 'Daha fazlası', href: link('arama') }) + grid(PRODS.slice(0, prodN).map((p) => productCard(p)), { cls: 'g-products' }));
  const supN = isSmall() ? 2 : f === 'tablet' ? 2 : f === 'tabletL' || f === 'desktop' ? 3 : f === 'wide' ? 4 : 5;
  const sups = section('Seçkin üreticiler', secHead('Doğrulanmış', 'Seçkin üreticiler', { link: 'Tedarikçi ara', href: link('tedarikciler') }) + grid(SUPPLIERS.slice(0, supN).map(supplierCard), { cls: 'g-suppliers' }), { cls: 'surface' });
  const ent = section('Kurumsal satın alma', secHead('Kurumsal', 'Satın alma ekibiniz için tasarlandı', { sub: 'Onay akışları, bütçe limitleri, e-Fatura ve ERP entegrasyonu tek hesapta.' }) + grid([
    feature('users-three', 'blue', 'Çoklu kullanıcı ve roller', 'Talep eden, onaylayan ve finans rolleri.'), feature('list-checks', 'green', 'Onay akışları', 'Tutar ve kategoriye göre kural tabanlı onay.'),
    feature('receipt', 'saffron', 'e-Fatura ve ERP', 'Siparişler muhasebeye otomatik aktarılır.'), feature('chart-line-up', 'violet', 'Harcama analitiği', 'Tedarikçi, kategori ve dönem bazlı raporlar.')], { cls: 'g-features' }));
  return { main: hero + trust + cats + events + rfq + prods + sups + ent };
}
