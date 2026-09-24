// Arasta site system: devices, data, atoms, component builders (runs inside Penpot via MCP)

const FAM = {
  phone:   { g: 16, gap: 12, ts: { h1: 32, h2: 24, h3: 20, b: 16, p: 18 }, tgt: 44, is: 24, card: 'compact', hdr: 'phone', foot: 'compact' },
  phoneL:  { g: 24, gap: 12, ts: { h1: 28, h2: 24, h3: 20, b: 16, p: 18 }, tgt: 44, is: 24, card: 'compact', hdr: 'phoneL', foot: 'compact', rail: 96 },
  tablet:  { g: 32, gap: 16, ts: { h1: 48, h2: 32, h3: 24, b: 16, p: 20 }, tgt: 44, is: 24, card: 'regular', hdr: 'tablet', foot: 'regular' },
  tabletL: { g: 32, gap: 16, ts: { h1: 48, h2: 32, h3: 24, b: 16, p: 20 }, tgt: 44, is: 24, card: 'regular', hdr: 'tabletL', foot: 'regular' },
  desktop: { g: 40, gap: 24, max: 1760, ts: { h1: 64, h2: 40, h3: 24, b: 16, p: 20 }, tgt: 44, is: 24, card: 'regular', hdr: 'desktop', foot: 'regular' },
  wide:    { g: 64, gap: 32, max: 2240, ts: { h1: 88, h2: 48, h3: 28, b: 18, p: 22 }, tgt: 48, is: 28, card: 'large', hdr: 'wide', foot: 'large' },
  ultra:   { g: 96, gap: 40, max: 3200, ts: { h1: 96, h2: 56, h3: 32, b: 20, p: 24 }, tgt: 56, is: 32, card: 'xl', hdr: 'ultra', foot: 'xl' },
  tv:      { g: 96, gap: 32, ts: { h1: 72, h2: 48, h3: 32, b: 28, p: 28 }, tgt: 64, is: 32, card: 'tv', hdr: 'tv', dark: true },
};
const DEV = [
  { id: 'P320', fam: 'phone', w: 320, h: 480, cols: 1, label: 'iPhone 4 · 320×480 · (1280px ekran @%400 zoom = 320 CSS px reflow)' },
  { id: 'P360', fam: 'phone', w: 360, h: 740, cols: 2, label: 'Küçük telefon dikey · 360×740' },
  { id: 'P390', fam: 'phone', w: 390, h: 844, cols: 2, label: 'Orta telefon dikey · 390×844' },
  { id: 'P430', fam: 'phone', w: 430, h: 932, cols: 2, label: 'Büyük telefon dikey · 430×932' },
  { id: 'L480', fam: 'phoneL', w: 480, h: 320, cols: 2, label: 'Küçük telefon yatay · 480×320' },
  { id: 'L844', fam: 'phoneL', w: 844, h: 390, cols: 3, label: 'Orta telefon yatay · 844×390' },
  { id: 'L932', fam: 'phoneL', w: 932, h: 430, cols: 4, label: 'Büyük telefon yatay · 932×430' },
  { id: 'T600', fam: 'tablet', w: 600, h: 960, cols: 2, label: 'Küçük tablet dikey · 600×960' },
  { id: 'T768', fam: 'tablet', w: 768, h: 1024, cols: 3, label: 'Orta tablet dikey · 768×1024' },
  { id: 'T1024P', fam: 'tablet', w: 1024, h: 1366, cols: 4, label: 'Büyük tablet dikey · 1024×1366' },
  { id: 'T960', fam: 'tabletL', w: 960, h: 600, cols: 3, label: 'Küçük tablet yatay · 960×600' },
  { id: 'T1024L', fam: 'tabletL', w: 1024, h: 768, cols: 4, label: 'Orta tablet yatay · 1024×768' },
  { id: 'T1366', fam: 'tabletL', w: 1366, h: 1024, cols: 5, label: 'Büyük tablet yatay · 1366×1024' },
  { id: 'K1280', fam: 'desktop', w: 1280, h: 800, cols: 4, label: 'Küçük laptop · 1280×800' },
  { id: 'K1440', fam: 'desktop', w: 1440, h: 900, cols: 5, label: 'Orta laptop · 1440×900' },
  { id: 'K1728', fam: 'desktop', w: 1728, h: 1117, cols: 5, label: 'Büyük laptop · 1728×1117 (MacBook Pro 16")' },
  { id: 'D1920', fam: 'desktop', w: 1920, h: 1080, cols: 6, label: 'Desktop · 1920×1080' },
  { id: 'W2560', fam: 'wide', w: 2560, h: 1440, cols: 7, label: '27" 5K · 2560×1440 CSS px @2x (5120×2880)' },
  { id: 'TV', fam: 'tv', w: 1920, h: 1080, cols: 5, label: '4K TV · 1920×1080 CSS px @2x (3840×2160) · 10-foot UI' },
  { id: 'U8K', fam: 'ultra', w: 3840, h: 2160, cols: 8, label: '8K · 3840×2160 CSS px @2x (7680×4320)' },
];
function prep(d) {
  const f = FAM[d.fam], rail = f.rail || 0, avail = d.w - rail;
  const cw = Math.min(avail - 2 * f.g, f.max || 1e9);
  return { ...f, ...d, rail, cw, px: (avail - cw) / 2, dark: !!f.dark };
}
const DEVS = DEV.map(prep);
const colW = (d, n, gap) => (d.cw - (gap ?? d.gap) * (n - 1)) / n;

// ---------- data ----------
const CATS = [
  ['Tekstil & Hazır Giyim', 'Denizli · Bursa · İstanbul', 0], ['Makine & Endüstri', 'Konya · Kocaeli', 3], ['Gıda & Tarım', 'Ege · Karadeniz', 4],
  ['Yapı & Seramik', 'Bilecik · Uşak', 1], ['Ambalaj & Baskı', 'Gebze · İzmir', 0], ['Elektrik & Aydınlatma', 'İstanbul · Ankara', 3],
  ['Mobilya & Ev', 'İnegöl · Kayseri', 2], ['Kimya & Plastik', 'Kocaeli · Adana', 5], ['Otomotiv Yan Sanayi', 'Bursa · Sakarya', 3], ['Kozmetik & Bakım', 'İstanbul', 2],
];
const PRODS = [
  { n: 'Organik pamuk penye kumaş, 180 g/m²', s: 'Ege Tekstil A.Ş.', c: 'Denizli', p: '₺118,00 – ₺142,50', u: '/ metre', m: '500 metre', t: 0 },
  { n: 'Paslanmaz çelik endüstriyel mikser, 500 L', s: 'Anadolu Makina', c: 'Konya', p: '₺312.000', u: '/ adet', m: '1 adet', t: 3 },
  { n: 'Erken hasat sızma zeytinyağı, 5 L teneke', s: 'Ayvalık Zeytincilik', c: 'Balıkesir', p: '₺1.090 – ₺1.240', u: '/ teneke', m: '120 teneke', t: 4 },
  { n: 'Porselen karo 60×120, mat yüzey', s: 'Bilecik Seramik', c: 'Bilecik', p: '₺412 – ₺489', u: '/ m²', m: '300 m²', t: 1 },
  { n: '5 katlı oluklu koli, özel baskılı', s: 'Gebze Ambalaj', c: 'Kocaeli', p: '₺12,90 – ₺18,40', u: '/ adet', m: '2.000 adet', t: 0 },
  { n: 'Giresun fındık içi, natürel, 25 kg', s: 'Karadeniz Tarım Koop.', c: 'Giresun', p: '₺6.850', u: '/ çuval', m: '40 çuval', t: 4 },
  { n: 'El işi bakır cezve seti', s: 'Gaziantep Bakırcılar', c: 'Gaziantep', p: '₺520 – ₺640', u: '/ set', m: '50 set', t: 2 },
  { n: 'LED panel armatür 60×60, 40 W', s: 'Işık Elektrik', c: 'İstanbul', p: '₺470 – ₺585', u: '/ adet', m: '200 adet', t: 3 },
  { n: 'Malatya gün kurusu kayısı, 1. sınıf', s: 'Malatya Kuru Gıda', c: 'Malatya', p: '₺265', u: '/ kg', m: '500 kg', t: 4 },
  { n: 'Tam deri evrak çantası, OEM üretim', s: 'Kapalıçarşı Deri', c: 'İstanbul', p: '₺1.780 – ₺2.150', u: '/ adet', m: '100 adet', t: 2 },
  { n: 'Afyon beyaz mermer plaka, 2 cm', s: 'Afyon Mermer', c: 'Afyonkarahisar', p: '₺1.920', u: '/ m²', m: '150 m²', t: 5 },
  { n: 'Masif meşe yemek masası, 200 cm', s: 'İnegöl Mobilya', c: 'Bursa', p: '₺24.900 – ₺28.400', u: '/ adet', m: '10 adet', t: 0 },
  { n: 'Hereke ipek halı, 2×3 m, el dokuma', s: 'Hereke Dokuma', c: 'Kocaeli', p: '₺86.000', u: '/ adet', m: '2 adet', t: 2 },
  { n: 'Endüstriyel CNC lazer kesim, 3 kW', s: 'Kocaeli Makine', c: 'Kocaeli', p: '₺1.450.000', u: '/ adet', m: '1 adet', t: 3 },
  { n: 'Kapadokya seramik yemek takımı, 24 pr.', s: 'Avanos Çömlek', c: 'Nevşehir', p: '₺3.200 – ₺3.900', u: '/ takım', m: '30 takım', t: 1 },
  { n: 'Isparta gül yağı ve gül suyu seti', s: 'Isparta Gül Kozmetik', c: 'Isparta', p: '₺410 – ₺520', u: '/ set', m: '200 set', t: 5 },
];
const EVENTS = [
  { n: 'Ege’nin Pamuk Atölyeleri', k: 'Tekstil · 18 üretici', e: '23 sa 14 dk', t: 0 },
  { n: 'Anadolu Bakır ve El Sanatları', k: 'Ev & Hediyelik · 9 üretici', e: '1 gün 6 sa', t: 2 },
  { n: 'Karadeniz Hasadı: Fındık ve Çay', k: 'Gıda · 12 kooperatif', e: '2 gün 3 sa', t: 4 },
  { n: 'İnegöl Masif Mobilya Seçkisi', k: 'Mobilya · 7 üretici', e: '3 gün', t: 0 },
  { n: 'Bilecik ve Uşak Seramik Haftası', k: 'Yapı · 11 üretici', e: '4 gün', t: 1 },
  { n: 'Konya Makine Parkı', k: 'Makine · 14 üretici', e: '5 gün', t: 3 },
];

// ---------- atoms ----------
function SECTION(parent, name, d, o = {}) { // full-bleed section with centered content container of width d.cw
  const s = B(parent, name, { dir: 'column', ai: 'center', W: 'fill', H: 'hug', p: [o.pt ?? d.gap * 2, 0, o.pb ?? d.gap * 2, 0], bg: o.bg });
  const c = B(s, 'container', { dir: o.dir || 'column', gap: o.gap ?? d.gap, W: d.cw, H: 'hug', ai: o.ai, jc: o.jc, wrap: o.wrap });
  return c;
}
function HEAD(parent, d, over, title, o = {}) { // section heading block
  const h = B(parent, 'section-heading', { dir: 'row', ai: 'end', jc: 'space-between', gap: 16, W: 'fill', H: 'hug' });
  const l = B(h, 'titles', { dir: 'column', gap: 4, W: 'fill', H: 'hug' });
  if (over) T(l, over, { s: d.ts.b, w: 600, up: true, ls: 1.6, c: d.dark ? C.goldOnDark : C.gold, name: 'overline' });
  T(l, title, { f: 'serif', s: d.ts.h2, w: 500, fill: true, c: d.dark ? C.onDark : C.ink, name: 'h2 · ' + title, lh: 1.15 });
  if (o.link && d.fam !== 'phone') { const a = B(h, 'link · ' + o.link, { dir: 'row', gap: 4, ai: 'center', H: d.tgt, W: 'hug' }); T(a, o.link, { s: d.ts.b, w: 600, u: true, c: d.dark ? C.onDark : C.ink }); I(a, 'chevR', { s: 20, c: d.dark ? C.onDark : C.ink }); }
  return h;
}
function ROWS(parent, items, cols, gap, render, name = 'grid', cw) { // rows of fixed, equal-width cells (avoids Penpot fill/hug collapse)
  const W = cw ?? (parent.width > 1 ? parent.width : 0);
  const cellW = (W - gap * (cols - 1)) / cols;
  const g = B(parent, name, { dir: 'column', gap, W: 'fill', H: 'hug' });
  for (let i = 0; i < items.length; i += cols) {
    const r = B(g, `row ${i / cols + 1}`, { dir: 'row', gap, W: 'fill', H: 'hug', ai: 'start' });
    for (let j = 0; j < cols; j++) {
      const it = items[i + j];
      if (it === undefined) break;
      const cell = render(r, it, i + j, cellW);
      if (cell?.layoutChild) { cell.resize(cellW, cell.height); cell.layoutChild.horizontalSizing = 'fix'; cell.layoutChild.verticalSizing = 'auto'; }
    }
  }
  return g;
}
function FIELD(parent, label, o = {}) {
  const s = o.s || 16, h = o.h || 48;
  const f = B(parent, `Field · ${label}`, { dir: 'column', gap: 6, W: o.W ?? 'fill', H: 'hug' });
  const lr = B(f, 'label-row', { dir: 'row', gap: 6, W: 'fill', H: 'hug' });
  T(lr, label, { s, w: 600, c: o.dark ? C.onDark : C.ink, name: 'label' });
  if (o.req) T(lr, '(zorunlu)', { s, c: o.dark ? C.onDarkMuted : C.muted });
  if (o.opt) T(lr, '(isteğe bağlı)', { s, c: o.dark ? C.onDarkMuted : C.muted });
  const box = B(f, o.select ? 'select' : o.area ? 'textarea' : 'input', { dir: 'row', gap: 8, ai: o.area ? 'start' : 'center', p: [o.area ? 12 : 0, 12], W: 'fill', H: o.area ? h * 2.5 : h, bg: C.paper, stroke: o.error ? C.accent : C.border, sw: o.error ? 2 : 1.5, r: RADIUS.sm });
  if (o.icon) I(box, o.icon, { s: 20, c: C.muted });
  T(box, o.value || o.ph || '', { s, c: o.value ? C.ink : C.muted, fill: true, name: o.value ? 'value' : 'placeholder' });
  if (o.select) I(box, 'chevD', { s: 20 });
  if (o.suffix) T(box, o.suffix, { s, c: C.muted });
  if (o.focus) FOCUS(box);
  if (o.help) T(f, o.help, { s, c: o.dark ? C.onDarkMuted : C.muted, fill: true, name: 'help-text' });
  if (o.error) { const e = B(f, 'error-message (role=alert)', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' }); I(e, 'x', { s: 20, c: C.accent }); T(e, o.error, { s, c: C.accent, w: 600, fill: true }); }
  return f;
}
function CHIP(parent, label, o = {}) {
  const c = B(parent, `Chip · ${label}${o.on ? ' (seçili)' : ''}`, { dir: 'row', gap: 6, ai: 'center', p: [0, 14], H: o.h || 40, W: 'hug', r: RADIUS.lg, bg: o.on ? C.ink : o.dark ? C.inkSoft : C.paper, stroke: o.on ? C.ink : C.border, sw: 1 });
  if (o.on) I(c, 'check', { s: 18, c: C.onDark });
  T(c, label, { s: o.s || 16, w: 500, c: o.on || o.dark ? C.onDark : C.ink });
  if (o.x) I(c, 'x', { s: 18, c: o.on ? C.onDark : C.ink });
  return c;
}
function CHECK(parent, label, on, o = {}) {
  const r = B(parent, `Checkbox · ${label}`, { dir: 'row', gap: 12, ai: 'center', H: o.h || 44, W: o.W ?? 'fill' });
  const b = B(r, 'box', { dir: 'row', ai: 'center', jc: 'center', W: 24, H: 24, r: RADIUS.sm, bg: on ? C.ink : C.paper, stroke: on ? C.ink : C.border, sw: 1.5 });
  if (on) I(b, 'check', { s: 18, c: C.onDark });
  T(r, label, { s: o.s || 16, fill: true });
  if (o.count) T(r, o.count, { s: o.s || 16, c: C.muted });
  return r;
}
function STEPPER(parent, val, o = {}) {
  const s = B(parent, 'Stepper (spinbutton)', { dir: 'row', ai: 'center', H: o.h || 48, W: 'hug', stroke: C.border, sw: 1.5, r: RADIUS.sm });
  I(s, 'minus', { box: o.h || 48, s: 20, name: 'button · Azalt' });
  const v = B(s, 'value', { dir: 'row', ai: 'center', jc: 'center', W: o.vw || 88, H: 'fill' }); T(v, val, { s: o.s || 16, w: 600 });
  I(s, 'plus', { box: o.h || 48, s: 20, name: 'button · Artır' });
  return s;
}
function BADGE(parent, label, o = {}) {
  const b = B(parent, `Badge · ${label}`, { dir: 'row', gap: 6, ai: 'center', p: [4, 8], W: 'hug', H: 'hug', r: RADIUS.sm, bg: o.bg || (o.dark ? C.inkSoft : C.ivory) });
  if (o.icon) I(b, o.icon, { s: o.is || 18, c: o.c || C.gold });
  T(b, label, { s: o.s || 16, w: 600, c: o.c || (o.dark ? C.onDark : C.ink) });
  return b;
}
function COUNTDOWN(parent, ends, o = {}) {
  const b = B(parent, 'Countdown (aria-live=off, saniye gösterilmez)', { dir: 'row', gap: 8, ai: 'center', p: [6, 10], W: 'hug', H: 'hug', r: RADIUS.sm, bg: o.dark ? C.paper : C.ink });
  I(b, 'clock', { s: o.is || 20, c: o.dark ? C.accent : C.onDark });
  T(b, `Bitmesine ${ends}`, { s: o.s || 16, w: 600, c: o.dark ? C.ink : C.onDark });
  return b;
}
function RATING(parent, v, n, o = {}) {
  const r = B(parent, `Rating ${v}`, { dir: 'row', gap: 4, ai: 'center', W: 'hug', H: 'hug' });
  I(r, 'star', { s: o.is || 18, c: C.gold, solid: true }); T(r, v, { s: o.s || 16, w: 600, c: o.dark ? C.onDark : C.ink }); if (n) T(r, n, { s: o.s || 16, c: o.dark ? C.onDarkMuted : C.muted });
  return r;
}
function LINK(parent, label, o = {}) { const l = T(parent, label, { s: o.s || 16, w: o.w || 500, u: o.u ?? true, c: o.c || C.ink, name: 'link · ' + label }); return l; }
function BREAD(parent, d, items) {
  const b = B(parent, 'Breadcrumb (nav aria-label)', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true });
  items.forEach((it, i) => { if (i) I(b, 'chevR', { s: 16, c: C.muted }); T(b, it, { s: d.ts.b, c: i === items.length - 1 ? C.ink : C.muted, u: i < items.length - 1, w: i === items.length - 1 ? 600 : 400 }); });
  return b;
}

// ---------- component builders (main components on page 02) ----------
function logo(parent, s = 24, dark) { return T(parent, 'ARASTA', { f: 'serif', s, w: 600, ls: s * 0.18, c: dark ? C.onDark : C.ink, name: 'logo (link · Ana sayfa)' }); }

function buildHeaderPhone() {
  const h = B(null, 'Header/phone', { dir: 'column', W: 390, H: 'hug', bg: C.paper, p: [0, 0, 12, 0] });
  const r = B(h, 'bar', { dir: 'row', ai: 'center', jc: 'space-between', p: [4, 4], W: 'fill', H: 'hug' });
  I(r, 'menu', { box: 44, name: 'button · Menü' }); logo(r, 24); I(r, 'cart', { box: 44, name: 'button · Sepet (3 ürün)' });
  const sw = B(h, 'search-wrap', { dir: 'column', p: [0, 16], W: 'fill', H: 'hug' });
  const sb = B(sw, 'Search (role=search)', { dir: 'row', gap: 8, ai: 'center', p: [0, 0, 0, 12], W: 'fill', H: 48, stroke: C.border, sw: 1.5, r: RADIUS.md });
  I(sb, 'search', { s: 20, c: C.muted }); T(sb, 'Ürün veya tedarikçi ara', { c: C.muted, fill: true, name: 'placeholder' });
  I(sb, 'camera', { box: 44, s: 20, name: 'button · Görselle ara' });
  const hr = DIV(h); hr.layoutChild.topMargin = 12;
  return h;
}
function buildBottomNav(active) {
  const n = B(null, `BottomNav/phone/${active}`, { dir: 'row', W: 390, H: 76, bg: C.paper, p: [4, 0, 8, 0], stroke: C.line });
  for (const [k, ic] of [['Keşfet', 'home'], ['Kategori', 'grid'], ['Teklif', 'rfq'], ['Hesap', 'user']]) {
    const on = k === active;
    const it = B(n, `tab · ${k}${on ? ' (aria-current=page)' : ''}`, { dir: 'column', gap: 2, ai: 'center', jc: 'center', W: 'fill', H: 60 });
    const ib = B(it, 'indicator', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 32, r: RADIUS.lg, bg: on ? C.ink : undefined });
    I(ib, ic, { s: 22, c: on ? C.onDark : C.muted });
    T(it, k, { s: 16, w: on ? 700 : 500, c: on ? C.ink : C.muted });
  }
  return n;
}
function buildRail() {
  const r = B(null, 'Rail/phone-landscape', { dir: 'column', gap: 4, ai: 'center', p: [12, 0], W: 96, H: 430, bg: C.paper, stroke: C.line });
  T(r, 'A', { f: 'serif', s: 32, w: 600, name: 'logo (link · Ana sayfa)' });
  SPACER(r, { H: 8, W: 1 });
  for (const [k, ic, on] of [['Keşfet', 'home', 1], ['Kategori', 'grid'], ['Teklif', 'rfq'], ['Sepet', 'cart'], ['Hesap', 'user']]) {
    const it = B(r, `tab · ${k}`, { dir: 'column', gap: 2, ai: 'center', jc: 'center', W: 88, H: 'hug', p: [4, 0] });
    const ib = B(it, 'indicator', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 32, r: RADIUS.lg, bg: on ? C.ink : undefined });
    I(ib, ic, { s: 22, c: on ? C.onDark : C.muted }); T(it, k, { s: 16, w: on ? 700 : 500, c: on ? C.ink : C.muted });
  }
  return r;
}
function buildHeaderPhoneL() {
  const h = B(null, 'Header/phone-landscape', { dir: 'row', gap: 12, ai: 'center', p: [8, 24], W: 836, H: 'hug', bg: C.paper });
  const sb = B(h, 'Search (role=search)', { dir: 'row', gap: 8, ai: 'center', p: [0, 0, 0, 12], W: 'fill', H: 44, stroke: C.border, sw: 1.5, r: RADIUS.md });
  I(sb, 'search', { s: 20, c: C.muted }); T(sb, 'Ürün veya tedarikçi ara', { c: C.muted, fill: true, name: 'placeholder' }); I(sb, 'camera', { box: 44, s: 20, name: 'button · Görselle ara' });
  I(h, 'msg', { box: 44, name: 'button · Mesajlar' });
  return h;
}
function iconLabel(parent, ic, label, s, box) { const b = B(parent, `button · ${label}`, { dir: 'column', gap: 0, ai: 'center', jc: 'center', W: 'hug', H: 'hug', p: [0, 4] }); I(b, ic, { box, s: Math.round(box * 0.5) }); T(b, label, { s, w: 500 }); return b; }
function buildHeaderTablet() {
  const h = B(null, 'Header/tablet', { dir: 'column', gap: 12, p: [12, 32, 0, 32], W: 768, H: 'hug', bg: C.paper });
  const r = B(h, 'bar', { dir: 'row', gap: 16, ai: 'center', W: 'fill', H: 'hug' });
  logo(r, 28);
  const sb = B(r, 'Search (role=search)', { dir: 'row', gap: 8, ai: 'center', p: [0, 0, 0, 12], W: 'fill', H: 48, stroke: C.border, sw: 1.5, r: RADIUS.md });
  I(sb, 'search', { s: 20, c: C.muted }); T(sb, 'Ürün, tedarikçi veya kategori ara', { c: C.muted, fill: true, name: 'placeholder' }); I(sb, 'camera', { box: 48, s: 20, name: 'button · Görselle ara' });
  for (const [ic, l] of [['msg', 'Mesajlar'], ['cart', 'Sepet (3)'], ['user', 'Hesabım']]) I(r, ic, { box: 48, name: 'button · ' + l });
  const cats = B(h, 'category-tabs (scrollable, klavye ok tuşları)', { dir: 'row', gap: 24, ai: 'center', W: 'fill', H: 48, clip: true });
  ['Tümü', 'Flash Fırsatlar', 'Tekstil', 'Makine', 'Gıda', 'Yapı', 'Ambalaj', 'Elektrik', 'Mobilya'].forEach((c, i) => {
    const t = B(cats, 'tab · ' + c + (i === 0 ? ' (aria-selected=true)' : ''), { dir: 'column', jc: 'center', H: 48, W: 'hug' }); T(t, c, { s: 16, w: i === 0 ? 700 : 500, u: i === 0, c: i === 1 ? C.accent : C.ink });
  });
  DIV(h);
  return h;
}
function buildHeaderDesk(name, o) { // o: w, s, util, nav, pad, box, logo
  const s = o.s, box = o.box;
  const h = B(null, name, { dir: 'column', gap: 0, p: [0, o.pad], W: o.w, H: 'hug', bg: C.paper });
  if (o.util) {
    const u = B(h, 'utility-bar', { dir: 'row', gap: 24, ai: 'center', W: 'fill', H: box });
    const l = B(u, 'locale', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); I(l, 'globe', { s: 20, c: C.muted }); T(l, 'Türkçe · ₺ TRY', { s, c: C.muted, name: 'button · Dil ve para birimi' });
    for (const t of ['Tedarikçi olun', 'Ticaret Güvencesi', 'Yardım Merkezi']) T(u, t, { s, c: C.muted, name: 'link · ' + t });
    DIV(h);
  }
  const m = B(h, 'main-bar', { dir: 'row', gap: o.gap || 24, ai: 'center', p: [o.util ? 16 : 12, 0], W: 'fill', H: 'hug' });
  logo(m, o.logo);
  const sb = B(m, 'Search (role=search)', { dir: 'row', ai: 'center', W: 'fill', H: box + 4, stroke: C.ink, sw: 1.5, r: RADIUS.md, clip: true });
  const sel = B(sb, 'select · Tüm kategoriler', { dir: 'row', gap: 6, ai: 'center', p: [0, 16], W: 'hug', H: 'fill', bg: C.ivory }); T(sel, 'Tümü', { s, w: 500 }); I(sel, 'chevD', { s: 18 });
  const inp = B(sb, 'input', { dir: 'row', gap: 8, ai: 'center', p: [0, 16], W: 'fill', H: 'fill', clip: true }); T(inp, 'Ürün, tedarikçi veya kategori ara', { s, c: C.muted, name: 'placeholder' });
  I(sb, 'camera', { box: box + 4, s: 22, name: 'button · Görselle ara' });
  const go = B(sb, 'button · Ara', { dir: 'row', gap: 8, ai: 'center', p: [0, 24], H: 'fill', W: 'hug', bg: C.ink }); I(go, 'search', { s: 20, c: C.onDark }); T(go, 'Ara', { s, w: 600, c: C.onDark });
  for (const [ic, l] of [['msg', 'Mesajlar'], ['cart', 'Sepet (3)'], ['user', 'Hesabım']]) iconLabel(m, ic, l, s, box);
  if (!o.nav) BTN(m, 'Teklif İste', { kind: 'secondary', icon: 'rfq', h: box + 4, s });
  if (o.nav) {
    DIV(h);
    const n = B(h, 'primary-nav (nav aria-label=Ana menü)', { dir: 'row', gap: o.navGap || 28, ai: 'center', W: 'fill', H: box + 12 });
    const k = B(n, 'button · Tüm kategoriler (mega menü)', { dir: 'row', gap: 8, ai: 'center', W: 'hug', H: 'fill' }); I(k, 'menu', { s: 20 }); T(k, 'Kategoriler', { s, w: 700, up: true, ls: 1.2 });
    for (const t of ['Flash Fırsatlar', 'Seçkin Üreticiler', 'Yeni Gelenler', 'Bölgesel Pazarlar'].concat(o.moreNav || []))
      T(n, t, { s, w: 600, up: true, ls: 1.2, c: t === 'Flash Fırsatlar' ? C.accent : C.ink, name: 'link · ' + t });
    SPACER(n, { W: 'fill' });
    BTN(n, 'Teklif İste', { kind: 'primary', icon: 'rfq', h: box, s });
  }
  DIV(h);
  return h;
}
function buildHeaderTV() {
  const h = B(null, 'Header/tv-10ft', { dir: 'row', gap: 48, ai: 'center', p: [54, 96, 24, 96], W: 1920, H: 'hug', bg: C.ink });
  logo(h, 40, true);
  const tabs = B(h, 'tabs (D-pad ←/→)', { dir: 'row', gap: 16, ai: 'center', W: 'fill', H: 'hug' });
  ['Keşfet', 'Kategoriler', 'Flash Fırsatlar', 'Üreticiler', 'Tekliflerim'].forEach((t, i) => {
    const b = B(tabs, `tab · ${t}${i === 0 ? ' [focused]' : ''}`, { dir: 'row', ai: 'center', p: [0, 28], H: 64, W: 'hug', r: RADIUS.md, bg: i === 0 ? C.paper : undefined });
    T(b, t, { s: 28, w: 600, c: i === 0 ? C.ink : C.onDark });
    if (i === 0) b.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }];
  });
  I(h, 'search', { box: 64, s: 32, c: C.onDark, name: 'button · Sesli / metin arama' });
  I(h, 'user', { box: 64, s: 32, c: C.onDark, name: 'button · Profil' });
  return h;
}
function buildCard(kind) { // compact | regular | large | xl
  const s = { compact: 16, regular: 16, large: 18, xl: 20 }[kind], w = { compact: 170, regular: 260, large: 300, xl: 360 }[kind];
  const pad = kind === 'compact' ? 0 : 0;
  const c = B(null, `ProductCard/${kind}`, { dir: 'column', gap: kind === 'compact' ? 8 : 12, W: w, H: 'hug', p: pad });
  const im = B(c, 'media', { dir: 'column', W: 'fill', H: w, clip: true, r: RADIUS.md, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: TONES[0][0], opacity: 1, offset: 0 }, { color: TONES[0][1], opacity: 1, offset: 1 }] } });
  const fav = I(im, 'heart', { box: kind === 'compact' ? 44 : 48, s: 22, bg: C.paper, r: RADIUS.lg, name: 'button · Favorilere ekle' });
  fav.layoutChild.absolute = true; penpotUtils.setParentXY(fav, w - (kind === 'compact' ? 52 : 60), 8);
  const body = B(c, 'body', { dir: 'column', gap: 4, W: 'fill', H: 'hug' });
  T(body, 'Ürün adı', { s, w: 500, fill: true, name: 'title', lh: 1.4 });
  const pr = B(body, 'price-row', { dir: 'row', gap: 4, ai: 'end', W: 'fill', H: 'hug', wrap: true });
  T(pr, '₺0', { s: s + 2, w: 700, name: 'price' }); T(pr, '/ adet', { s, c: C.muted, name: 'unit' });
  T(body, 'Min. sipariş: 1 adet', { s, c: C.muted, fill: true, name: 'moq' });
  const sup = B(body, 'supplier', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' });
  I(sup, 'shield', { s: 18, c: C.ok, name: 'icon · Doğrulanmış tedarikçi' }); T(sup, 'Tedarikçi · Şehir', { s, c: C.muted, fill: true, name: 'supplier' });
  return c;
}
function buildCardTV(focused) {
  const c = B(null, `ProductCard/tv/${focused ? 'focused' : 'default'}`, { dir: 'column', gap: 16, p: 16, W: 360, H: 'hug', r: RADIUS.lg, bg: focused ? C.paper : C.inkSoft });
  B(c, 'media', { W: 'fill', H: 220, r: RADIUS.md, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: TONES[0][0], opacity: 1, offset: 0 }, { color: TONES[0][1], opacity: 1, offset: 1 }] } });
  T(c, 'Ürün adı', { s: 28, w: 600, fill: true, name: 'title', c: focused ? C.ink : C.onDark, lh: 1.3 });
  T(c, '₺0 / adet', { s: 28, w: 700, name: 'price', c: focused ? C.ink : C.onDark });
  T(c, 'Min. sipariş: 1 adet', { s: 24, name: 'moq', c: focused ? C.muted : C.onDarkMuted, fill: true });
  if (focused) c.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 6, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }];
  return c;
}
function buildFooter(kind) { // compact | regular | large | xl
  const s = { compact: 16, regular: 16, large: 18, xl: 20 }[kind], w = { compact: 390, regular: 1280, large: 2560, xl: 3840 }[kind];
  const pad = { compact: 16, regular: 40, large: 160, xl: 320 }[kind];
  const f = B(null, `Footer/${kind}`, { dir: 'column', gap: kind === 'compact' ? 16 : 40, p: [kind === 'compact' ? 32 : 64, pad, kind === 'compact' ? 32 : 40, pad], W: w, H: 'hug', bg: C.ink });
  const nl = B(f, 'newsletter', { dir: kind === 'compact' ? 'column' : 'row', gap: 16, ai: kind === 'compact' ? 'stretch' : 'end', W: 'fill', H: 'hug' });
  const tt = B(nl, 'copy', { dir: 'column', gap: 4, W: 'fill', H: 'hug' });
  T(tt, 'Flash fırsatları ilk siz duyun', { f: 'serif', s: s + 12, c: C.onDark, fill: true, w: 500 });
  T(tt, 'Her sabah 09.00’da yeni satış etkinlikleri. İstediğiniz zaman ayrılabilirsiniz.', { s, c: C.onDarkMuted, fill: true });
  const fm = B(nl, 'form', { dir: 'row', gap: 8, W: kind === 'compact' ? 'fill' : 520, H: 'hug', ai: 'end' });
  FIELD(fm, 'E-posta adresi', { ph: 'ornek@firma.com.tr', dark: true, s });
  BTN(fm, 'Abone ol', { kind: 'onDark', s });
  DIV(f, { c: '#3A3633' });
  const cols = [['Alıcılar için', ['Teklif iste (RFQ)', 'Ticaret Güvencesi', 'Numune talebi', 'Lojistik ve gümrük']], ['Tedarikçiler için', ['Tedarikçi olun', 'Mağaza yönetimi', 'Reklam çözümleri', 'Eğitim merkezi']], ['Arasta', ['Hakkımızda', 'Basın', 'Kariyer', 'Sürdürülebilirlik']], ['Yardım', ['Yardım Merkezi', 'Anlaşmazlık çözümü', 'Güvenlik', 'Erişilebilirlik beyanı']]];
  if (kind === 'compact') {
    for (const [hd] of cols) { const r = B(f, `accordion · ${hd} (aria-expanded=false)`, { dir: 'row', ai: 'center', jc: 'space-between', W: 'fill', H: 48 }); T(r, hd, { s, w: 600, c: C.onDark }); I(r, 'chevD', { s: 20, c: C.onDark }); }
  } else {
    const g = B(f, 'link-columns', { dir: 'row', gap: 40, W: 'fill', H: 'hug' });
    for (const [hd, ls] of cols) { const c = B(g, 'column · ' + hd, { dir: 'column', gap: 12, W: 'fill', H: 'hug' }); T(c, hd, { s, w: 700, c: C.onDark, up: true, ls: 1.4 }); ls.forEach((l) => T(c, l, { s, c: C.onDarkMuted, name: 'link · ' + l })); }
  }
  DIV(f, { c: '#3A3633' });
  const lg = B(f, 'legal', { dir: kind === 'compact' ? 'column' : 'row', gap: 16, W: 'fill', H: 'hug', jc: 'space-between' });
  T(lg, '© 2026 Arasta Ticaret A.Ş. · MERSİS 0123-4567-8901-2345', { s, c: C.onDarkMuted, fill: kind === 'compact' });
  const ll = B(lg, 'legal-links', { dir: 'row', gap: 16, W: 'hug', H: 'hug', wrap: true });
  ['KVKK Aydınlatma', 'Çerez tercihleri', 'Kullanım koşulları'].forEach((l) => T(ll, l, { s, c: C.onDark, u: true }));
  return f;
}

// ---------- instancing helpers ----------
const COMPS = () => penpot.library.local.components;
function comp(path) { const [p, n] = [path.split('/').slice(0, -1).join(' / '), path.split('/').pop()]; return COMPS().find((c) => c.name === n && (c.path || '').replace(/\s*\/\s*/g, ' / ') === p) || COMPS().find((c) => `${c.path}/${c.name}`.replace(/\s/g, '') === path.replace(/\s/g, '')); }
function INST(parent, path, o = {}) {
  const c = comp(path); if (!c) throw new Error('component not found: ' + path);
  const i = c.instance(); parent.appendChild(i);
  if (i.layoutChild) { if (o.W === 'fill' || o.W == null) i.layoutChild.horizontalSizing = 'fill'; if (typeof o.W === 'number') { i.layoutChild.horizontalSizing = 'fix'; i.resize(o.W, i.height); } }
  return i;
}
function SET(inst, name, text) { const t = penpotUtils.findShape((s) => s.name === name && s.type === 'text', inst); if (t) t.characters = text; return t; }
function CARD(parent, d, p, cellW, imgH) {
  if (d.fam === 'tv') return null;
  const i = INST(parent, `ProductCard/${d.card}`);
  SET(i, 'title', p.n); SET(i, 'price', p.p); SET(i, 'unit', p.u); SET(i, 'moq', 'Min. sipariş: ' + p.m); SET(i, 'supplier', `${p.s} · ${p.c}`);
  if (cellW) { i.resize(cellW, i.height); i.layoutChild.horizontalSizing = 'fix'; i.layoutChild.verticalSizing = 'auto'; }
  const m = penpotUtils.findShape((s) => s.name === 'media', i);
  if (m) {
    const [a, z] = TONES[p.t % TONES.length];
    m.fills = [{ fillOpacity: 1, fillColorGradient: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: a, opacity: 1, offset: 0 }, { color: z, opacity: 1, offset: 1 }] } }];
    if (cellW) { m.resize(cellW, Math.round(imgH || cellW)); m.layoutChild.horizontalSizing = 'fill'; }
    const fav = m.children.find((c) => c.name.startsWith('button · Favori'));
    if (fav && cellW) penpotUtils.setParentXY(fav, cellW - fav.width - 8, 8);
  }
  i.name = 'ProductCard · ' + p.n;
  return i;
}
