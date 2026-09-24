// Arasta v2 · devices, page shell, shared sections — runs inside Penpot via MCP
const FAMS = {
  phone:   { g: 16, gap: 12, tgt: 44, card: 'S', ty: { hero: 'headline/l', h2: 'headline/s', h3: 'title/m', body: 'body/m', lead: 'body/m', label: 'label/m', price: 'price/m' } },
  phoneL:  { g: 24, gap: 12, tgt: 44, card: 'S', rail: 96, ty: { hero: 'headline/m', h2: 'headline/s', h3: 'title/m', body: 'body/m', lead: 'body/m', label: 'label/m', price: 'price/m' } },
  tablet:  { g: 32, gap: 16, tgt: 44, card: 'M', ty: { hero: 'display/m', h2: 'headline/m', h3: 'title/l', body: 'body/m', lead: 'body/l', label: 'label/m', price: 'price/m' } },
  tabletL: { g: 32, gap: 16, tgt: 44, card: 'M', ty: { hero: 'display/m', h2: 'headline/m', h3: 'title/l', body: 'body/m', lead: 'body/l', label: 'label/m', price: 'price/m' } },
  desktop: { g: 40, gap: 24, tgt: 44, card: 'M', max: 1760, ty: { hero: 'display/l', h2: 'headline/l', h3: 'headline/s', body: 'body/m', lead: 'body/l', label: 'label/m', price: 'price/l' } },
  wide:    { g: 64, gap: 32, tgt: 48, card: 'L', max: 2240, ty: { hero: 'display/xl', h2: 'display/m', h3: 'headline/m', body: 'body/l', lead: 'body/xl', label: 'label/l', price: 'price/l' } },
  ultra:   { g: 96, gap: 40, tgt: 56, card: 'XL', max: 3200, ty: { hero: 'display/2xl', h2: 'display/l', h3: 'headline/l', body: 'body/xl', lead: 'body/xl', label: 'label/xl', price: 'price/l' } },
  tv:      { g: 96, gap: 32, tgt: 64, card: 'tv', dark: true, ty: { hero: 'tv/display', h2: 'tv/headline', h3: 'tv/title', body: 'tv/body', lead: 'tv/body', label: 'tv/label', price: 'tv/title' } },
};
const DEVL = [
  ['P320', 'phone', 320, 480, 1, 'iPhone 4 · 320×480 (= 1280px @%400 zoom reflow)'], ['P360', 'phone', 360, 740, 2, 'Küçük telefon · 360×740'], ['P390', 'phone', 390, 844, 2, 'Orta telefon · 390×844'], ['P430', 'phone', 430, 932, 2, 'Büyük telefon · 430×932'],
  ['L480', 'phoneL', 480, 320, 2, 'Küçük telefon yatay · 480×320'], ['L844', 'phoneL', 844, 390, 3, 'Orta telefon yatay · 844×390'], ['L932', 'phoneL', 932, 430, 4, 'Büyük telefon yatay · 932×430'],
  ['T600', 'tablet', 600, 960, 2, 'Küçük tablet dikey · 600×960'], ['T768', 'tablet', 768, 1024, 2, 'Orta tablet dikey · 768×1024'], ['T1024P', 'tablet', 1024, 1366, 3, 'Büyük tablet dikey · 1024×1366'],
  ['T960', 'tabletL', 960, 600, 3, 'Küçük tablet yatay · 960×600'], ['T1024L', 'tabletL', 1024, 768, 3, 'Orta tablet yatay · 1024×768'], ['T1366', 'tabletL', 1366, 1024, 4, 'Büyük tablet yatay · 1366×1024'],
  ['K1280', 'desktop', 1280, 800, 4, 'Küçük laptop · 1280×800'], ['K1440', 'desktop', 1440, 900, 5, 'Orta laptop · 1440×900'], ['K1728', 'desktop', 1728, 1117, 5, 'Büyük laptop · 1728×1117'], ['D1920', 'desktop', 1920, 1080, 6, 'Desktop · 1920×1080'],
  ['W2560', 'wide', 2560, 1440, 6, '27" 5K · 2560×1440 @2x'], ['TV', 'tv', 1920, 1080, 4, '4K TV · 1920×1080 @2x · 10-foot'], ['U8K', 'ultra', 3840, 2160, 7, '8K · 3840×2160 @2x'],
];
const DEVS = DEVL.map(([id, fam, w, h, cols, label]) => { const f = FAMS[fam]; const rail = f.rail || 0; const cw = Math.min(w - rail - 2 * f.g, f.max || 1e9); return { id, fam, w, h, cols, label, ...f, rail, cw, px: (w - rail - cw) / 2 }; });
const DEV = (id) => DEVS.find((d) => d.id === id);
const WIDE = (d) => ['tabletL', 'desktop', 'wide', 'ultra'].includes(d.fam);
const SMALL = (d) => ['phone', 'phoneL'].includes(d.fam);
const colW = (d, n, W, gap) => ((W ?? d.cw) - (gap ?? d.gap) * (n - 1)) / n;
const HDRK = { phone: 'Header/phone', tablet: 'Header/tablet', tabletL: 'Header/tablet-landscape', desktop: 'Header/desktop', wide: 'Header/wide-5k', ultra: 'Header/ultra-8k', tv: 'Header/tv-10ft' };
const FOOTK = { phone: 'Footer/compact', phoneL: 'Footer/compact', tablet: 'Footer/regular', tabletL: 'Footer/regular', desktop: 'Footer/regular', wide: 'Footer/large', ultra: 'Footer/xl' };
function padRows(inst, px) { for (const r of inst.children) if (r.flex && /^row ·/.test(r.name)) { r.flex.leftPadding = px; r.flex.rightPadding = px; } if (inst.flex && !inst.children.some((r) => /^row ·/.test(r.name))) { inst.flex.leftPadding = px; inst.flex.rightPadding = px; } }

// ---------- data ----------
const CATS = [['Tekstil & Hazır Giyim', 'textile', 'blue', '12.480 ürün · 1.320 tedarikçi'], ['Makine & Endüstri', 'machine', 'slate', '8.960 ürün · 910 tedarikçi'], ['Gıda & Tarım', 'food', 'green', '15.200 ürün · 2.140 tedarikçi'],
  ['Yapı & Seramik', 'build', 'saffron', '6.320 ürün · 540 tedarikçi'], ['Ambalaj & Baskı', 'pack', 'saffron', '4.870 ürün · 610 tedarikçi'], ['Elektrik & Aydınlatma', 'electric', 'violet', '7.410 ürün · 730 tedarikçi'],
  ['Mobilya & Ev', 'furniture', 'teal', '9.130 ürün · 1.020 tedarikçi'], ['Kimya & Plastik', 'chem', 'violet', '3.960 ürün · 380 tedarikçi'], ['Otomotiv Yan Sanayi', 'auto', 'slate', '5.540 ürün · 470 tedarikçi'], ['Kozmetik & Bakım', 'cosmetic', 'coral', '2.880 ürün · 350 tedarikçi']];
const PRODS = [
  { n: 'Organik pamuk penye kumaş, 180 g/m²', s: 'Ege Tekstil · Denizli', p: '₺118 – ₺142,50', u: '/ metre', m: 'Min. 500 metre · 3 kademe', i: 'textile', t: 'blue', b: 'Flash −%18', a: 'Uyum %92' },
  { n: 'Paslanmaz çelik endüstriyel mikser, 500 L', s: 'Anadolu Makina · Konya', p: '₺312.000', u: '/ adet', m: 'Min. 1 adet · 45 gün üretim', i: 'machine', t: 'slate', a: 'Uyum %88' },
  { n: 'Erken hasat sızma zeytinyağı, 5 L teneke', s: 'Ayvalık Zeytincilik · Balıkesir', p: '₺1.090 – ₺1.240', u: '/ teneke', m: 'Min. 120 teneke · 2 kademe', i: 'food', t: 'green', b: 'Yeni hasat', a: 'Uyum %90' },
  { n: 'Porselen karo 60×120, mat yüzey', s: 'Bilecik Seramik · Bilecik', p: '₺412 – ₺489', u: '/ m²', m: 'Min. 300 m² · 3 kademe', i: 'build', t: 'saffron', a: 'Uyum %86' },
  { n: '5 katlı oluklu koli, özel baskılı', s: 'Gebze Ambalaj · Kocaeli', p: '₺12,90 – ₺18,40', u: '/ adet', m: 'Min. 2.000 adet · 4 kademe', i: 'pack', t: 'saffron', b: 'Flash −%12', a: 'Uyum %95' },
  { n: 'LED panel armatür 60×60, 40 W', s: 'Işık Elektrik · İstanbul', p: '₺470 – ₺585', u: '/ adet', m: 'Min. 200 adet · CE, TSE', i: 'electric', t: 'violet', a: 'Uyum %84' },
  { n: 'Masif meşe yemek masası, 200 cm', s: 'İnegöl Mobilya · Bursa', p: '₺24.900 – ₺28.400', u: '/ adet', m: 'Min. 10 adet · OEM', i: 'furniture', t: 'teal', a: 'Uyum %81' },
  { n: 'Gıda sınıfı PET granül, şişelik', s: 'Kocaeli Polimer · Kocaeli', p: '₺54 – ₺61', u: '/ kg', m: 'Min. 5 ton · FDA uyumlu', i: 'chem', t: 'violet', b: 'Stokta', a: 'Uyum %87' },
  { n: 'Fren diski, ventilli, OEM uyumlu', s: 'Bursa Oto Parça · Bursa', p: '₺640 – ₺720', u: '/ adet', m: 'Min. 100 adet · IATF 16949', i: 'auto', t: 'slate', a: 'Uyum %83' },
  { n: 'Isparta gül suyu, 1 L cam şişe', s: 'Isparta Gül · Isparta', p: '₺96 – ₺118', u: '/ şişe', m: 'Min. 500 şişe · Organik', i: 'cosmetic', t: 'coral', a: 'Uyum %89' },
  { n: 'Tam deri evrak çantası, OEM', s: 'Kapalıçarşı Deri · İstanbul', p: '₺1.780 – ₺2.150', u: '/ adet', m: 'Min. 100 adet · Logo baskı', i: 'handbag', t: 'coral', a: 'Uyum %85' },
  { n: 'Türk kahvesi, vakumlu 1 kg', s: 'Gaziantep Kavurma · Gaziantep', p: '₺520 – ₺590', u: '/ kg', m: 'Min. 200 kg · Private label', i: 'coffee', t: 'saffron', b: 'Çok satan', a: 'Uyum %91' },
  { n: 'Afyon beyaz mermer plaka, 2 cm', s: 'Afyon Mermer · Afyonkarahisar', p: '₺1.920', u: '/ m²', m: 'Min. 150 m² · Blok seçimi', i: 'build', t: 'slate', a: 'Uyum %80' },
  { n: 'Gemi halatı, polyester 24 mm', s: 'Karadeniz Halat · Trabzon', p: '₺210 – ₺245', u: '/ metre', m: 'Min. 1.000 m · IMO', i: 'boat', t: 'teal', a: 'Uyum %82' },
];
const EVENTS = [['Ege’nin Pamuk Atölyeleri', 'Tekstil · 18 üretici', 'Bitmesine 23 sa 14 dk', 'textile'], ['Anadolu Makine Haftası', 'Makine · 14 üretici', 'Bitmesine 1 gün 6 sa', 'machine'], ['Karadeniz Hasadı', 'Gıda · 12 kooperatif', 'Bitmesine 2 gün 3 sa', 'food'],
  ['İnegöl Masif Mobilya', 'Mobilya · 7 üretici', 'Bitmesine 3 gün', 'furniture'], ['Ambalajda Sürdürülebilirlik', 'Ambalaj · 9 üretici', 'Bitmesine 4 gün', 'pack'], ['Seramik ve Karo Günleri', 'Yapı · 11 üretici', 'Bitmesine 5 gün', 'build']];

// ---------- typography / button helpers bound to device ----------
function TX(parent, d, str, role, o = {}) { return T(parent, str, d.ty[role] || role, o); }
function BTNI(parent, d, label, kind = 'Birincil', icon, o = {}) {
  const i = INST(parent, `Button#${kind}|${o.state || 'Varsayılan'}`, { name: `button · ${label}` });
  const lab = SETT(i, 'label', label);
  if (icon) SETI(i, icon, kind === 'Birincil' || kind === 'Tehlike' ? 'text/on-brand' : kind === 'Üçüncül' ? 'text/brand' : 'text/primary'); else HIDE(i, 'icon');
  if (d.tgt > 44 && lab) { LT()[d.ty.label]?.applyToText(lab); i.resize(i.width, d.tgt); }
  if (d.fam === 'tv' && lab) { LT()['tv/label']?.applyToText(lab); i.resize(i.width, 64); }
  if (o.W === 'fill' && i.layoutChild) i.layoutChild.horizontalSizing = 'fill';
  if (typeof o.W === 'number') { i.resize(o.W, i.height); if (i.layoutChild) i.layoutChild.horizontalSizing = 'fix'; }
  return i;
}
function BADGEI(parent, tone, label, icon) { const b = INST(parent, `Badge#${tone}`); SETT(b, 'label', label); if (icon) SETI(b, icon, BADGE_T[tone][1], 'icon', 16); return b; }

// ---------- frame shell ----------
function FRAME(name, w, x, y, bg) { const f = B(null, name, { dir: 'column', W: w, H: 'hug', bg: bg || 'bg/canvas', clip: true }); f.x = x; f.y = y; return f; }
function SHELL(d, title, x, y, o = {}) {
  const f = FRAME(`${title} · ${d.id} · ${d.label}`, d.w, x, y, d.dark ? 'bg/inverse' : 'bg/canvas');
  f.setPluginData('dev', d.id); f.setPluginData('page', title);
  if (d.fam === 'tv') { f.flex.verticalSizing = 'fix'; f.resize(d.w, d.h); }
  let content = f, rail = null;
  if (d.fam === 'phoneL') {
    f.flex.dir = 'row'; f.flex.alignItems = 'start';
    rail = INST(f, `Rail/phone-landscape#${o.tab || 'Keşfet'}`, { name: 'Rail (nav · sabit)' });
    content = B(f, 'content', { dir: 'column', W: d.w - 96, H: 'hug' });
    INST(content, 'Header/phone-landscape', { W: 'fill', name: 'Header (banner)' });
  } else {
    const h = INST(f, HDRK[d.fam], { W: 'fill', name: 'Header (banner)' });
    if (['desktop', 'tablet', 'tabletL'].includes(d.fam)) padRows(h, d.px);
  }
  const main = B(content, 'main (landmark)', { dir: 'column', W: 'fill', H: 'hug' });
  return { f, content, main, rail, d };
}
async function END(sh, o = {}) {
  const { d, f } = sh;
  if (d.fam !== 'tv' && o.footer !== false) { const ft = INST(sh.content, FOOTK[d.fam], { W: 'fill', name: 'Footer (contentinfo)' }); if (['desktop', 'tablet', 'tabletL'].includes(d.fam)) padRows(ft, d.px); }
  let bar = null;
  if (d.fam === 'phone' && o.tab !== null) {
    bar = o.sticky ? o.sticky(f) : INST(f, `BottomNav/phone#${o.tab || 'Keşfet'}`, { name: `BottomNav (sabit · ${o.tab || 'Keşfet'})` });
    bar.layoutChild.absolute = true; bar.resize(d.w, bar.height); bar.fixedWhenScrolling = true; f.flex.bottomPadding = bar.height;
  }
  if (d.fam === 'tv' && o.hint !== false) { const h = TV_HINT(f); h.layoutChild.absolute = true; h.resize(d.w, 96); penpotUtils.setParentXY(h, 0, d.h - 96); }
  try { f.addRulerGuide('horizontal', d.h); } catch (e) {}
  await FIXUP(f); await sleep(120);
  if (sh.rail) sh.rail.resize(96, f.height);
  if (bar) penpotUtils.setParentXY(bar, 0, f.height - bar.height);
  return f;
}
function SECTION(parent, name, d, o = {}) {
  const s = B(parent, name, { dir: 'column', ai: 'center', W: 'fill', H: 'hug', p: [o.pt ?? d.gap * 2, 0, o.pb ?? d.gap * 2, 0], bg: o.bg, grad: o.grad });
  return B(s, 'container', { dir: o.dir || 'column', gap: o.gap ?? d.gap, W: d.cw, H: 'hug', ai: o.ai, jc: o.jc, wrap: o.wrap });
}
function SHEAD(parent, d, over, title, o = {}) {
  const h = B(parent, 'section-heading', { dir: 'row', gap: 16, ai: 'end', W: 'fill', H: 'hug' });
  const l = B(h, 'titles', { dir: 'column', gap: 6, W: 'fill', H: 'hug' });
  if (over) TX(l, d, over, 'overline', { c: d.dark ? 'focus/ring-on-dark' : 'text/brand', name: 'overline' });
  TX(l, d, title, 'h2', { fill: true, c: d.dark ? 'text/inverse' : 'text/primary', name: 'h2 · ' + title });
  if (o.sub) TX(l, d, o.sub, 'body', { fill: true, c: d.dark ? 'text/inverse-muted' : 'text/secondary' });
  if (o.link && !SMALL(d)) { const a = B(h, 'link · ' + o.link, { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: d.tgt }); TX(a, d, o.link, 'label', { c: 'text/link' }); ICN(a, 'arrow-right', 20, 'text/link'); }
  return h;
}
function ROWS(parent, items, cols, gap, render, W, name = 'grid') {
  const cellW = (W - gap * (cols - 1)) / cols;
  const g = B(parent, name, { dir: 'column', gap, W: 'fill', H: 'hug' });
  for (let i = 0; i < items.length; i += cols) {
    const r = B(g, `row ${i / cols + 1}`, { dir: 'row', gap, W: 'fill', H: 'hug', ai: 'stretch' });
    for (let j = 0; j < cols && i + j < items.length; j++) { const c = render(r, items[i + j], i + j, cellW); if (c) { c.resize(cellW, c.height); if (c.layoutChild) { c.layoutChild.horizontalSizing = 'fix'; c.layoutChild.verticalSizing = 'auto'; } } }
  }
  return g;
}
function tintFill(t) { const [a, z] = TINTS[t] || TINTS.blue; return [{ fillOpacity: 1, fillColorGradient: { type: 'linear', startX: 0.1, startY: 0, endX: 0.9, endY: 1, width: 1, stops: [{ color: a, opacity: 1, offset: 0 }, { color: z, opacity: 1, offset: 1 }] } }]; }
function setIllu(inst, key, color) { const il = penpotUtils.findShape((s) => s.name === 'illu', inst); if (!il) return; const c = CM()['Illu/' + key]; if (c) il.swapComponent(c); const now = penpotUtils.findShape((s) => s.isComponentInstance && s.isComponentInstance() && s.component()?.path?.replace(/\s/g, '') === 'Illu', inst); if (now) { now.name = 'illu'; if (color) recolor(now, color); } }
function PCARD(parent, d, p, w, o = {}) {
  const i = INST(parent, `ProductCard#${d.card}|${o.state || 'Varsayılan'}`, { name: 'ProductCard · ' + p.n });
  SETT(i, 'title', p.n); SETT(i, 'supplier', p.s); SETT(i, 'price', p.p); SETT(i, 'unit', p.u); SETT(i, 'moq', p.m);
  const mb = penpotUtils.findShape((s) => s.name === 'match', i); if (mb) SETT(mb, 'label', p.a);
  const bd = penpotUtils.findShape((s) => s.name === 'badge', i); if (bd) { if (p.b) SETT(bd, 'label', p.b); else bd.hidden = true; }
  const m = penpotUtils.findShape((s) => s.name === 'media', i); if (m) m.fills = tintFill(p.t);
  setIllu(i, p.i, (TINTS[p.t] || TINTS.blue)[2]);
  if (w) { i.resize(w, i.height); if (m) { m.resize(w - 16, Math.round((w - 16) * (o.ratio || 0.8))); const fav = penpotUtils.findShape((s) => s.name.startsWith('fav'), m); if (fav) penpotUtils.setParentXY(fav, w - 16 - fav.width - 8, 8); } }
  return i;
}
function PGRID(parent, d, items, cols, W) { return ROWS(parent, items, cols, d.gap, (r, p, k, cw) => PCARD(r, d, p, cw), W ?? d.cw, 'Ürün ızgarası'); }
function CATTILE(parent, d, [n, key, tint, cnt], w) {
  const i = INST(parent, `CategoryTile/${SMALL(d) ? 'S' : 'M'}`, { name: 'CategoryTile · ' + n });
  SETT(i, 'name', n); SETT(i, 'count', cnt); setIllu(i, key, (TINTS[tint] || TINTS.blue)[2]);
  const tile = penpotUtils.findShape((s) => s.name === 'icon-tile', i); if (tile) tile.fills = [fill({ blue: 'bg/brand-subtle', violet: 'bg/ai-subtle', green: 'bg/success-subtle', saffron: 'bg/warning-subtle', coral: 'bg/danger-subtle', slate: 'bg/muted', teal: 'bg/success-subtle' }[tint])];
  return i;
}
function ECARD(parent, d, [n, k, e, key], w) {
  const size = SMALL(d) ? 'S' : d.fam === 'wide' || d.fam === 'ultra' ? 'L' : 'M';
  const i = INST(parent, `EventCard/${size}`, { name: 'EventCard · ' + n });
  SETT(i, 'title', n); SETT(i, 'overline', k); const cd = penpotUtils.findShape((s) => s.name === 'countdown', i); if (cd) SETT(cd, 'label', e);
  setIllu(i, key);
  if (w) { i.resize(w, i.height); const m = penpotUtils.findShape((s) => s.name === 'media', i); if (m) m.resize(w, Math.round(w * 0.46)); }
  return i;
}
// ---------- TV helpers ----------
function TV_HINT(parent) {
  const h = B(parent, 'Uzaktan kumanda ipuçları', { dir: 'row', gap: 40, ai: 'center', jc: 'end', p: [0, 96], W: 'fill', H: 96, bg: 'bg/inverse' });
  for (const [k, t] of [['OK', 'Seç'], ['◀ ▶ ▲ ▼', 'Gezin'], ['Geri', 'Önceki ekran'], ['🎙', 'Sesli ara']]) { const r = B(h, 'hint · ' + t, { dir: 'row', gap: 12, ai: 'center', W: 'hug', H: 'hug' }); const kb = B(r, 'key', { dir: 'row', p: [4, 12], r: R.s, st: 'border/default', W: 'hug', H: 'hug' }); T(kb, k === '🎙' ? 'Mikrofon' : k, 'tv/label', { c: 'text/inverse' }); T(r, t, 'tv/label', { c: 'text/inverse-muted' }); }
  return h;
}
function TV_ROW(parent, title, items, focusIdx) {
  const r = B(parent, 'row · ' + title, { dir: 'column', gap: 20, p: [0, 96], W: 'fill', H: 'hug' });
  T(r, title, 'tv/title', { c: 'text/inverse', name: 'h2 · ' + title });
  const line = B(r, 'rail (D-pad ◀ ▶)', { dir: 'row', gap: 28, W: 'fill', H: 'hug', clip: true, ai: 'start' });
  items.forEach((p, i) => { const c = INST(line, `ProductCard/tv#${i === focusIdx ? 'Odakta' : 'Varsayılan'}`, { name: `TVCard · ${p.n}${i === focusIdx ? ' [focused]' : ''}` }); SETT(c, 'title', p.n); SETT(c, 'price', `${p.p} ${p.u}`); SETT(c, 'moq', p.m); const m = penpotUtils.findShape((s) => s.name === 'media', c); if (m) m.fills = tintFill(p.t); setIllu(c, p.i, (TINTS[p.t] || TINTS.blue)[2]); });
  return r;
}
function TV_FOCUSBTN(parent, label, icon, kind = 'Birincil') { const b = BTNI(parent, DEV('TV'), label, kind, icon); FOCUS(b, true); b.shadows = glow('#BCC9FF'); b.name += ' [focused]'; return b; }
function QR(parent, size, label) {
  const q = B(parent, 'QR · ' + label, { dir: 'column', gap: 16, ai: 'center', p: 24, W: 'hug', H: 'hug', bg: 'bg/surface', r: R.m, el: 'e4' });
  const g = B(q, 'qr (aria-hidden)', { dir: 'none', W: size, H: size, bg: 'bg/surface' }); const m = size / 25;
  const sq = (x, y, n, c) => { const r = penpot.createRectangle(); g.appendChild(r); r.resize(n * m, n * m); penpotUtils.setParentXY(r, x * m, y * m); r.fills = [fill(c)]; r.borderRadius = n >= 5 ? Math.min(12, m) : 1; };
  for (const [x, y] of [[0, 0], [18, 0], [0, 18]]) { sq(x, y, 7, 'text/primary'); sq(x + 1, y + 1, 5, 'bg/surface'); sq(x + 2, y + 2, 3, 'action/primary'); }
  let s = 11; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue; if (rnd() > 0.56) sq(x, y, 1, 'text/primary'); }
  T(q, label, 'tv/label', { align: 'center' });
  return q;
}
function TV_SPLIT(sh, left, right, lw = 980) {
  const r = B(sh.main, 'TV içerik', { dir: 'row', gap: 64, ai: 'start', p: [24, 96, 0, 96], W: 'fill', H: 'hug' });
  const L = B(r, 'sol', { dir: 'column', gap: 24, W: lw, H: 'hug' }); left(L);
  const Rr = B(r, 'sağ', { dir: 'column', gap: 24, W: 1920 - 192 - 64 - lw, H: 'hug', ai: 'start' }); right(Rr);
  return r;
}
async function TV_HANDOFF(d, title, x, y, o) {
  const sh = SHELL(d, title, x, y);
  TV_SPLIT(sh, (L) => {
    T(L, o.over, 'overline', { c: 'focus/ring-on-dark' }); T(L, o.h1, 'tv/headline', { c: 'text/inverse', fill: true }); T(L, o.body, 'tv/body', { c: 'text/inverse-muted', fill: true });
    (o.steps || []).forEach((s, i) => { const r = B(L, 'adım ' + (i + 1), { dir: 'row', gap: 20, ai: 'center', W: 'fill', H: 'hug' }); const n = B(r, 'num', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: R.m, bg: 'bg/inverse-2' }); T(n, String(i + 1), 'tv/title', { c: 'text/inverse' }); T(r, s, 'tv/body', { c: 'text/inverse', fill: true }); });
    if (o.code) { const c = B(L, 'Cihaz kodu', { dir: 'row', gap: 12, W: 'hug', H: 'hug' }); o.code.split('').forEach((ch) => { const b = B(c, 'kod · ' + ch, { dir: 'row', ai: 'center', jc: 'center', W: 84, H: 100, r: R.m, bg: 'bg/surface' }); T(b, ch, 'mono/l'); }); }
    const a = B(L, 'eylemler', { dir: 'row', gap: 24, W: 'hug', H: 'hug' }); TV_FOCUSBTN(a, o.cta, o.ctaIcon || 'arrow-right'); BTNI(a, d, 'Geri', 'İkincil', 'arrow-left');
  }, (R) => { QR(R, 300, o.qr); if (o.side) T(R, o.side, 'tv/label', { c: 'text/inverse-muted', fill: true }); });
  return END(sh, { tab: null });
}
