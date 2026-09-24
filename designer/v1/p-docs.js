// Pages 00 (cover + device matrix) and 01 (foundations) — runs inside Penpot via MCP
function lum(h) { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function DOC(name, x, y, w) { const f = B(null, name, { dir: 'column', gap: 48, p: [96, 96], W: w, H: 'hug', bg: C.paper }); f.x = x; f.y = y; f.setPluginData('doc', '1'); return f; }
function TABLE(parent, cols, rows, widths, o = {}) {
  const t = B(parent, o.name || 'table', { dir: 'column', W: 'fill', H: 'hug', stroke: C.line, r: RADIUS.md, clip: true });
  const row = (cells, head, i) => { const r = B(t, head ? 'thead' : 'tr', { dir: 'row', W: 'fill', H: 'hug', bg: head ? C.ink : i % 2 ? C.paper : C.ivory }); cells.forEach((c, j) => { const cell = B(r, head ? 'th' : 'td', { dir: 'column', p: [12, 16], W: widths[j], H: 'hug' }); T(cell, String(c), { s: 18, w: head ? 700 : j === 0 ? 600 : 400, c: head ? C.onDark : C.ink, fill: true }); }); };
  row(cols, true, 0); rows.forEach((r, i) => row(r, false, i));
  return t;
}
const UI_PATTERN = { phone: 'Üst bar + arama + alt sekme çubuğu (4 sekme)', phoneL: 'Sol rail (96px) + kompakt arama', tablet: 'Arama odaklı header + yatay kategori sekmeleri', tabletL: 'Kompakt masaüstü header (yardımcı bar yok)', desktop: 'Yardımcı bar + mega menü + yan filtre', wide: 'Masaüstü düzeni, 18px taban, 2240px konteyner', ultra: 'Masaüstü düzeni, 20px taban, 3200px konteyner', tv: '10-foot koyu UI, D-pad odak, QR ile telefona aktarım' };

BUILD.cover = async () => {
  if (penpot.currentPage.name !== '00 · Kapak & Cihaz Matrisi') { await penpot.openPage(penpotUtils.getPageByName('00 · Kapak & Cihaz Matrisi')); await sleep(300); }
  penpot.root.children.filter((s) => s.getPluginData('doc') === '1').forEach((s) => s.remove());
  const f = DOC('Kapak', 0, 0, 2400);
  const hero = B(f, 'başlık', { dir: 'column', gap: 16, W: 'fill', H: 'hug' });
  T(hero, 'ARASTA', { f: 'serif', s: 40, w: 600, ls: 8 });
  T(hero, 'Türkiye’nin seçkin üreticileri için B2B toptan pazar yeri', { f: 'serif', s: 96, w: 500, fill: true, lh: 1.05 });
  T(hero, 'Alibaba’nın B2B kapsamı (RFQ, MOQ, kademeli fiyat, doğrulanmış tedarikçi, Ticaret Güvencesi) + Gilt’in editoryal lüks dili (serif başlıklar, geniş boşluk, süreli flash satış etkinlikleri). Tamamı Penpot MCP üzerinden, Penpot içinde üretildi.', { s: 24, c: C.muted, fill: true, lh: 1.5 });
  const pr = B(f, 'ilkeler', { dir: 'row', gap: 24, W: 'fill', H: 'hug' });
  [['Adaptive-first', 'Her cihaz ailesi ayrı UI ve ayrı bileşen kullanır; yalnızca ölçeklenmez.'], ['320px önce', 'iPhone 4 genişliği taban; 1280px ekranın %400 zoom hali (WCAG 1.4.10 Reflow) aynı tasarımla karşılanır.'], ['1rem taban', 'Hiçbir metin 16px’in altında değil; TV’de 24px, 8K’da 20px taban.'], ['Radius ≤ 12', 'Köşe yarıçapları 0 / 4 / 8 / 12; token: radius.max.'], ['WCAG 2.2 AA', 'Kontrast, odak görünürlüğü, 24px+ hedef, erişilebilir kimlik doğrulama, tutarlı yardım.']]
    .forEach(([t, b]) => { const c = B(pr, 'ilke · ' + t, { dir: 'column', gap: 8, p: 24, W: (2208 - 96) / 5, H: 'hug', bg: C.ivory, r: RADIUS.md }); T(c, t, { f: 'serif', s: 32, w: 500, fill: true }); T(c, b, { s: 18, c: C.muted, fill: true }); });
  T(f, 'Cihaz matrisi · 20 hedef ekran', { f: 'serif', s: 48, w: 500 });
  const W = [140, 560, 180, 260, 520, 120, 428];
  TABLE(f, ['Kod', 'Cihaz', 'CSS px', 'Fiziksel / DPR', 'UI kalıbı', 'Sütun', 'Header bileşeni'],
    DEVS.map((d) => [d.id, d.label.split(' · ')[0], `${d.w}×${d.h}`, d.id === 'W2560' ? '5120×2880 @2x' : d.id === 'TV' ? '3840×2160 @2x' : d.id === 'U8K' ? '7680×4320 @2x' : d.fam.startsWith('phone') ? '@2x–3x' : d.fam.startsWith('tablet') ? '@2x' : '@1x–2x', UI_PATTERN[d.fam], d.cols, d.fam === 'phoneL' ? 'Rail/phone-landscape' : HDR[d.fam]]), W, { name: 'Cihaz matrisi (table)' });
  T(f, 'Sayfa dizini', { f: 'serif', s: 48, w: 500 });
  TABLE(f, ['Sayfa', 'İçerik', 'TV sürümü'], [
    ['10 · Ana Sayfa', 'Hero, güvence şeridi, flash etkinlikler, kategoriler, ürünler, RFQ bandı', 'D-pad satırları, odaklı kart'],
    ['11 · Kategori & Arama', 'Filtre (fieldset), uygulanan filtre çipleri, sonuç ızgarası, sayfalama', 'Filtre çipleri + kart satırı'],
    ['12 · Ürün Detayı', 'Galeri, kademeli fiyat, varyant, miktar, Ticaret Güvencesi, özellik tablosu', 'Büyük görsel + telefona gönder'],
    ['13 · Tedarikçi Mağazası', 'Kapak, kimlik, performans, sekmeler, ürünler, fabrika', 'Kimlik + ürün satırı'],
    ['14 · Teklif İste (RFQ)', 'Hata özeti, adımlar, alan hataları, dosya ekleme, kayıtlı adres', 'QR ile telefona aktarım'],
    ['15 · Flash Fırsatlar', 'Etkinlik hero, geri sayım, yayında/yakında sekmeleri', 'Etkinlik + ürün satırı'],
    ['16 · Sepet', 'Tedarikçi grupları, kademe ipucu, özet, sabit ödeme çubuğu', 'QR ile telefonda tamamla'],
    ['17 · Giriş / Kayıt', 'Passkey, e-posta bağlantısı, şifre göster, CAPTCHA yok', 'Cihaz kodu (K74QX) + QR'],
    ['18 · Ticaret Güvencesi', 'Hero, 4 adım, kapsam, SSS akordeon', '4 adım + görsel'],
    ['19 · 404 & Boş Durum', '404, arama, popüler kategoriler, sonuç yok önerileri', 'Ana sayfaya dön (odakta)'],
  ], [520, 1320, 368], { name: 'Sayfa dizini (table)' });
  T(f, 'WCAG 2.2 AA eşlemesi', { f: 'serif', s: 48, w: 500 });
  TABLE(f, ['Kriter', 'Tasarımdaki karşılığı'], [
    ['1.4.3 Kontrast (Minimum)', 'Gövde 7,1:1+ (muted #5C5752 / beyaz), altın metin 7,1:1, TV koyu zeminde 10:1+'],
    ['1.4.11 Metin dışı kontrast', 'Form kenarlığı #857E75 = 4,0:1; odak halkası #0B57D0 = 6,4:1, koyu zeminde #8AB4F8 = 9:1'],
    ['1.4.10 Reflow', '320 CSS px tasarımı (1280px @%400) yatay kaydırmasız; tek sütun'],
    ['1.4.4 / 1.4.12 Metin boyutu ve aralık', 'Min 16px, satır yüksekliği 1,5; metin kutuları auto-height'],
    ['2.4.7 / 2.4.11 Odak görünür, örtülmez', '3px halka; sabit alt çubuk için içerik alt boşluğu = çubuk yüksekliği'],
    ['2.5.8 Hedef boyutu (Minimum)', 'Tüm hedefler ≥ 24px; dokunmatikte 44–48px, TV’de 64px'],
    ['2.5.7 Sürükleme', 'Karuseller ve aralıklar için buton/giriş alternatifi (stepper, sayfalama)'],
    ['3.2.6 Tutarlı yardım', 'Yardım bağlantısı her sayfada aynı konumda (footer + RFQ yan panel)'],
    ['3.3.1 / 3.3.3 Hata tanımı ve önerisi', 'Hata özeti (role=alert) + alan altında ikonlu metin + örnek değer'],
    ['3.3.7 Tekrarlı giriş', '“Kayıtlı şirket adresimi kullan” seçeneği'],
    ['3.3.8 Erişilebilir kimlik doğrulama', 'Passkey, e-posta bağlantısı, yapıştırma serbest, CAPTCHA yok; TV’de cihaz kodu'],
    ['2.2.1 Zamanlama ayarlanabilir', 'Geri sayım bilgilendirici; işlem süresi kısıtlamaz. TV kodu yenilenebilir'],
  ], [620, 1588], { name: 'WCAG eşlemesi (table)' });
  await FIXUP(f);
  return f;
};

BUILD.found = async () => {
  if (penpot.currentPage.name !== '01 · Temeller (Foundations)') { await penpot.openPage(penpotUtils.getPageByName('01 · Temeller (Foundations)')); await sleep(300); }
  penpot.root.children.filter((s) => s.getPluginData('doc') === '1').forEach((s) => s.remove());
  const f = DOC('Temeller', 0, 0, 2400);
  T(f, 'Temeller', { f: 'serif', s: 96, w: 500 });
  T(f, 'Renkler · kontrast oranları hesaplanmış (WCAG 2.2)', { f: 'serif', s: 40, w: 500 });
  const sw = B(f, 'renk örnekleri', { dir: 'row', gap: 24, W: 'fill', H: 'hug', wrap: true });
  penpot.library.local.colors.forEach((lc) => {
    const hex = lc.color; const onW = ratio(hex, '#FFFFFF'), onI = ratio(hex, '#111111');
    const c = B(sw, 'renk · ' + lc.name, { dir: 'column', gap: 8, W: 400, H: 'hug' });
    const chip = B(c, 'örnek', { dir: 'column', jc: 'end', p: 16, W: 'fill', H: 140, r: RADIUS.md, stroke: C.line }); chip.fills = [lc.asFill()];
    T(chip, 'Aa', { s: 32, w: 600, c: onW >= onI ? '#FFFFFF' : '#111111' });
    T(c, lc.name, { s: 18, w: 700 }); T(c, `${hex} · beyaz üzerinde ${onW.toFixed(2)}:1 · mürekkep üzerinde ${onI.toFixed(2)}:1`, { s: 16, c: C.muted, fill: true });
  });
  T(f, 'Tipografi · kütüphane stilleri (Bodoni Moda + Inter)', { f: 'serif', s: 40, w: 500 });
  const ty = B(f, 'tipografi', { dir: 'column', gap: 20, W: 'fill', H: 'hug' });
  penpot.library.local.typographies.forEach((tp) => {
    const r = B(ty, 'tipo · ' + tp.name, { dir: 'row', gap: 32, ai: 'center', W: 'fill', H: 'hug' });
    const l = T(r, `${tp.name}\n${tp.fontFamily} ${tp.fontWeight} · ${tp.fontSize}/${tp.lineHeight}`, { s: 16, c: C.muted }); l.resize(360, l.height); l.growType = 'auto-height';
    const s = T(r, 'Seçkin üreticilerden toptan alım', { fill: true }); tp.applyToText(s); s.growType = 'auto-height';
  });
  T(f, 'Boşluk · 4px taban', { f: 'serif', s: 40, w: 500 });
  const sp = B(f, 'boşluk ölçeği', { dir: 'row', gap: 24, ai: 'end', W: 'fill', H: 'hug' });
  [4, 8, 12, 16, 24, 32, 48, 64, 96, 128].forEach((v, i) => { const c = B(sp, 'space.' + (i + 1), { dir: 'column', gap: 8, ai: 'center', W: 'hug', H: 'hug' }); B(c, 'bar', { W: v, H: v, bg: C.accent }); T(c, `space.${i + 1}\n${v}px`, { s: 16, align: 'center' }); });
  T(f, 'Köşe yarıçapı · en fazla 12px', { f: 'serif', s: 40, w: 500 });
  const rd = B(f, 'radius', { dir: 'row', gap: 32, W: 'fill', H: 'hug' });
  [['radius.none', 0], ['radius.sm · buton, çip içi', 4], ['radius.md · kart, alan', 8], ['radius.lg = radius.max · sekme göstergesi, TV kart', 12]].forEach(([n, v]) => { const c = B(rd, n, { dir: 'column', gap: 8, W: 360, H: 'hug' }); B(c, 'örnek', { W: 'fill', H: 160, bg: C.ivory, stroke: C.ink, sw: 1.5, r: v }); T(c, `${n} · ${v}px`, { s: 16, fill: true }); });
  T(f, 'Hedef boyutları ve odak', { f: 'serif', s: 40, w: 500 });
  const tg = B(f, 'hedefler', { dir: 'row', gap: 40, ai: 'end', W: 'fill', H: 'hug' });
  [['24px · WCAG 2.5.8 alt sınır', 24], ['44px · dokunmatik', 44], ['48px · rahat / 5K', 48], ['56px · 8K', 56], ['64px · TV D-pad', 64]].forEach(([n, v]) => { const c = B(tg, n, { dir: 'column', gap: 8, ai: 'start', W: 'hug', H: 'hug' }); const b = B(c, 'hedef', { dir: 'row', ai: 'center', jc: 'center', W: v, H: v, stroke: C.focus, sw: 1.5, r: 4 }); I(b, 'heart', { s: Math.min(24, v - 8) }); T(c, n, { s: 16 }); });
  const fb = B(f, 'odak durumları', { dir: 'row', gap: 32, ai: 'center', W: 'fill', H: 'hug', p: 32, bg: C.ivory, r: RADIUS.md });
  BTN(fb, 'Varsayılan', { kind: 'primary' }); BTN(fb, 'Klavye odağı', { kind: 'primary', focus: true }); BTN(fb, 'İkincil odak', { kind: 'secondary', focus: true });
  const dk = B(fb, 'koyu zemin', { dir: 'row', gap: 24, p: 24, W: 'hug', H: 'hug', bg: C.ink, r: RADIUS.md }); BTN(dk, 'TV odağı', { kind: 'onDark', focus: true, dark: true, h: 64, s: 24 });
  await FIXUP(f);
  return f;
};
