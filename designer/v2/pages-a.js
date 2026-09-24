// Arasta v2 · page builders 10–17 + runner — runs inside Penpot via MCP
const BUILD = {};
const GROUPS = [['Telefon · dikey', ['P320', 'P360', 'P390', 'P430']], ['Telefon · yatay', ['L480', 'L844', 'L932']], ['Tablet · dikey', ['T600', 'T768', 'T1024P']], ['Tablet · yatay', ['T960', 'T1024L', 'T1366']], ['Laptop & desktop', ['K1280', 'K1440', 'K1728', 'D1920']], ['Büyük ekranlar · 5K, 4K TV, 8K', ['W2560', 'TV', 'U8K']]];
function slot(id) { for (const [gi, [, ids]] of GROUPS.entries()) { const k = ids.indexOf(id); if (k >= 0) { let x = 0; for (let j = 0; j < k; j++) x += DEV(ids[j]).w + 200; return { x, y: gi * 40000 }; } } }
async function RUN(pageName, key, ids) {
  if (penpot.currentPage.name !== pageName) { await penpot.openPage(penpotUtils.getPageByName(pageName)); await sleep(300); }
  resetCaches(); resetComps(); const out = [];
  for (const id of ids) {
    const t0 = Date.now(); const d = DEV(id); const { x, y } = slot(id);
    penpot.root.children.filter((s) => s.getPluginData && s.getPluginData('dev') === id).forEach((s) => s.remove());
    try { const f = await BUILD[key](d, x, y); out.push(`${id} ok ${Date.now() - t0}ms h=${Math.round(f.height)} n=${penpotUtils.findShapes(() => true, f).length}`); }
    catch (e) { out.push(`${id} ERR ${e.message} @${Date.now() - t0}ms`); }
  }
  return out;
}
async function ARRANGE(pageName, title, sub) {
  if (penpot.currentPage.name !== pageName) { await penpot.openPage(penpotUtils.getPageByName(pageName)); await sleep(300); }
  penpot.root.children.filter((s) => s.getPluginData('label') === '1').forEach((s) => s.remove());
  const frames = penpot.root.children.filter((s) => s.getPluginData && s.getPluginData('dev'));
  const pt = T(null, title, 'display/xl'); pt.x = 0; pt.y = -320; pt.setPluginData('label', '1');
  const st = T(null, sub || 'Adaptive-first · her cihaz ailesi ayrı UI ve ayrı bileşenler · Roboto · Phosphor · min 16px · radius ≤ 12 · WCAG 2.2 AA', 'title/l', { c: 'text/secondary' }); st.x = 0; st.y = -200; st.setPluginData('label', '1');
  let y = 0;
  for (const [name, ids] of GROUPS) {
    const row = ids.map((id) => frames.find((f) => f.getPluginData('dev') === id)).filter(Boolean); if (!row.length) continue;
    const lb = T(null, name, 'headline/l'); lb.x = 0; lb.y = y; lb.setPluginData('label', '1'); y += 90;
    let x = 0, mh = 0; for (const f of row) { f.x = x; f.y = y; x += f.width + 200; mh = Math.max(mh, f.height); }
    y += mh + 300;
  }
  return frames.length;
}
const TINTBG = { blue: 'bg/brand-subtle', violet: 'bg/ai-subtle', green: 'bg/success-subtle', saffron: 'bg/warning-subtle', coral: 'bg/danger-subtle', slate: 'bg/muted', teal: 'bg/success-subtle' };
function PAGEHEAD(main, d, crumbs, title, sub, o = {}) {
  const s = SECTION(main, 'Sayfa başlığı', d, { pt: SMALL(d) ? 16 : d.gap * 1.5, pb: o.pb ?? 8, gap: 8 });
  if (crumbs && !SMALL(d)) { const b = B(s, 'Breadcrumb (nav)', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true }); crumbs.forEach((c, i) => { if (i) ICN(b, 'caret-right', 16, 'text/tertiary'); TX(b, d, c, 'body', { c: i === crumbs.length - 1 ? 'text/primary' : 'text/link', u: i < crumbs.length - 1 }); }); }
  const hr = B(s, 'title-row', { dir: WIDE(d) ? 'row' : 'column', gap: 12, ai: WIDE(d) ? 'end' : 'stretch', W: 'fill', H: 'hug' });
  const tt = B(hr, 'titles', { dir: 'column', gap: 6, W: 'fill', H: 'hug' });
  TX(tt, d, title, 'h2', { fill: true, name: 'h1 · ' + title }); if (sub) TX(tt, d, sub, 'body', { c: 'text/secondary', fill: true });
  if (o.actions) o.actions(hr);
  return s;
}
function CARDBOX(parent, name, d, o = {}) { return B(parent, name, { dir: o.dir || 'column', gap: o.gap ?? 16, p: o.p ?? (SMALL(d) ? 16 : 24), W: o.W ?? 'fill', H: 'hug', r: R.m, bg: o.bg || 'bg/surface', st: o.st ?? 'border/subtle', el: o.el ?? 'e1', ai: o.ai, jc: o.jc }); }
function ICONTILE(parent, icon, tint = 'blue', size = 48) { const t = B(parent, 'icon-tile', { dir: 'row', ai: 'center', jc: 'center', W: size, H: size, r: R.m, bg: TINTBG[tint] }); I(t, icon, { s: Math.round(size * 0.55), style: 'duotone', c: (TINTS[tint] || TINTS.blue)[2] }); return t; }
function FEATURE(parent, d, icon, tint, title, desc) { const c = CARDBOX(parent, 'feature · ' + title, d, { gap: 10 }); ICONTILE(c, icon, tint); TX(c, d, title, 'h3', { fill: true }); TX(c, d, desc, 'body', { c: 'text/secondary', fill: true }); return c; }
function STAT(parent, d, v, l, dark) { const s = B(parent, 'stat · ' + l, { dir: 'column', gap: 2, W: 'hug', H: 'hug' }); TX(s, d, v, 'h3', { c: dark ? 'text/inverse' : 'text/primary' }); TX(s, d, l, 'body', { c: dark ? 'text/inverse-muted' : 'text/secondary' }); return s; }
const nCols = (d, m) => m[d.fam] ?? (typeof m === 'number' ? m : 2);

// ---------- 10 · Home ----------
BUILD.home = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Ana Sayfa', x, y);
    TV_SPLIT(sh, (L) => {
      BADGEI(L, 'AI', 'Sesli akıllı arama', 'microphone');
      T(L, 'Üreticiden doğrudan, akıllı toptan alım.', 'tv/display', { c: 'text/inverse', fill: true });
      T(L, '“Denizli’den organik penye, 5.000 metre” deyin; tekliflerinizi bu ekranda takip edin.', 'tv/body', { c: 'text/inverse-muted', fill: true });
      const a = B(L, 'eylemler', { dir: 'row', gap: 24, W: 'hug', H: 'hug' }); TV_FOCUSBTN(a, 'Sesli ara', 'microphone'); BTNI(a, d, 'Flash fırsatlar', 'İkincil', 'lightning');
    }, (R2) => { const g = B(R2, 'hero-illu', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: 340, r: R.m, grad: GRAD_BRAND }); I(g, 'storefront', { s: 180, style: 'duotone', c: 'text/on-brand' }); }, 900);
    TV_ROW(sh.main, 'Flash fırsatlar · şu an yayında', PRODS.slice(0, 5), 0);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Ana Sayfa', x, y); const stacked = !WIDE(d);
  // hero
  const hs = SECTION(sh.main, 'Hero', d, { grad: GRAD_BRAND, dir: stacked ? 'column' : 'row', gap: d.gap * 2, ai: 'center', pt: SMALL(d) ? 24 : d.gap * 3, pb: SMALL(d) ? 32 : d.gap * 3 });
  const hl = B(hs, 'hero-copy', { dir: 'column', gap: d.gap, W: stacked ? 'fill' : Math.round(d.cw * 0.54), H: 'hug' });
  const chip = B(hl, 'eyebrow', { dir: 'row', gap: 6, ai: 'center', p: [0, 12], H: 32, W: 'hug', r: R.m, bg: '#FFFFFF', bgo: 0.16 }); ICN(chip, 'seal-check', 16, 'text/on-brand'); TX(chip, d, '48.000 doğrulanmış üretici', 'label', { c: 'text/on-brand' });
  TX(hl, d, d.w <= 360 ? 'Üreticiden doğrudan, akıllı toptan alım.' : 'Türkiye’nin üreticilerinden doğrudan, akıllı toptan alım.', 'hero', { c: 'text/on-brand', fill: true, name: 'h1' });
  TX(hl, d, 'İhtiyacınızı doğal dille yazın; yapay zekâ doğru üreticiyi, kademeli fiyatı ve teslim süresini sizin için eşleştirsin.', 'lead', { c: 'bg/brand-subtle-2', fill: true });
  const ai = INST(hl, `AISearch/${SMALL(d) || d.fam === 'tablet' ? 'S' : 'L'}`, { W: 'fill', name: 'AISearch' });
  const stats = B(hl, 'stats', { dir: 'row', gap: SMALL(d) ? 20 : 40, W: 'fill', H: 'hug', wrap: true });
  [['48.000+', 'üretici'], ['81', 'ile teslimat'], ['₺2,1 mlr', 'güvenceli işlem']].forEach(([v, l]) => STAT(stats, d, v, l, true));
  if (!stacked) {
    const col = B(hs, 'kolaj (dekoratif, aria-hidden)', { dir: 'column', gap: d.gap, ai: 'end', W: 'fill', H: 'hug' });
    const t1 = INST(col, 'Toast#Başarı', { name: 'kolaj · teklif bildirimi' }); SETT(t1, 'title', '3 yeni teklif geldi'); SETT(t1, 'desc', 'En iyi fiyat ₺121/m · 18 gün teslim');
    INST(col, 'SupplierCard/M', { name: 'kolaj · tedarikçi' });
    const sc = INST(col, 'StatCard', { name: 'kolaj · harcama' }); sc.layoutChild.alignSelf = 'start';
  }
  // trust strip
  const ts = SECTION(sh.main, 'Güvence şeridi', d, { pt: d.gap * 1.5, pb: 0 });
  const tb = CARDBOX(ts, 'değer önerileri', d, { dir: 'column', gap: d.gap });
  const tcols = SMALL(d) ? 1 : d.fam === 'tablet' ? 2 : 4;
  ROWS(tb, [['shield-check', 'green', 'Ticaret Güvencesi', 'Ödeme teslim onayına kadar emanette.'], ['seal-check', 'blue', 'Doğrulanmış üretici', 'Yerinde denetim, belge ve kapasite kontrolü.'], ['truck', 'saffron', 'Uçtan uca lojistik', '81 ile ve 190 ülkeye varış maliyeti hesabı.'], ['sparkle', 'violet', 'AI eşleştirme', 'İhtiyacınıza en uygun 6 üretici, 24 saatte.']],
    tcols, d.gap, (r, [ic, tn, t, ds]) => { const c = B(r, 'value · ' + t, { dir: 'row', gap: 12, ai: 'start', W: 'fill', H: 'hug' }); ICONTILE(c, ic, tn, 44); const tx = B(c, 'text', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); TX(tx, d, t, 'label', { fill: true }); TX(tx, d, ds, 'body', { c: 'text/secondary', fill: true }); return c; }, d.cw - (SMALL(d) ? 32 : 48));
  // categories
  const cs = SECTION(sh.main, 'Sektörler', d);
  SHEAD(cs, d, 'Sektörler', 'Kategorilere göz atın', { link: 'Tüm kategoriler' });
  const cc = nCols(d, { phone: d.w <= 320 ? 1 : 2, phoneL: d.w < 600 ? 2 : 3, tablet: d.w < 700 ? 2 : 3, tabletL: 5, desktop: 5, wide: 5, ultra: 5 });
  ROWS(cs, CATS.slice(0, SMALL(d) ? 6 : cc * 2), cc, d.gap, (r, c, k, w) => CATTILE(r, d, c, w), d.cw);
  // flash events
  const es = SECTION(sh.main, 'Flash etkinlikler', d, { bg: 'bg/surface' });
  SHEAD(es, d, 'Sınırlı süre', 'Flash satış etkinlikleri', { link: 'Tüm etkinlikler', sub: SMALL(d) ? null : 'Üreticilerin kontenjanlı toptan kampanyaları. Süre bitince fiyatlar liste fiyatına döner.' });
  const ec = nCols(d, { phone: 1, phoneL: 2, tablet: 2, tabletL: 3, desktop: 3, wide: 3, ultra: 3 });
  ROWS(es, EVENTS.slice(0, ec === 1 ? 2 : ec), ec, d.gap, (r, e, k, w) => ECARD(r, d, e, w), d.cw);
  // AI RFQ band
  const rb = SECTION(sh.main, 'AI RFQ bandı', d, { bg: 'bg/inverse', dir: stacked ? 'column' : 'row', ai: stacked ? 'stretch' : 'center', gap: d.gap * 2 });
  const rl = B(rb, 'copy', { dir: 'column', gap: d.gap, W: stacked ? 'fill' : Math.round(d.cw * 0.42), H: 'hug' });
  BADGEI(rl, 'AI', 'Teklif asistanı', 'robot');
  TX(rl, d, 'Tek cümle yazın, yapay zekâ teklif talebinizi oluştursun.', 'h2', { c: 'text/inverse', fill: true });
  [['1', 'İhtiyacı yazın veya teknik çizimi yükleyin'], ['2', 'AI; miktar, sertifika ve teslimatı ayrıştırır'], ['3', '24 saatte doğrulanmış üreticilerden teklif']].forEach(([n, t]) => { const r = B(rl, 'adım ' + n, { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); const b = B(r, 'num', { dir: 'row', ai: 'center', jc: 'center', W: 32, H: 32, r: R.m, bg: 'bg/inverse-2' }); T(b, n, 'label/m', { c: 'text/inverse' }); TX(r, d, t, 'body', { c: 'text/inverse-muted', fill: true }); });
  BTNI(rl, d, 'Teklif talebi oluştur', 'Birincil', 'sparkle', { W: SMALL(d) ? 'fill' : undefined });
  if (!stacked) { const qr = B(rb, 'teklif önizleme', { dir: 'column', gap: 12, W: 'fill', H: 'hug' }); const q1 = INST(qr, 'QuoteRow/En iyi', { W: 'fill' }); const q2 = INST(qr, 'QuoteRow/Standart', { W: 'fill' }); SETT(q2, 'name', 'Uşak Örme San.'); SETT(q2, 'price', '₺126,50 / m'); SETT(q2, 'lead', '24 gün'); }
  // products
  const ps = SECTION(sh.main, 'Önerilenler', d);
  SHEAD(ps, d, 'Sizin için', 'Öne çıkan toptan ürünler', { link: 'Daha fazlası' });
  PGRID(ps, d, PRODS.slice(0, d.cols * (SMALL(d) ? 2 : 2)), d.cols);
  // suppliers
  const ss = SECTION(sh.main, 'Seçkin üreticiler', d, { bg: 'bg/surface' });
  SHEAD(ss, d, 'Doğrulanmış', 'Seçkin üreticiler', { link: 'Tedarikçi ara' });
  const sc2 = nCols(d, { phone: 1, phoneL: 2, tablet: 2, tabletL: 3, desktop: 3, wide: 4, ultra: 5 });
  ROWS(ss, [['Ege Tekstil A.Ş.', 'ET'], ['Anadolu Makina', 'AM'], ['Ayvalık Zeytincilik', 'AZ'], ['İnegöl Mobilya', 'İM'], ['Gebze Ambalaj', 'GA']].slice(0, sc2 === 1 ? 2 : sc2), sc2, d.gap, (r, [n, ini]) => { const i = INST(r, 'SupplierCard/M'); SETT(i, 'name', n); SETT(i, 'initials', ini); return i; }, d.cw);
  // enterprise
  const en = SECTION(sh.main, 'Kurumsal satın alma', d);
  SHEAD(en, d, 'Kurumsal', 'Satın alma ekibiniz için tasarlandı', { sub: 'Onay akışları, bütçe limitleri, e-Fatura ve ERP entegrasyonu tek hesapta.' });
  const fc = nCols(d, { phone: 1, phoneL: 2, tablet: 2, tabletL: 4, desktop: 4, wide: 4, ultra: 4 });
  ROWS(en, [['users-three', 'blue', 'Çoklu kullanıcı ve roller', 'Talep eden, onaylayan ve finans rolleri.'], ['list-checks', 'green', 'Onay akışları', 'Tutar ve kategoriye göre kural tabanlı onay.'], ['receipt', 'saffron', 'e-Fatura ve ERP', 'Siparişler muhasebeye otomatik aktarılır.'], ['chart-line-up', 'violet', 'Harcama analitiği', 'Tedarikçi, kategori ve dönem bazlı raporlar.']], fc, d.gap, (r, [ic, t, ti, ds]) => FEATURE(r, d, ic, t, ti, ds), d.cw);
  return END(sh, { tab: 'Keşfet' });
};

// ---------- 11 · Categories hub ----------
BUILD.categories = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Kategoriler', x, y);
    const g = B(sh.main, 'kategori ızgarası (D-pad)', { dir: 'column', gap: 24, p: [24, 96], W: 'fill', H: 'hug' });
    T(g, 'Kategoriler', 'tv/headline', { c: 'text/inverse' });
    ROWS(g, CATS.slice(0, 8), 4, 24, (r, [n, key, tint, cnt], k) => { const c = B(r, 'tile · ' + n, { dir: 'row', gap: 20, ai: 'center', p: 24, W: 'fill', H: 'hug', r: R.m, bg: k === 0 ? 'bg/surface' : 'bg/inverse-2' }); ICONTILE(c, CM()['Illu/' + key] ? ILLU[key] : 'package', tint, 72); const t = B(c, 't', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); T(t, n, 'tv/label', { c: k === 0 ? 'text/primary' : 'text/inverse', fill: true }); T(t, cnt.split(' · ')[0], 'tv/label', { c: k === 0 ? 'text/secondary' : 'text/inverse-muted', fill: true }); if (k === 0) { FOCUS(c, true); c.shadows = glow('#BCC9FF'); } return c; }, 1728);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Kategoriler', x, y, { tab: 'Kategori' });
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Kategoriler'], 'Tüm kategoriler', '10 sektör · 76.000+ ürün · 8.400+ doğrulanmış tedarikçi', { actions: (hr) => { if (WIDE(d)) INST(hr, 'Input#Varsayılan', { name: 'Kategori içinde ara' }); } });
  let host = sh.main, W = d.cw;
  if (WIDE(d)) {
    const s = SECTION(sh.main, 'içerik', d, { dir: 'row', ai: 'start', gap: d.gap * 1.5, pt: 8 });
    const nav = CARDBOX(s, 'Sektör menüsü (nav)', d, { W: 300, gap: 4, p: 12 });
    CATS.forEach(([n, key, tint], i) => { const r = B(nav, 'sektör · ' + n, { dir: 'row', gap: 10, ai: 'center', p: [0, 12], W: 'fill', H: 44, r: R.s, bg: i === 0 ? 'bg/brand-subtle' : undefined }); I(r, ILLU[key], { s: 20, style: i === 0 ? 'duotone' : 'regular', c: i === 0 ? 'text/brand' : 'text/secondary' }); TX(r, d, n, i === 0 ? 'label' : 'body', { c: i === 0 ? 'text/brand' : 'text/primary', fill: true }); });
    host = B(s, 'sektörler', { dir: 'column', gap: d.gap * 1.5, W: d.cw - 300 - d.gap * 1.5, H: 'hug' }); W = d.cw - 300 - d.gap * 1.5;
  } else { host = SECTION(sh.main, 'sektörler', d, { pt: 8, gap: d.gap }); }
  const secs = SMALL(d) ? 2 : 3;
  CATS.slice(0, secs).forEach(([n, key, tint, cnt], si) => {
    const box = CARDBOX(host, 'sektör · ' + n, d, { gap: d.gap });
    const h = B(box, 'başlık', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); ICONTILE(h, ILLU[key], tint, SMALL(d) ? 44 : 56);
    const tt = B(h, 't', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); TX(tt, d, n, 'h3', { fill: true }); TX(tt, d, cnt, 'body', { c: 'text/tertiary', fill: true });
    if (!SMALL(d)) { const a = B(h, 'link · Tümünü gör', { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 'hug' }); TX(a, d, 'Tümünü gör', 'label', { c: 'text/link' }); ICN(a, 'arrow-right', 20, 'text/link'); }
    const ch = B(box, 'alt kategoriler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true });
    (['Örme kumaş', 'Dokuma kumaş', 'Ev tekstili', 'İplik', 'Hazır giyim', 'Aksesuar'].map((s) => s)).slice(0, SMALL(d) ? 4 : 6).forEach((t, i) => SETT(INST(ch, `Chip#Filtre|${i === 0 && si === 0 ? 'Seçili' : 'Varsayılan'}`), 'label', t));
    const pc = SMALL(d) ? (d.w <= 320 ? 1 : 2) : Math.max(2, d.cols - (WIDE(d) ? 1 : 0));
    PGRID(box, d, PRODS.slice(si * 3, si * 3 + pc), pc, W - (SMALL(d) ? 32 : 48));
  });
  return END(sh, { tab: 'Kategori' });
};

// ---------- 12 · Search & listing ----------
function aiBar(parent, d) {
  const b = CARDBOX(parent, 'AI yorum çubuğu (aria-live=polite)', d, { dir: SMALL(d) ? 'column' : 'row', gap: 12, ai: SMALL(d) ? 'stretch' : 'center', bg: 'bg/ai-subtle', st: 'bg/ai-subtle', el: 'e0', p: 16 });
  const h = B(b, 'label', { dir: 'row', gap: 8, ai: 'center', W: 'hug', H: 'hug' }); ICN(h, 'sparkle', 20, 'text/ai'); TX(h, d, 'Anladığımız:', 'label', { c: 'text/ai' });
  const ch = B(b, 'yorum çipleri', { dir: 'row', gap: 8, W: SMALL(d) ? 'fill' : 'hug', H: 'hug', wrap: true });
  ['Organik penye', 'Denizli', '≥ 5.000 m', '≤ 30 gün', 'GOTS'].forEach((t) => { const c = INST(ch, 'Chip#Filtre|Seçili'); SETT(c, 'label', t); });
  if (!SMALL(d)) SP(b);
  const e = B(b, 'button · Sorguyu düzenle', { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 44 }); ICN(e, 'pencil-simple', 20, 'text/ai'); TX(e, d, 'Düzenle', 'label', { c: 'text/ai' });
  return b;
}
function filters(parent, d, W) {
  const f = CARDBOX(parent, 'Filtreler (aside, form)', d, { W, gap: 16, p: 20 });
  const grp = (t, fn) => { const g = B(f, 'fieldset · ' + t, { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); TX(g, d, t, 'label', { name: 'legend · ' + t }); fn(g); DIV(f); };
  grp('Tedarikçi', (g) => [['Doğrulanmış üretici', 1], ['Ticaret Güvencesi', 1], ['Yerinde denetimli', 0]].forEach(([t, on]) => SETT(INST(g, `Checkbox#${on ? 'Seçili' : 'Seçili değil'}|Varsayılan`), 'label', t)));
  grp('Min. sipariş (MOQ)', (g) => { const r = B(g, 'aralık', { dir: 'row', gap: 8, W: 'fill', H: 'hug' }); const fw = (W - 40 - 8) / 2; for (const [l, v] of [['En az', '0'], ['En çok', '5.000']]) { const i = INST(r, 'Input#Dolu', { W: fw }); SETT(i, 'label', l); SETT(i, 'value', v); HIDE(i, 'hint'); HIDE(i, 'help'); HIDE(i, 'icon'); } });
  grp('Şehir', (g) => [['Denizli', 1], ['Bursa', 0], ['İstanbul', 0], ['Uşak', 0]].forEach(([t, on]) => SETT(INST(g, `Checkbox#${on ? 'Seçili' : 'Seçili değil'}|Varsayılan`), 'label', t)));
  grp('Teslim süresi', (g) => { const r = B(g, 'çipler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); ['≤ 15 gün', '≤ 30 gün', '≤ 60 gün'].forEach((t, i) => SETT(INST(r, `Chip#Filtre|${i === 1 ? 'Seçili' : 'Varsayılan'}`), 'label', t)); });
  const sw = INST(f, 'Switch#Açık'); SETT(sw, 'label', 'Yalnızca stokta olanlar');
  BTNI(f, d, 'Filtreleri uygula', 'Birincil', null, { W: 'fill' });
  return f;
}
BUILD.search = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Arama & Liste', x, y);
    const top = B(sh.main, 'sorgu', { dir: 'column', gap: 16, p: [16, 96, 24, 96], W: 'fill', H: 'hug' });
    T(top, '“organik penye denizli” · 1.204 sonuç', 'tv/headline', { c: 'text/inverse', fill: true });
    const ch = B(top, 'filtreler (D-pad)', { dir: 'row', gap: 16, W: 'fill', H: 'hug' });
    ['Ticaret Güvencesi', 'Denizli', '≤ 30 gün', 'GOTS'].forEach((t, i) => { const c = B(ch, 'chip · ' + t, { dir: 'row', gap: 10, ai: 'center', p: [0, 24], H: 64, W: 'hug', r: R.m, bg: i === 0 ? 'bg/surface' : 'bg/inverse-2' }); T(c, t, 'tv/label', { c: i === 0 ? 'text/primary' : 'text/inverse' }); if (i === 0) FOCUS(c, true); });
    TV_ROW(sh.main, 'En iyi eşleşmeler', PRODS.slice(0, 5), -1);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Arama & Liste', x, y, { tab: 'Kategori' });
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Tekstil', 'Arama'], '“organik penye denizli”', '1.204 ürün · 86 tedarikçi · 0,21 sn');
  const s0 = SECTION(sh.main, 'AI yorumu', d, { pt: 8, pb: 0 }); aiBar(s0, d);
  if (!WIDE(d)) {
    const s = SECTION(sh.main, 'Araç çubuğu', d, { pt: 12, pb: 0, dir: 'row', gap: 12 });
    const bw = (d.cw - 12) / 2; BTNI(s, d, 'Filtreler (3)', 'İkincil', 'sliders-horizontal', { W: bw }); BTNI(s, d, 'Sırala', 'İkincil', 'sort-ascending', { W: bw });
    const rs = SECTION(sh.main, 'Sonuçlar', d, { pt: 12 }); PGRID(rs, d, PRODS.slice(0, d.cols * 3), d.cols);
  } else {
    const s = SECTION(sh.main, 'Filtre + sonuçlar', d, { dir: 'row', ai: 'start', gap: d.gap * 1.5, pt: 16 });
    const fw = d.fam === 'wide' ? 360 : d.fam === 'ultra' ? 440 : 300; filters(s, d, fw);
    const rw = d.cw - fw - d.gap * 1.5; const r = B(s, 'Sonuçlar', { dir: 'column', gap: d.gap, W: rw, H: 'hug' });
    const tb = B(r, 'toolbar', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); TX(tb, d, '1–24 / 1.204 sonuç', 'body', { c: 'text/secondary' }); SP(tb);
    const sel = INST(tb, 'Select#Dolu', { W: 240 }); SETT(sel, 'label', 'Sırala'); SETT(sel, 'value', 'En iyi eşleşme'); HIDE(sel, 'hint'); HIDE(sel, 'help');
    const cols = d.cols - 1; PGRID(r, d, PRODS.slice(0, cols * 3), cols, rw);
    const tray = INST(r, 'CompareTray (sabit, role=region)', { W: 'fill', name: 'Karşılaştırma tepsisi (sabit)' });
  }
  const pg = SECTION(sh.main, 'Sayfalama', d, { ai: 'center', pt: 8, gap: 8 });
  BTNI(pg, d, 'Daha fazla yükle', 'İkincil', 'arrow-right', { W: SMALL(d) ? 'fill' : undefined }); TX(pg, d, '36 / 1.204 ürün gösteriliyor', 'body', { c: 'text/tertiary' });
  return END(sh, { tab: 'Kategori' });
};

// ---------- 13 · PDP ----------
function landed(parent, d) {
  const c = CARDBOX(parent, 'Varış maliyeti hesaplayıcı', d, { gap: 12, bg: 'bg/subtle', el: 'e0' });
  const h = B(c, 'başlık', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); ICN(h, 'calculator', 20, 'text/brand'); TX(h, d, 'Varış maliyeti · İzmir, 2.000 m', 'label', { fill: true }); BADGEI(h, 'Marka', 'EXW → DAP', 'truck');
  [['Ürün (2.000 m × ₺129)', '₺258.000'], ['Lojistik (Denizli → İzmir)', '₺6.400'], ['Sigorta', '₺520'], ['Ticaret Güvencesi', 'Ücretsiz']].forEach(([k, v]) => { const r = B(c, 'satır · ' + k, { dir: 'row', gap: 12, W: 'fill', H: 'hug' }); TX(r, d, k, 'body', { c: 'text/secondary', fill: true }); TX(r, d, v, 'label'); });
  DIV(c); const t = B(c, 'toplam', { dir: 'row', gap: 12, ai: 'end', W: 'fill', H: 'hug' }); TX(t, d, 'Toplam · birim başına ₺132,46', 'label', { fill: true }); TX(t, d, '₺264.920', 'price');
  return c;
}
BUILD.pdp = async (d, x, y) => {
  const P0 = PRODS[0];
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Ürün Detayı', x, y);
    TV_SPLIT(sh, (L) => { const m = B(L, 'media', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: 560, r: R.m, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#EEF2FF', opacity: 1, offset: 0 }, { color: '#D6DEFF', opacity: 1, offset: 1 }] } }); I(m, 't-shirt', { s: 240, style: 'duotone', c: 'text/brand' }); }, (R2) => {
      BADGEI(R2, 'Başarı', 'Ege Tekstil · Doğrulanmış', 'seal-check'); T(R2, P0.n, 'tv/headline', { c: 'text/inverse', fill: true }); T(R2, '₺118 – ₺142,50 / metre', 'tv/title', { c: 'text/inverse' }); T(R2, 'Min. 500 metre · 3 fiyat kademesi · 12–15 gün', 'tv/body', { c: 'text/inverse-muted', fill: true });
      TV_FOCUSBTN(R2, 'Telefona gönder ve teklif iste', 'paper-plane-right'); BTNI(R2, d, 'Favorilere ekle', 'İkincil', 'heart');
    });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Ürün Detayı', x, y);
  if (!SMALL(d)) { const b = SECTION(sh.main, 'Breadcrumb', d, { pt: 16, pb: 0 }); const bc = B(b, 'Breadcrumb (nav)', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); ['Ana sayfa', 'Tekstil', 'Örme kumaş', 'Organik penye'].forEach((c, i) => { if (i) ICN(bc, 'caret-right', 16, 'text/tertiary'); TX(bc, d, c, 'body', { c: i === 3 ? 'text/primary' : 'text/link', u: i < 3 }); }); }
  const gw = WIDE(d) ? Math.round(d.cw * 0.52) : d.cw;
  const top = SECTION(sh.main, 'Ürün üst bölüm', d, { dir: WIDE(d) ? 'row' : 'column', ai: 'start', gap: d.gap * 1.5, pt: SMALL(d) ? 8 : 16 });
  const G = B(top, 'Galeri', { dir: 'column', gap: 12, W: gw, H: 'hug' });
  const mm = B(G, 'media · ana görsel', { dir: 'column', ai: 'center', jc: 'center', W: 'fill', H: Math.round(gw * (WIDE(d) ? 0.78 : 0.8)), r: R.m, grad: { type: 'linear', startX: 0.1, startY: 0, endX: 0.9, endY: 1, width: 1, stops: [{ color: '#EEF2FF', opacity: 1, offset: 0 }, { color: '#D6DEFF', opacity: 1, offset: 1 }] }, el: 'e1' });
  I(mm, 't-shirt', { s: Math.round(gw * 0.3), style: 'duotone', c: 'text/brand' });
  const bd = BADGEI(mm, 'Hata', 'Flash −%18 · 23 sa 14 dk', 'lightning'); bd.layoutChild.absolute = true; penpotUtils.setParentXY(bd, 12, 12);
  const th = B(G, 'küçük görseller (tablist)', { dir: 'row', gap: 8, W: 'fill', H: 'hug' }); const tw = (gw - 32) / 5;
  ['t-shirt', 'eye', 'certificate', 'factory', 'truck'].forEach((ic, i) => { const t = B(th, 'thumb', { dir: 'row', ai: 'center', jc: 'center', W: tw, H: tw, r: R.s, bg: i === 0 ? 'bg/brand-subtle' : 'bg/surface', st: i === 0 ? 'border/brand' : 'border/subtle', sw: i === 0 ? 2 : 1 }); I(t, ic, { s: Math.round(tw * 0.4), style: 'duotone', c: 'text/brand' }); });
  const iw = WIDE(d) ? d.cw - gw - d.gap * 1.5 : d.cw;
  const Info = B(top, 'Ürün bilgisi', { dir: 'column', gap: d.gap, W: iw, H: 'hug' });
  const sup = B(Info, 'tedarikçi', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true }); TX(sup, d, 'Ege Tekstil A.Ş.', 'label', { c: 'text/link', u: true }); BADGEI(sup, 'Başarı', 'Doğrulanmış', 'seal-check'); BADGEI(sup, 'AI', 'Uyum %92', 'sparkle');
  TX(Info, d, P0.n + ', GOTS sertifikalı', 'h2', { fill: true, name: 'h1' });
  INST(Info, 'Rating');
  const pt = INST(Info, 'PriceTiers (table)', { W: 'fill' });
  const vr = B(Info, 'fieldset · Renk', { dir: 'column', gap: 8, W: 'fill', H: 'hug' }); TX(vr, d, 'Renk: Ekru', 'label'); const vc = B(vr, 'renkler (radiogroup)', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); ['Ekru', 'Antrasit', 'Lacivert', 'Bordo'].forEach((c, i) => SETT(INST(vc, `Chip#Filtre|${i === 0 ? 'Seçili' : 'Varsayılan'}`), 'label', c));
  const q = B(Info, 'miktar', { dir: 'row', gap: 16, ai: 'end', W: 'fill', H: 'hug', wrap: true }); const ql = B(q, 'q', { dir: 'column', gap: 6, W: 'hug', H: 'hug' }); TX(ql, d, 'Miktar (metre)', 'label'); INST(ql, 'Stepper'); const st = B(q, 'ara toplam (aria-live)', { dir: 'column', W: 'hug', H: 'hug' }); TX(st, d, 'Ara toplam', 'body', { c: 'text/tertiary' }); TX(st, d, '₺258.000', 'price');
  if (!SMALL(d)) { const a = B(Info, 'eylemler', { dir: 'row', gap: 12, W: 'fill', H: 'hug', wrap: true }); BTNI(a, d, 'Sepete ekle', 'Birincil', 'shopping-cart-simple'); BTNI(a, d, 'Numune iste', 'İkincil', 'package'); BTNI(a, d, 'Teklif iste', 'Üçüncül', 'file-text'); }
  landed(Info, d);
  const ta = CARDBOX(Info, 'Ticaret Güvencesi', d, { dir: 'row', gap: 12, ai: 'start', bg: 'bg/success-subtle', st: 'bg/success-subtle', el: 'e0', p: 16 }); ICN(ta, 'shield-check', 24, 'text/success'); const tt = B(ta, 't', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); TX(tt, d, 'Ticaret Güvencesi ile korunur', 'label', { fill: true }); TX(tt, d, 'Ödeme teslim onayına kadar emanette; gecikme ve kalite sorunlarında iade.', 'body', { c: 'text/secondary', fill: true });
  const sp = SECTION(sh.main, 'Ayrıntılar', d, { bg: 'bg/surface' });
  const tabs = B(sp, 'sekmeler (tablist)', { dir: 'row', gap: 24, W: 'fill', H: 'hug', clip: true }); ['Özellikler', 'Sertifikalar (3)', 'Değerlendirmeler (312)', 'Soru-cevap (48)'].forEach((t, i) => { const b = B(tabs, 'tab · ' + t, { dir: 'column', gap: 8, W: 'hug', H: 'hug' }); TX(b, d, t, 'label', { c: i === 0 ? 'text/brand' : 'text/secondary' }); B(b, 'indicator', { W: 'fill', H: 3, r: 2, bg: i === 0 ? 'action/primary' : undefined }); });
  const kv = B(sp, 'özellik tablosu (table)', { dir: 'column', W: 'fill', H: 'hug', r: R.m, st: 'border/subtle', clip: true });
  [['Kompozisyon', '%100 organik pamuk'], ['Gramaj', '180 g/m² (±%5)'], ['En', '180 cm, açık en'], ['Sertifikalar', 'GOTS, OEKO-TEX Standard 100'], ['Menşe', 'Denizli, Türkiye'], ['Üretim süresi', '2.000 m için 12–15 iş günü']].forEach(([k, v], i) => { const r = B(kv, 'row · ' + k, { dir: d.w < 400 ? 'column' : 'row', gap: 4, p: [12, 16], W: 'fill', H: 'hug', bg: i % 2 ? 'bg/surface' : 'bg/subtle' }); const kk = TX(r, d, k, 'label', { name: 'th' }); if (d.w >= 400) { kk.resize(220, kk.height); kk.growType = 'auto-height'; } TX(r, d, v, 'body', { fill: true, name: 'td' }); });
  const sim = SECTION(sh.main, 'Benzer ürünler', d); SHEAD(sim, d, 'Benzer', 'Bunlar da ilginizi çekebilir', { link: 'Tümü' }); PGRID(sim, d, PRODS.slice(4, 4 + d.cols), d.cols);
  return END(sh, { tab: 'Keşfet', sticky: (f) => { const bar = B(f, 'Sabit eylem çubuğu (ürün)', { dir: 'row', gap: 12, ai: 'center', p: [12, 16, 16, 16], W: d.w, H: 'hug', bg: 'bg/surface', st: 'border/subtle' }); bar.shadows = [{ style: 'drop-shadow', offsetX: 0, offsetY: -4, blur: 16, spread: -4, hidden: false, color: { color: '#101828', opacity: 0.1 } }]; const p = B(bar, 'fiyat', { dir: 'column', W: 'hug', H: 'hug' }); T(p, '₺258.000', 'price/m'); T(p, '2.000 m', 'body/m', { c: 'text/tertiary' }); SP(bar); BTNI(bar, d, 'Sepete ekle', 'Birincil', 'shopping-cart-simple'); return bar; } });
};

// ---------- 14 · Compare ----------
BUILD.compare = async (d, x, y) => {
  const items = [PRODS[0], { ...PRODS[0], s: 'Uşak Örme · Uşak', p: '₺126 – ₺149', a: 'Uyum %88', t: 'violet' }, { ...PRODS[0], s: 'Bursa Kumaş · Bursa', p: '₺115 – ₺139', a: 'Uyum %84', t: 'teal' }];
  const rows = [['Birim fiyat (2.000 m)', ['₺129,00', '₺136,00', '₺124,50']], ['Min. sipariş', ['500 m', '1.000 m', '2.000 m']], ['Üretim süresi', ['12–15 gün', '18 gün', '25 gün']], ['Sertifika', ['GOTS, OEKO-TEX', 'OEKO-TEX', 'GOTS']], ['Numune', ['₺450', 'Ücretsiz', '₺600']], ['Zamanında teslim', ['%98,6', '%95,1', '%91,4']], ['AI uyum', ['%92', '%88', '%84']]];
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Ürün Karşılaştırma', x, y);
    const t = B(sh.main, 'karşılaştırma', { dir: 'column', gap: 16, p: [16, 96], W: 'fill', H: 'hug' }); T(t, '3 ürünü karşılaştırın', 'tv/headline', { c: 'text/inverse' });
    rows.slice(0, 5).forEach(([k, vs], ri) => { const r = B(t, 'row · ' + k, { dir: 'row', gap: 24, ai: 'center', p: [12, 24], W: 'fill', H: 'hug', r: R.m, bg: ri === 0 ? 'bg/inverse-2' : undefined }); T(r, k, 'tv/label', { c: 'text/inverse-muted', W: 420 }); vs.forEach((v, i) => { const c = B(r, 'cell', { dir: 'row', W: 380, H: 'hug' }); T(c, v, 'tv/title', { c: i === 2 && ri === 0 ? 'focus/ring-on-dark' : 'text/inverse' }); }); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Ürün Karşılaştırma', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Karşılaştırma'], 'Ürün karşılaştırma', '3 ürün · en iyi değer AI tarafından işaretlendi', { actions: (hr) => { if (!SMALL(d)) BTNI(hr, d, 'PDF olarak indir', 'İkincil', 'download-simple'); } });
  const s = SECTION(sh.main, 'Karşılaştırma tablosu', d, { pt: 8 });
  if (SMALL(d) || d.fam === 'tablet') {
    items.forEach((p, i) => { const c = CARDBOX(s, 'ürün · ' + p.s, d, { gap: 12, st: i === 2 ? 'border/brand' : 'border/subtle' }); const h = B(c, 'başlık', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); ICONTILE(h, 't-shirt', p.t, 48); const tt = B(h, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(tt, d, p.s, 'label', { fill: true }); TX(tt, d, p.p + ' / m', 'body', { c: 'text/secondary', fill: true }); if (i === 2) BADGEI(c, 'AI', 'En iyi değer', 'sparkle'); rows.slice(0, 5).forEach(([k, vs]) => { const r = B(c, 'satır · ' + k, { dir: 'row', gap: 8, W: 'fill', H: 'hug' }); TX(r, d, k, 'body', { c: 'text/tertiary', fill: true }); TX(r, d, vs[i], 'label'); }); });
  } else {
    const t = CARDBOX(s, 'tablo (table)', d, { gap: 0, p: 0 });
    const kw = Math.round(d.cw * 0.22), cw2 = (d.cw - kw) / 3;
    const hr = B(t, 'thead', { dir: 'row', W: 'fill', H: 'hug', st: 'border/subtle' }); B(hr, 'boş', { W: kw, H: 1 });
    items.forEach((p, i) => { const c = B(hr, 'th · ' + p.s, { dir: 'column', gap: 10, p: 20, W: cw2, H: 'hug', bg: i === 2 ? 'bg/brand-subtle' : undefined }); ICONTILE(c, 't-shirt', p.t, 56); TX(c, d, p.s, 'label', { fill: true }); TX(c, d, p.p + ' / m', 'price'); if (i === 2) BADGEI(c, 'AI', 'En iyi değer', 'sparkle'); BTNI(c, d, 'Sepete ekle', i === 2 ? 'Birincil' : 'İkincil', 'shopping-cart-simple'); });
    rows.forEach(([k, vs], ri) => { const r = B(t, 'tr · ' + k, { dir: 'row', W: 'fill', H: 'hug', bg: ri % 2 ? 'bg/surface' : 'bg/subtle' }); const kc = B(r, 'th', { dir: 'row', p: [14, 20], W: kw, H: 'hug' }); TX(kc, d, k, 'label', { fill: true }); vs.forEach((v, i) => { const c = B(r, 'td', { dir: 'row', gap: 6, ai: 'center', p: [14, 20], W: cw2, H: 'hug', bg: i === 2 ? 'bg/brand-subtle' : undefined }); if (ri === 0 && i === 2) ICN(c, 'trend-up', 16, 'text/success'); TX(c, d, v, 'body', { fill: true }); }); });
  }
  return END(sh, { tab: 'Keşfet' });
};

// ---------- 15 · Supplier search ----------
function trMap(parent, d, W, H) {
  const m = B(parent, 'Harita · tedarikçi yoğunluğu (alternatif: liste)', { dir: 'none', W, H, r: R.m, bg: 'bg/brand-subtle', clip: true });
  const land = B(m, 'Türkiye silüeti (dekoratif)', { dir: 'none', W: W * 0.86, H: H * 0.42, r: R.m, bg: 'bg/surface' }); penpotUtils.setParentXY(land, W * 0.07, H * 0.3);
  [[0.18, 0.5, 64, 'İzmir 312'], [0.28, 0.62, 48, 'Denizli 204'], [0.36, 0.36, 72, 'İstanbul 980'], [0.33, 0.44, 40, 'Bursa 186'], [0.5, 0.52, 32, 'Konya 96'], [0.72, 0.62, 36, 'Gaziantep 120'], [0.62, 0.32, 28, 'Trabzon 44']].forEach(([px, py, s, l]) => {
    const p = B(m, 'küme · ' + l, { dir: 'row', ai: 'center', jc: 'center', W: s, H: s, r: 12, bg: 'action/primary', el: 'e3' }); T(p, l.split(' ')[1], 'label/m', { c: 'text/on-brand' }); penpotUtils.setParentXY(p, W * px, H * py);
  });
  return m;
}
BUILD.suppliers = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Tedarikçi Arama', x, y);
    TV_SPLIT(sh, (L) => { T(L, 'Tekstilde doğrulanmış 1.320 üretici', 'tv/headline', { c: 'text/inverse', fill: true }); trMap(L, d, 980, 560); }, (R2) => { ['Ege Tekstil A.Ş.', 'Uşak Örme San.', 'Bursa Kumaş'].forEach((n, i) => { const c = B(R2, 'tedarikçi · ' + n, { dir: 'row', gap: 20, ai: 'center', p: 20, W: 'fill', H: 'hug', r: R.m, bg: i === 0 ? 'bg/surface' : 'bg/inverse-2' }); ICONTILE(c, 'factory', 'blue', 64); const t = B(c, 't', { dir: 'column', W: 'fill', H: 'hug' }); T(t, n, 'tv/label', { c: i === 0 ? 'text/primary' : 'text/inverse', fill: true }); T(t, 'Uyum %9' + (4 - i), 'tv/label', { c: i === 0 ? 'text/ai' : 'focus/ring-on-dark' }); if (i === 0) FOCUS(c, true); }); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Tedarikçi Arama', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Tedarikçiler'], 'Tedarikçi arama', '1.320 doğrulanmış tekstil üreticisi · kapasite ve sertifikaya göre');
  const s0 = SECTION(sh.main, 'AI yorumu', d, { pt: 8, pb: 0 }); aiBar(s0, d);
  if (WIDE(d)) {
    const s = SECTION(sh.main, 'Liste + harita', d, { dir: 'row', ai: 'start', gap: d.gap * 1.5, pt: 16 });
    const lw = Math.round(d.cw * 0.58); const L = B(s, 'liste', { dir: 'column', gap: d.gap, W: lw, H: 'hug' });
    const cc = d.fam === 'ultra' ? 3 : 2;
    ROWS(L, [['Ege Tekstil A.Ş.', 'ET'], ['Uşak Örme San.', 'UÖ'], ['Bursa Kumaş', 'BK'], ['Denizli Dokuma', 'DD'], ['İzmir İplik', 'İİ'], ['Kahramanmaraş Tekstil', 'KT']].slice(0, cc * 2), cc, d.gap, (r, [n, ini]) => { const i = INST(r, 'SupplierCard/M'); SETT(i, 'name', n); SETT(i, 'initials', ini); return i; }, lw);
    trMap(s, d, d.cw - lw - d.gap * 1.5, Math.round((d.cw - lw) * 1.1));
  } else {
    const s = SECTION(sh.main, 'Liste', d, { pt: 12 });
    const cc = d.fam === 'tablet' || (d.fam === 'phoneL' && d.w > 600) ? 2 : 1;
    ROWS(s, [['Ege Tekstil A.Ş.', 'ET'], ['Uşak Örme San.', 'UÖ'], ['Bursa Kumaş', 'BK'], ['Denizli Dokuma', 'DD']].slice(0, cc * 2), cc, d.gap, (r, [n, ini]) => { const i = INST(r, 'SupplierCard/S'); SETT(i, 'name', n); SETT(i, 'initials', ini); return i; }, d.cw);
  }
  return END(sh, { tab: 'Keşfet' });
};

// ---------- 16 · Store ----------
BUILD.store = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Tedarikçi Mağazası', x, y);
    const top = B(sh.main, 'kimlik', { dir: 'row', gap: 32, ai: 'center', p: [16, 96, 24, 96], W: 'fill', H: 'hug' });
    const lg = B(top, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 112, H: 112, r: R.m, grad: GRAD_BRAND }); T(lg, 'ET', 'tv/headline', { c: 'text/on-brand' });
    const t = B(top, 'ad', { dir: 'column', gap: 8, W: 'fill', H: 'hug' }); T(t, 'Ege Tekstil A.Ş.', 'tv/headline', { c: 'text/inverse' }); T(t, 'Doğrulanmış üretici · Denizli · 12 yıl · Yanıt ≤ 4 saat', 'tv/body', { c: 'text/inverse-muted', fill: true });
    TV_FOCUSBTN(top, 'Takip et', 'plus');
    TV_ROW(sh.main, 'Mağazanın çok satanları', PRODS.slice(0, 5), -1);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Tedarikçi Mağazası', x, y);
  const cov = SECTION(sh.main, 'Mağaza kapağı', d, { grad: GRAD_BRAND, dir: SMALL(d) ? 'column' : 'row', ai: SMALL(d) ? 'start' : 'center', gap: d.gap, pt: d.gap * 2, pb: d.gap * 2 });
  const lg = B(cov, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: SMALL(d) ? 64 : 96, H: SMALL(d) ? 64 : 96, r: R.m, bg: 'bg/surface', el: 'e3' }); TX(lg, d, 'ET', 'h2', { c: 'text/brand' });
  const nm = B(cov, 'kimlik', { dir: 'column', gap: 8, W: SMALL(d) ? 'fill' : Math.round(d.cw * 0.5), H: 'hug' }); TX(nm, d, 'Ege Tekstil A.Ş.', 'hero', { c: 'text/on-brand', fill: true, name: 'h1' }); TX(nm, d, 'Organik örme kumaş üreticisi · Denizli · 1998’den beri', 'lead', { c: 'bg/brand-subtle-2', fill: true });
  const bd = B(nm, 'rozetler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); BADGEI(bd, 'Başarı', 'Doğrulanmış', 'seal-check'); BADGEI(bd, 'Marka', 'GOTS', 'certificate'); BADGEI(bd, 'Marka', 'ISO 9001', 'certificate');
  if (!SMALL(d)) SP(cov);
  const act = B(cov, 'eylemler', { dir: 'row', gap: 12, W: 'hug', H: 'hug', wrap: true }); BTNI(act, d, 'Mesaj gönder', 'İkincil', 'chat-circle-dots'); BTNI(act, d, 'Teklif iste', 'Birincil', 'file-text');
  const st = SECTION(sh.main, 'Performans', d, { pt: d.gap * 1.5, pb: 0 });
  const sc = SMALL(d) ? 2 : 4;
  ROWS(st, [['receipt', 'blue', '≤ 4 saat', 'Ortalama yanıt'], ['truck', 'green', '%98,6', 'Zamanında teslim'], ['chart-line-up', 'violet', '$10–25 M', 'Yıllık ihracat'], ['users-three', 'saffron', '250+', 'Çalışan']], sc, d.gap, (r, [ic, tn, v, l]) => { const c = CARDBOX(r, 'stat · ' + l, d, { dir: 'row', gap: 12, ai: 'center', p: 16 }); ICONTILE(c, ic, tn, 44); const t = B(c, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(t, d, v, 'h3', { fill: true }); TX(t, d, l, 'body', { c: 'text/tertiary', fill: true }); return c; }, d.cw);
  const au = SECTION(sh.main, 'Doğrulama geçmişi', d, { dir: WIDE(d) ? 'row' : 'column', ai: 'start', gap: d.gap * 1.5 });
  const tl = CARDBOX(au, 'Doğrulama zaman çizelgesi', d, { W: WIDE(d) ? Math.round(d.cw * 0.36) : 'fill', gap: 0 }); TX(tl, d, 'Doğrulama geçmişi', 'h3').layoutChild.bottomMargin = 12;
  [['Tamamlandı', 'Yerinde denetim · SGS', 'Mar 2026'], ['Tamamlandı', 'GOTS sertifikası yenilendi', 'Oca 2026'], ['Şimdi', 'Kapasite doğrulaması sürüyor', 'Eki 2026']].forEach(([s, t, m]) => { const i = INST(tl, `TimelineStep/${s}`, { W: 'fill' }); SETT(i, 'title', t); SETT(i, 'meta', m); });
  const pr = B(au, 'ürünler', { dir: 'column', gap: d.gap, W: WIDE(d) ? d.cw - Math.round(d.cw * 0.36) - d.gap * 1.5 : 'fill', H: 'hug' }); SHEAD(pr, d, 'Mağaza', 'Çok satan ürünler', { link: 'Tüm ürünler (148)' });
  const pc = WIDE(d) ? Math.max(2, d.cols - 2) : d.cols; PGRID(pr, d, PRODS.slice(0, pc * 2), pc, WIDE(d) ? d.cw - Math.round(d.cw * 0.36) - d.gap * 1.5 : d.cw);
  return END(sh, { tab: 'Keşfet' });
};

// ---------- 17 · Flash ----------
BUILD.flash = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Flash Fırsatlar', x, y);
    TV_SPLIT(sh, (L) => { BADGEI(L, 'Hata', 'Flash · 48 saat', 'lightning'); T(L, 'Ege’nin Pamuk Atölyeleri', 'tv/display', { c: 'text/inverse', fill: true }); const cd = B(L, 'geri sayım', { dir: 'row', gap: 16, W: 'hug', H: 'hug' }); [['23', 'saat'], ['14', 'dakika']].forEach(([v, l]) => { const b = B(cd, 'birim', { dir: 'column', ai: 'center', p: [16, 24], W: 'hug', H: 'hug', r: R.m, bg: 'bg/inverse-2' }); T(b, v, 'tv/headline', { c: 'text/inverse' }); T(b, l, 'tv/label', { c: 'text/inverse-muted' }); }); }, (R2) => { const g = B(R2, 'illu', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: 300, r: R.m, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#FFF6E5', opacity: 1, offset: 0 }, { color: '#FFE3B0', opacity: 1, offset: 1 }] } }); I(g, 't-shirt', { s: 160, style: 'duotone', c: 'text/warning' }); });
    TV_ROW(sh.main, 'Etkinlikteki ürünler', PRODS.slice(0, 5), 1);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Flash Fırsatlar', x, y);
  const hs = SECTION(sh.main, 'Etkinlik hero', d, { bg: 'bg/inverse', dir: WIDE(d) ? 'row' : 'column', ai: WIDE(d) ? 'center' : 'stretch', gap: d.gap * 2, pt: d.gap * 2.5, pb: d.gap * 2.5 });
  const tx = B(hs, 'metin', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.round(d.cw * 0.5) : 'fill', H: 'hug' });
  BADGEI(tx, 'Hata', 'Flash · 48 saatlik seçki', 'lightning');
  TX(tx, d, 'Ege’nin Pamuk Atölyeleri', 'hero', { c: 'text/inverse', fill: true, name: 'h1' });
  TX(tx, d, 'Denizli ve Uşak’tan organik penye, havlu ve nevresim kumaşları; %18’e varan kontenjanlı toptan indirim.', 'lead', { c: 'text/inverse-muted', fill: true });
  const cd = B(tx, 'Geri sayım (dakikada bir güncellenir · aria-live=off)', { dir: 'row', gap: 12, W: 'hug', H: 'hug' }); [['23', 'saat'], ['14', 'dakika'], ['64%', 'kontenjan']].forEach(([v, l]) => { const b = B(cd, 'birim · ' + l, { dir: 'column', ai: 'center', p: [12, 16], W: 'hug', H: 'hug', r: R.m, bg: 'bg/inverse-2' }); TX(b, d, v, 'h2', { c: 'text/inverse' }); TX(b, d, l, 'body', { c: 'text/inverse-muted' }); });
  BTNI(tx, d, 'Etkinliğe göz at', 'Birincil', 'arrow-right', { W: SMALL(d) ? 'fill' : undefined });
  const ill = B(hs, 'görsel', { dir: 'row', ai: 'center', jc: 'center', W: WIDE(d) ? 'fill' : 'fill', H: WIDE(d) ? Math.round(d.cw * 0.28) : Math.round(d.cw * 0.5), r: R.m, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#FFF6E5', opacity: 1, offset: 0 }, { color: '#FFE3B0', opacity: 1, offset: 1 }] } }); I(ill, 't-shirt', { s: Math.round((WIDE(d) ? d.cw * 0.28 : d.cw * 0.5) * 0.45), style: 'duotone', c: 'text/warning' });
  const tb = SECTION(sh.main, 'Sekmeler', d, { pt: d.gap, pb: 0 }); const tr = B(tb, 'tablist', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); ['Şu an yayında (6)', 'Yakında (4)', 'Son şans (2)'].forEach((t, i) => SETT(INST(tr, `Chip#Filtre|${i === 0 ? 'Seçili' : 'Varsayılan'}`), 'label', t));
  const es = SECTION(sh.main, 'Etkinlikler', d, { pt: d.gap });
  const ec = nCols(d, { phone: 1, phoneL: 2, tablet: 2, tabletL: 3, desktop: 3, wide: 3, ultra: 3 }); ROWS(es, EVENTS.slice(0, ec * 2), ec, d.gap, (r, e, k, w) => ECARD(r, d, e, w), d.cw);
  const ds = SECTION(sh.main, 'Fırsat ürünleri', d, { bg: 'bg/surface' }); SHEAD(ds, d, 'Kontenjanlı', 'Etkinlikteki ürünler', { link: 'Tümü' }); PGRID(ds, d, PRODS.filter((p) => p.b).concat(PRODS).slice(0, d.cols * 2), d.cols);
  return END(sh, { tab: 'Keşfet' });
};
