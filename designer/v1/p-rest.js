// Builders for pages 11–19 (runs inside Penpot via MCP)
const WIDE = (d) => ['tabletL', 'desktop', 'wide', 'ultra'].includes(d.fam);
const SIDEW = (d) => ({ tabletL: 280, desktop: 300, wide: 380, ultra: 460 }[d.fam] || 0);
function H1(parent, d, text, o = {}) { return T(parent, text, { f: 'serif', s: o.s || Math.round(d.ts.h1 * 0.75), w: 500, fill: true, lh: 1.1, c: d.dark ? C.onDark : C.ink, name: 'h1 · ' + text }); }
function PAGEHEAD(main, d, crumbs, title, sub) {
  const s = SECTION(main, 'Sayfa başlığı', d, { pt: d.gap * 1.5, pb: 8, gap: 8 });
  if (crumbs && d.fam !== 'phone') BREAD(s, d, crumbs);
  H1(s, d, title);
  if (sub) T(s, sub, { s: d.ts.b, c: C.muted, fill: true });
  return s;
}
function TWO(main, d, name, leftW, o = {}) { // two-column container: fixed left + fixed right (no fill-only rows)
  const s = SECTION(main, name, d, { dir: 'row', gap: o.gap ?? d.gap * 1.5, ai: 'start', pt: o.pt, pb: o.pb });
  const L = B(s, o.ln || 'col-left', { dir: 'column', gap: d.gap, W: leftW, H: 'hug' });
  const R = B(s, o.rn || 'col-right', { dir: 'column', gap: d.gap, W: d.cw - leftW - (o.gap ?? d.gap * 1.5), H: 'hug' });
  return [L, R, s];
}
function BOX(parent, name, o = {}) { return B(parent, name, { dir: o.dir || 'column', gap: o.gap ?? 12, p: o.p ?? 20, W: o.W ?? 'fill', H: 'hug', bg: o.bg ?? C.paper, stroke: o.stroke ?? C.line, r: o.r ?? RADIUS.md, ai: o.ai, jc: o.jc }); }
function KV(parent, d, rows, o = {}) {
  const t = B(parent, o.name || 'Özellik tablosu (table)', { dir: 'column', W: 'fill', H: 'hug', stroke: C.line, r: RADIUS.md, clip: true });
  rows.forEach(([k, v], i) => {
    const r = B(t, 'row · ' + k, { dir: d.w < 400 ? 'column' : 'row', gap: d.w < 400 ? 2 : 16, p: [12, 16], W: 'fill', H: 'hug', bg: i % 2 ? C.paper : C.ivory });
    const kk = T(r, k, { s: d.ts.b, w: 600, name: 'th · ' + k }); if (d.w >= 400) { kk.resize(Math.round(Math.min(260, d.cw * 0.36)), kk.height); kk.growType = 'auto-height'; }
    T(r, v, { s: d.ts.b, fill: true, name: 'td' });
  });
  return t;
}
function QR(parent, size, label) {
  const q = B(parent, 'QR kod · ' + label, { dir: 'column', gap: 12, ai: 'center', p: 24, W: 'hug', H: 'hug', bg: C.paper, r: RADIUS.lg });
  const g = B(q, 'qr-matrix (dekoratif, aria-hidden)', { dir: 'none', W: size, H: size, bg: C.paper });
  const m = size / 25;
  const cells = [[0, 0, 7], [18, 0, 7], [0, 18, 7]];
  for (const [cx, cy, n] of cells) { for (const [o, col] of [[0, C.ink], [1, C.paper], [2, C.ink]]) { const r = penpot.createRectangle(); g.appendChild(r); r.resize((n - o * 2) * m, (n - o * 2) * m); penpotUtils.setParentXY(r, (cx + o) * m, (cy + o) * m); r.fills = [{ fillColor: col, fillOpacity: 1 }]; } }
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < 25; y += 1) for (let x = 0; x < 25; x += 1) { if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue; if (rnd() > 0.55) { const r = penpot.createRectangle(); g.appendChild(r); r.resize(m, m); penpotUtils.setParentXY(r, x * m, y * m); r.fills = [{ fillColor: C.ink, fillOpacity: 1 }]; } }
  T(q, label, { s: 24, w: 600, align: 'center' });
  return q;
}
function TV_SHELL(d, title, x, y) { return SHELL(d, title, x, y); }
function TV_SPLIT(sh, d, leftFn, rightFn) {
  const r = B(sh.main, 'TV içerik', { dir: 'row', gap: 64, ai: 'start', p: [32, 96, 0, 96], W: 'fill', H: 'hug' });
  const L = B(r, 'sol', { dir: 'column', gap: 24, W: 1000, H: 'hug' }); leftFn(L);
  const R = B(r, 'sağ', { dir: 'column', gap: 24, W: 1920 - 192 - 64 - 1000, H: 'hug', ai: 'start' }); rightFn(R);
  const hint = TV_HINT(sh.f); hint.layoutChild.absolute = true; hint.resize(d.w, 110); penpotUtils.setParentXY(hint, 0, d.h - 110); hint.fills = [{ fillColor: C.ink, fillOpacity: 1 }];
  return r;
}
function TVT(parent, text, o = {}) { return T(parent, text, { s: o.s || 28, w: o.w || 400, c: o.c || C.onDark, fill: o.fill ?? true, f: o.f, lh: o.lh, up: o.up, ls: o.ls, name: o.name }); }
function TV_HANDOFF(d, title, x, y, o) {
  const sh = TV_SHELL(d, title, x, y);
  TV_SPLIT(sh, d, (L) => {
    TVT(L, o.over, { s: 24, w: 600, up: true, ls: 2, c: C.goldOnDark });
    TVT(L, o.h1, { f: 'serif', s: 64, w: 500, lh: 1.08 });
    TVT(L, o.body, { c: C.onDarkMuted, lh: 1.5 });
    if (o.steps) o.steps.forEach((s, i) => { const r = B(L, 'adım ' + (i + 1), { dir: 'row', gap: 20, ai: 'center', W: 'fill', H: 'hug' }); const n = B(r, 'num', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: RADIUS.lg, bg: C.inkSoft }); T(n, String(i + 1), { s: 28, w: 700, c: C.onDark }); TVT(r, s); });
    if (o.code) { const c = B(L, 'Cihaz kodu (aria-label: K 7 4 Q X)', { dir: 'row', gap: 16, W: 'hug', H: 'hug' }); o.code.split('').forEach((ch) => { const b = B(c, 'kod · ' + ch, { dir: 'row', ai: 'center', jc: 'center', W: 88, H: 104, r: RADIUS.md, bg: C.paper }); T(b, ch, { s: 56, w: 700, f: 'sans' }); }); }
    const btns = B(L, 'eylemler', { dir: 'row', gap: 24, W: 'fill', H: 'hug' });
    const b1 = BTN(btns, o.cta || 'Yeni kod al', { kind: 'onDark', h: 64, s: 28, px: 32 }); b1.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }]; b1.name += ' [focused]';
    BTN(btns, 'Geri', { kind: 'outlineDark', h: 64, s: 28, px: 32 });
  }, (R) => { QR(R, 320, o.qr); if (o.side) TVT(R, o.side, { s: 24, c: C.onDarkMuted }); });
  return END(sh, d, { tab: null });
}

// ---------- 11 · Listing ----------
BUILD.listing = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, 'Kategori', x, y);
    const top = B(sh.main, 'başlık + filtre sekmeleri', { dir: 'column', gap: 20, p: [16, 96, 24, 96], W: 'fill', H: 'hug' });
    TVT(top, 'Tekstil ve Hazır Giyim', { f: 'serif', s: 56, w: 500, fill: false });
    const tabs = B(top, 'filtreler (D-pad)', { dir: 'row', gap: 16, W: 'fill', H: 'hug' });
    ['Tümü', 'Ticaret Güvencesi', 'Denizli', 'MOQ ≤ 500', 'Organik'].forEach((t, i) => { const c = CHIP(tabs, t, { on: i === 1, h: 64, s: 24 }); if (i === 0) { c.strokes = [...c.strokes, { strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }]; c.name += ' [focused]'; } });
    TV_ROW(sh.main, '12.480 ürün · Önerilen sıralama', PRODS.slice(0, 5), -1);
    const hint = TV_HINT(sh.f); hint.layoutChild.absolute = true; hint.resize(d.w, 110); penpotUtils.setParentXY(hint, 0, d.h - 110); hint.fills = [{ fillColor: C.ink, fillOpacity: 1 }];
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Kategori & Arama', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Kategoriler', 'Tekstil & Hazır Giyim'], 'Tekstil ve Hazır Giyim', '12.480 ürün · 1.320 doğrulanmış tedarikçi');
  const chips = ['Ticaret Güvencesi', 'Denizli', 'MOQ ≤ 500'];
  if (!WIDE(d)) {
    const s = SECTION(sh.main, 'Araç çubuğu', d, { gap: 12, pt: 8, pb: 0 });
    const tb = B(s, 'toolbar', { dir: 'row', gap: 12, W: 'fill', H: 'hug' });
    const bw = (d.cw - 12) / 2;
    BTN(tb, 'Filtrele (3)', { kind: 'secondary', icon: 'filter', W: bw, s: d.ts.b });
    BTN(tb, 'Sırala: Önerilen', { kind: 'secondary', iconR: 'chevD', W: bw, s: d.ts.b });
    const cr = B(s, 'Uygulanan filtreler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true });
    chips.forEach((c) => CHIP(cr, c, { x: true }));
    LINK(cr, 'Tümünü temizle', { w: 600 });
    PRODUCTS_SEC(sh.main, d, { title: false, rows: d.fam === 'phone' ? (d.cols === 1 ? 4 : 3) : 3, name: 'Sonuçlar' });
  } else {
    const [L, R] = TWO(sh.main, d, 'Filtre + sonuçlar', SIDEW(d), { ln: 'Filtreler (aside, form)', rn: 'Sonuçlar' });
    const grp = (t, fn) => { const g = B(L, 'fieldset · ' + t, { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); T(g, t, { s: d.ts.b, w: 700, up: true, ls: 1.2, name: 'legend · ' + t }); fn(g); DIV(L); };
    grp('Tedarikçi', (g) => { CHECK(g, 'Doğrulanmış üretici', true, { s: d.ts.b }); CHECK(g, 'Ticaret Güvencesi', true, { s: d.ts.b }); CHECK(g, 'Yerinde denetimli', false, { s: d.ts.b }); });
    grp('Min. sipariş (MOQ)', (g) => { const r = B(g, 'aralık', { dir: 'row', gap: 8, W: 'fill', H: 'hug' }); const fw = (SIDEW(d) - 8) / 2; FIELD(r, 'En az', { ph: '0', W: fw, s: d.ts.b }); FIELD(r, 'En çok', { value: '500', W: fw, s: d.ts.b }); });
    grp('Şehir', (g) => { [['Denizli', '1.204', true], ['Bursa', '986'], ['İstanbul', '2.310'], ['Uşak', '312']].forEach(([c, n, on]) => CHECK(g, c, !!on, { count: n, s: d.ts.b })); });
    grp('Sertifika', (g) => { ['GOTS', 'OEKO-TEX', 'ISO 9001'].forEach((c, i) => CHECK(g, c, i === 0, { s: d.ts.b })); });
    BTN(L, 'Filtreleri uygula', { kind: 'primary', W: 'fill', s: d.ts.b });
    const tb = B(R, 'toolbar', { dir: 'row', gap: 12, ai: 'center', jc: 'space-between', W: 'fill', H: 'hug' });
    const cr = B(tb, 'Uygulanan filtreler', { dir: 'row', gap: 8, ai: 'center', W: 'hug', H: 'hug' }); chips.forEach((c) => CHIP(cr, c, { x: true, s: d.ts.b })); LINK(cr, 'Tümünü temizle', { w: 600, s: d.ts.b });
    FIELD(tb, 'Sırala', { select: true, value: 'Önerilen', W: 240, s: d.ts.b });
    const cols = d.cols - 1, rw = d.cw - SIDEW(d) - d.gap * 1.5;
    ROWS(R, PRODS.slice(0, cols * 3), cols, d.gap, (r, p, k, cw) => CARD(r, d, p, cw, cw), 'Ürün ızgarası', rw);
  }
  const pg = SECTION(sh.main, 'Sayfalama', d, { ai: 'center', gap: 8, pt: 8 });
  BTN(pg, 'Daha fazla ürün yükle', { kind: 'secondary', W: d.fam === 'phone' ? 'fill' : 'hug', s: d.ts.b });
  T(pg, '36 / 12.480 ürün gösteriliyor', { s: d.ts.b, c: C.muted });
  return END(sh, d, { tab: 'Kategori' });
};

// ---------- 12 · PDP ----------
function tierTable(parent, d, w) {
  const tiers = [['500 – 1.999 m', '₺142,50'], ['2.000 – 9.999 m', '₺129,00'], ['≥ 10.000 m', '₺118,00']];
  const t = B(parent, 'Kademeli fiyat (table)', { dir: 'row', gap: 0, W: 'fill', H: 'hug', stroke: C.line, r: RADIUS.md, clip: true, bg: C.ivory });
  const cw = w / 3;
  tiers.forEach(([q, p], i) => { const c = B(t, 'kademe · ' + q, { dir: 'column', gap: 2, p: [12, 12], W: cw, H: 'hug', bg: i === 1 ? C.paper : undefined }); T(c, p, { s: d.ts.p + 2, w: 700, fill: true }); T(c, q, { s: d.ts.b, c: C.muted, fill: true }); if (i === 1) BADGE(c, 'Seçili miktar', { s: d.ts.b, icon: 'check', c: C.ok }); });
  return t;
}
function pdpInfo(C1, d, w) {
  const sup = B(C1, 'tedarikçi satırı', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true });
  LINK(sup, 'Ege Tekstil A.Ş.', { w: 600, s: d.ts.b }); BADGE(sup, 'Doğrulanmış · 12 yıl', { icon: 'shield', c: C.ok, s: d.ts.b }); T(sup, 'Denizli', { s: d.ts.b, c: C.muted });
  H1(C1, d, 'Organik pamuk penye kumaş, 180 g/m², GOTS sertifikalı', { s: Math.round(d.ts.h2 * (d.fam === 'phone' ? 1 : 1.05)) });
  RATING(C1, '4,8', '(312 değerlendirme · 1.940 sipariş)', { s: d.ts.b });
  tierTable(C1, d, w);
  T(C1, 'Min. sipariş: 500 metre · Numune: ₺450 (kargo dahil)', { s: d.ts.b, c: C.muted, fill: true });
  const col = B(C1, 'fieldset · Renk: Ekru', { dir: 'column', gap: 8, W: 'fill', H: 'hug' }); T(col, 'Renk: Ekru', { s: d.ts.b, w: 600, name: 'legend' });
  const cr = B(col, 'renkler (radiogroup)', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); ['Ekru', 'Antrasit', 'Lacivert', 'Bordo'].forEach((c, i) => CHIP(cr, c, { on: i === 0, s: d.ts.b, h: 44 }));
  const q = B(C1, 'miktar', { dir: d.w < 400 ? 'column' : 'row', gap: 12, ai: d.w < 400 ? 'start' : 'center', W: 'fill', H: 'hug' });
  const ql = B(q, 'label', { dir: 'column', gap: 6, W: 'hug', H: 'hug' }); T(ql, 'Miktar (metre)', { s: d.ts.b, w: 600 }); STEPPER(ql, '2.000', { s: d.ts.b, h: d.tgt + 4 });
  const st = B(q, 'ara toplam (aria-live=polite)', { dir: 'column', gap: 2, W: 'hug', H: 'hug' }); T(st, 'Ara toplam', { s: d.ts.b, c: C.muted }); T(st, '₺258.000', { s: d.ts.h3, w: 700 });
  if (d.fam !== 'phone') {
    const act = B(C1, 'eylemler', { dir: 'column', gap: 12, W: 'fill', H: 'hug' });
    BTN(act, 'Sepete ekle', { kind: 'primary', icon: 'cart', W: 'fill', h: d.tgt + 4, s: d.ts.b });
    const r2 = B(act, 'ikincil eylemler', { dir: 'row', gap: 12, W: 'fill', H: 'hug' });
    const hw = (w - 12) / 2;
    BTN(r2, 'Numune iste', { kind: 'secondary', W: hw, h: d.tgt + 4, s: d.ts.b }); BTN(r2, 'Tedarikçiye yaz', { kind: 'secondary', icon: 'msg', W: hw, h: d.tgt + 4, s: d.ts.b });
  }
  const ta = BOX(C1, 'Ticaret Güvencesi kutusu', { bg: C.ivory, stroke: C.line, dir: 'row', ai: 'start' });
  I(ta, 'shield', { s: 24, c: C.ok });
  const tt = B(ta, 'metin', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); T(tt, 'Ticaret Güvencesi ile korunur', { s: d.ts.b, w: 700, fill: true }); T(tt, 'Ödemeniz, ürünleri teslim alıp onaylayana kadar Arasta emanetinde kalır. Kalite veya gecikme sorununda iade.', { s: d.ts.b, c: C.muted, fill: true });
}
BUILD.pdp = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, 'Ürün Detayı', x, y);
    TV_SPLIT(sh, d, (L) => { IMG(L, 'Organik pamuk penye kumaş rulosu, yakın çekim', { H: 620, tone: 0, r: RADIUS.lg, p: 24 }); }, (R) => {
      TVT(R, 'Ege Tekstil A.Ş. · Doğrulanmış', { s: 24, c: C.goldOnDark, w: 600 });
      TVT(R, 'Organik pamuk penye kumaş, 180 g/m²', { f: 'serif', s: 48, lh: 1.1 });
      TVT(R, '₺118,00 – ₺142,50 / metre', { s: 36, w: 700 }); TVT(R, 'Min. sipariş: 500 metre', { c: C.onDarkMuted });
      const b = BTN(R, 'Telefona gönder ve teklif iste', { kind: 'onDark', h: 64, s: 28, px: 32, icon: 'rfq' }); b.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }]; b.name += ' [focused]';
      BTN(R, 'Favorilere ekle', { kind: 'outlineDark', h: 64, s: 28, px: 32, icon: 'heart' });
    });
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Ürün Detayı', x, y);
  const crumbs = ['Ana sayfa', 'Tekstil', 'Örme kumaş', 'Organik penye'];
  if (d.fam !== 'phone') { const b = SECTION(sh.main, 'Breadcrumb', d, { pt: 16, pb: 0 }); BREAD(b, d, crumbs); }
  const galW = WIDE(d) ? Math.round(d.cw * 0.56) : d.cw;
  let G, I2;
  if (WIDE(d)) { [G, I2] = TWO(sh.main, d, 'Ürün üst bölüm', galW, { ln: 'Galeri', rn: 'Ürün bilgisi', pt: 16 }); }
  else { const s = SECTION(sh.main, 'Ürün üst bölüm', d, { pt: d.fam === 'phone' ? 8 : 16 }); G = B(s, 'Galeri', { dir: 'column', gap: 12, W: 'fill', H: 'hug' }); I2 = B(s, 'Ürün bilgisi', { dir: 'column', gap: d.gap, W: 'fill', H: 'hug' }); }
  const main = IMG(G, 'Organik pamuk penye kumaş rulosu, yakın çekim', { H: Math.round(galW * (WIDE(d) ? 0.8 : 0.9)), tone: 0, r: RADIUS.md });
  main.flex.justifyContent = 'space-between'; COUNTDOWN(main, '23 sa 14 dk', { s: d.ts.b }); main.children[0] && main.appendChild(main.children[0]);
  const th = B(G, 'küçük görseller (tablist)', { dir: 'row', gap: 8, W: 'fill', H: 'hug' });
  const tw = (galW - 8 * 4) / 5;
  for (let i = 0; i < 5; i++) { const t = IMG(th, ['Rulo', 'Doku', 'Renk kartı', 'Üretim hattı', 'Sertifika'][i], { W: tw, H: Math.round(tw), tone: [0, 0, 2, 3, 4][i], r: RADIUS.sm, caption: false }); if (i === 0) FOCUS(t); }
  pdpInfo(I2, d, WIDE(d) ? d.cw - galW - d.gap * 1.5 : d.cw);
  const sp = SECTION(sh.main, 'Ürün özellikleri', d);
  HEAD(sp, d, 'Teknik bilgiler', 'Ürün özellikleri');
  KV(sp, d, [['Kompozisyon', '%100 organik pamuk'], ['Gramaj', '180 g/m² (±%5)'], ['En', '180 cm, açık en'], ['Sertifikalar', 'GOTS, OEKO-TEX Standard 100'], ['Menşe', 'Denizli, Türkiye'], ['Üretim süresi', '2.000 m için 12–15 iş günü'], ['Paketleme', 'Rulo başına 50 m, su geçirmez ambalaj']]);
  PRODUCTS_SEC(sh.main, d, { over: 'Benzer ürünler', title: 'Bunlar da ilginizi çekebilir', rows: 1, offset: 4 });
  return END(sh, d, {
    tab: 'Keşfet', sticky: (f) => {
      const bar = B(f, 'Sabit eylem çubuğu (ürün)', { dir: 'row', gap: 12, ai: 'center', p: [12, 16, 16, 16], W: d.w, H: 'hug', bg: C.paper, stroke: C.line });
      I(bar, 'msg', { box: 48, s: 22, stroke: C.border, r: RADIUS.sm, name: 'button · Tedarikçiye yaz' });
      BTN(bar, 'Sepete ekle · ₺258.000', { kind: 'primary', W: d.w - 32 - 48 - 12, s: 16 });
      return bar;
    },
  });
};

// ---------- 13 · Supplier store ----------
BUILD.store = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, 'Tedarikçi Mağazası', x, y);
    const top = B(sh.main, 'kimlik', { dir: 'row', gap: 32, ai: 'center', p: [16, 96, 24, 96], W: 'fill', H: 'hug' });
    const lg = B(top, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 120, H: 120, r: RADIUS.lg, bg: C.paper }); T(lg, 'ET', { f: 'serif', s: 48, w: 600 });
    const t = B(top, 'ad', { dir: 'column', gap: 8, W: 'fill', H: 'hug' }); TVT(t, 'Ege Tekstil A.Ş.', { f: 'serif', s: 56, w: 500 }); TVT(t, 'Doğrulanmış üretici · Denizli · 12 yıl · Yanıt ≤ 4 saat', { c: C.onDarkMuted });
    const b = BTN(top, 'Takip et', { kind: 'onDark', h: 64, s: 28, px: 32 }); b.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }];
    TV_ROW(sh.main, 'Mağazanın çok satanları', PRODS.slice(0, 5), -1);
    const hint = TV_HINT(sh.f); hint.layoutChild.absolute = true; hint.resize(d.w, 110); penpotUtils.setParentXY(hint, 0, d.h - 110); hint.fills = [{ fillColor: C.ink, fillOpacity: 1 }];
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Tedarikçi Mağazası', x, y);
  const cover = B(sh.main, 'Kapak', { dir: 'column', W: 'fill', H: 'hug' });
  IMG(cover, 'Ege Tekstil üretim tesisi, Denizli', { H: Math.round(Math.min(d.w * 0.32, 520)), tone: 0 });
  const id = SECTION(sh.main, 'Tedarikçi kimliği', d, { dir: d.w < 700 ? 'column' : 'row', ai: d.w < 700 ? 'start' : 'center', gap: d.gap, pt: d.gap });
  const lgs = Math.round(d.tgt * 2);
  const lg = B(id, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: lgs, H: lgs, r: RADIUS.lg, bg: C.ivory, stroke: C.line }); T(lg, 'ET', { f: 'serif', s: Math.round(lgs * 0.36), w: 600 });
  const nm = B(id, 'ad ve rozetler', { dir: 'column', gap: 8, W: d.w < 700 ? 'fill' : Math.round(d.cw * 0.5), H: 'hug' });
  H1(nm, d, 'Ege Tekstil A.Ş.');
  const bd = B(nm, 'rozetler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); BADGE(bd, 'Doğrulanmış üretici', { icon: 'shield', c: C.ok, s: d.ts.b }); BADGE(bd, '12 yıl', { s: d.ts.b }); BADGE(bd, 'Denizli', { s: d.ts.b }); RATING(bd, '4,8', '(312)', { s: d.ts.b });
  const act = B(id, 'eylemler', { dir: 'row', gap: 12, W: 'hug', H: 'hug', wrap: true });
  BTN(act, 'Tedarikçiye yaz', { kind: 'primary', icon: 'msg', s: d.ts.b }); BTN(act, 'Takip et', { kind: 'secondary', s: d.ts.b });
  const stats = SECTION(sh.main, 'Performans', d, { pt: 0 });
  const sc = d.fam === 'phone' ? 2 : 4;
  ROWS(stats, [['≤ 4 saat', 'Ortalama yanıt süresi'], ['%98,6', 'Zamanında teslimat'], ['$10–25 M', 'Yıllık ihracat'], ['250+', 'Çalışan']], sc, d.gap, (r, [v, l]) => { const c = BOX(r, 'stat · ' + l, { bg: C.ivory, stroke: C.ivory, gap: 4, p: 16 }); T(c, v, { f: 'serif', s: d.ts.h3, w: 600, fill: true }); T(c, l, { s: d.ts.b, c: C.muted, fill: true }); return c; }, 'grid', d.cw);
  const tabs = SECTION(sh.main, 'Sekmeler (tablist)', d, { pt: 0, pb: 0 });
  const tr = B(tabs, 'tabs', { dir: 'row', gap: d.fam === 'phone' ? 20 : 32, W: 'fill', H: 'hug', clip: true });
  ['Ürünler', 'Şirket profili', 'Sertifikalar (3)', 'Değerlendirmeler (312)'].forEach((t, i) => { const b = B(tr, `tab · ${t}${i === 0 ? ' (aria-selected=true)' : ''}`, { dir: 'column', jc: 'center', H: d.tgt + 4, W: 'hug' }); T(b, t, { s: d.ts.b, w: i === 0 ? 700 : 500, u: i === 0, c: i === 0 ? C.ink : C.muted }); });
  DIV(tabs);
  PRODUCTS_SEC(sh.main, d, { over: 'Mağaza', title: 'Çok satan ürünler', rows: 2 });
  const fac = SECTION(sh.main, 'Fabrika', d, { bg: C.ivory });
  HEAD(fac, d, 'Yerinde denetim · Mart 2026', 'Üretim tesisi');
  const fc = d.fam === 'phone' ? 1 : 3;
  ROWS(fac, ['Örme hattı, 42 makine', 'Boyahane ve arıtma tesisi', 'Kalite kontrol laboratuvarı'], fc, d.gap, (r, t, k, cw) => { const c = B(r, 'foto · ' + t, { dir: 'column', gap: 8, W: 'fill', H: 'hug' }); IMG(c, t, { H: Math.round(cw * 0.62), tone: k + 1, r: RADIUS.md, caption: false }); T(c, t, { s: d.ts.b, fill: true }); return c; }, 'grid', d.cw);
  return END(sh, d, { tab: 'Keşfet' });
};

// ---------- 14 · RFQ ----------
function rfqForm(F, d, w) {
  const err = B(F, 'Hata özeti (role=alert, odak buraya taşınır)', { dir: 'row', gap: 12, ai: 'start', p: 16, W: 'fill', H: 'hug', bg: '#FBEDEC', stroke: C.accent, r: RADIUS.md });
  I(err, 'x', { s: 22, c: C.accent }); const et = B(err, 'metin', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); T(et, 'Formda 1 hata var', { s: d.ts.b, w: 700, c: C.accent, fill: true }); LINK(et, 'Miktar: en az 1 olmalı', { c: C.accent, s: d.ts.b });
  const steps = B(F, 'Adımlar (ol, aria-current=step)', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true });
  ['1 · Ürün', '2 · Miktar ve teslimat', '3 · İletişim'].forEach((s, i) => BADGE(steps, s, { s: d.ts.b, bg: i === 1 ? C.ink : C.ivory, c: i === 1 ? C.onDark : i === 0 ? C.ok : C.muted, icon: i === 0 ? 'check' : undefined }));
  const sec = (t) => { const s = B(F, 'fieldset · ' + t, { dir: 'column', gap: 16, W: 'fill', H: 'hug' }); T(s, t, { f: 'serif', s: d.ts.h3, w: 500, fill: true, name: 'legend · ' + t }); return s; };
  const a = sec('Ürün bilgisi');
  FIELD(a, 'Ürün adı', { req: true, value: 'Organik pamuk penye kumaş', s: d.ts.b });
  FIELD(a, 'Kategori', { req: true, select: true, value: 'Tekstil ve Hazır Giyim', s: d.ts.b });
  FIELD(a, 'Ayrıntılar', { area: true, value: '180 g/m², GOTS sertifikalı, ekru ve antrasit renkleri. Numune ile onay sonrası üretim.', help: 'Ölçü, malzeme, sertifika ve ambalaj beklentinizi yazın.', s: d.ts.b });
  const b = sec('Miktar ve teslimat');
  const r1 = B(b, 'miktar satırı', { dir: d.w < 500 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug', ai: 'start' });
  const fw = d.w < 500 ? 'fill' : (w - 12) * 0.6, fw2 = d.w < 500 ? 'fill' : (w - 12) * 0.4;
  FIELD(r1, 'Miktar', { req: true, value: '0', error: 'Miktar en az 1 olmalı. Örnek: 5.000', W: fw, s: d.ts.b, focus: true });
  FIELD(r1, 'Birim', { select: true, value: 'metre', W: fw2, s: d.ts.b });
  FIELD(b, 'Hedef birim fiyat', { opt: true, value: '', ph: '₺ 0,00', suffix: '/ metre', s: d.ts.b });
  const r2 = B(b, 'teslimat satırı', { dir: d.w < 500 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug', ai: 'start' });
  FIELD(r2, 'Teslim ili', { select: true, value: 'İzmir', W: d.w < 500 ? 'fill' : (w - 12) / 2, s: d.ts.b });
  FIELD(r2, 'Son teslim tarihi', { value: '15.11.2026', help: 'GG.AA.YYYY', icon: 'clock', W: d.w < 500 ? 'fill' : (w - 12) / 2, s: d.ts.b });
  CHECK(b, 'Kayıtlı şirket adresimi kullan (Karşıyaka, İzmir)', true, { s: d.ts.b });
  const up = B(b, 'Dosya ekle (isteğe bağlı)', { dir: 'column', gap: 8, ai: 'center', p: 24, W: 'fill', H: 'hug', stroke: C.border, r: RADIUS.md });
  up.strokes = [{ strokeColor: C.border, strokeWidth: 1.5, strokeAlignment: 'inner', strokeOpacity: 1, strokeStyle: 'dashed' }];
  I(up, 'plus', { s: 24 }); T(up, 'Teknik çizim veya görsel ekleyin', { s: d.ts.b, w: 600, align: 'center', fill: true }); T(up, 'PDF, JPG veya PNG · en fazla 20 MB', { s: d.ts.b, c: C.muted, align: 'center', fill: true });
  BTN(up, 'Dosya seç', { kind: 'secondary', s: d.ts.b });
  const c = sec('Tercihler');
  CHECK(c, 'Yalnızca doğrulanmış üreticilerden teklif al', true, { s: d.ts.b });
  CHECK(c, 'Tekliflerin e-posta ile de gelmesini istiyorum', false, { s: d.ts.b });
  const act = B(F, 'form eylemleri', { dir: d.w < 500 ? 'column-reverse' : 'row', gap: 12, W: 'fill', H: 'hug', jc: 'end' });
  BTN(act, 'Taslağı kaydet', { kind: 'secondary', W: d.w < 500 ? 'fill' : 'hug', s: d.ts.b });
  BTN(act, 'Teklif talebini gönder', { kind: 'primary', icon: 'arrowR', W: d.w < 500 ? 'fill' : 'hug', s: d.ts.b });
}
BUILD.rfq = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Teklif İste', x, y, { over: 'Teklif İste (RFQ)', h1: 'Formu telefonunuzda doldurun', body: 'Uzun formlar uzaktan kumandayla zahmetlidir. Kodu telefonunuzla okutun, talebiniz bu ekranda izlenebilir kalsın.', steps: ['Telefon kameranızla QR kodu okutun', 'Formu doldurup gönderin', 'Teklifler burada ve telefonunuzda görünür'], qr: 'arasta.com.tr/rfq', cta: 'Kodu yenile', side: 'Kod 10 dakika geçerlidir. Süre dolarsa yenileyebilirsiniz (WCAG 2.2.1).' });
  const sh = SHELL(d, 'Teklif İste', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Teklif İste'], 'Teklif talebi oluşturun', 'Tek form, onlarca doğrulanmış üretici. Ortalama 24 saatte 6 teklif.');
  const asideW = WIDE(d) ? Math.round(d.cw * 0.3) : 0;
  let F, A;
  if (WIDE(d)) { const fw = Math.min(d.cw - asideW - d.gap * 2, 960); [F, A] = TWO(sh.main, d, 'Form + bilgi', fw, { ln: 'form (RFQ)', rn: 'Nasıl çalışır (aside)', gap: d.cw - fw - asideW }); }
  else { const s = SECTION(sh.main, 'Form', d); F = B(s, 'form (RFQ)', { dir: 'column', gap: d.gap * 1.5, W: 'fill', H: 'hug' }); A = B(s, 'Nasıl çalışır (aside)', { dir: 'column', gap: d.gap, W: 'fill', H: 'hug' }); }
  F.flex.rowGap = d.gap * 1.5;
  rfqForm(F, d, WIDE(d) ? Math.min(d.cw - asideW - d.gap * 2, 960) : d.cw);
  const bx = BOX(A, 'Nasıl çalışır', { bg: C.ivory, stroke: C.ivory, gap: 16, p: 24 });
  T(bx, 'Nasıl çalışır?', { f: 'serif', s: d.ts.h3, w: 500, fill: true });
  [['rfq', 'Talebinizi gönderin', 'Ürün, miktar ve teslim bilgisi yeterli.'], ['msg', 'Teklifleri karşılaştırın', 'Fiyat, süre ve numune koşullarını tek tabloda görün.'], ['shield', 'Güvenle sipariş verin', 'Ödemeniz Ticaret Güvencesi ile korunur.']].forEach(([ic, t, b]) => { const r = B(bx, 'adım · ' + t, { dir: 'row', gap: 12, ai: 'start', W: 'fill', H: 'hug' }); I(r, ic, { box: 44, s: 22, bg: C.paper, r: RADIUS.md }); const tx = B(r, 'metin', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); T(tx, t, { s: d.ts.b, w: 700, fill: true }); T(tx, b, { s: d.ts.b, c: C.muted, fill: true }); });
  const help = BOX(A, 'Yardım (tutarlı konum · 3.2.6)', { gap: 8, p: 20 }); T(help, 'Yardım mı gerekiyor?', { s: d.ts.b, w: 700 }); T(help, 'İhracat masası hafta içi 09.00–18.00: 0850 000 00 00', { s: d.ts.b, c: C.muted, fill: true }); LINK(help, 'Canlı destek başlat', { w: 600, s: d.ts.b });
  return END(sh, d, { tab: 'Teklif' });
};

// ---------- 15 · Flash deals ----------
BUILD.flash = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, 'Flash Fırsatlar', x, y);
    const hero = B(sh.main, 'etkinlik', { dir: 'row', gap: 48, ai: 'center', p: [16, 96, 24, 96], W: 'fill', H: 'hug' });
    const tx = B(hero, 'metin', { dir: 'column', gap: 16, W: 900, H: 'hug' });
    TVT(tx, '48 saatlik seçki', { s: 24, w: 600, up: true, ls: 2, c: C.goldOnDark }); TVT(tx, 'Ege’nin Pamuk Atölyeleri', { f: 'serif', s: 64, lh: 1.05 }); COUNTDOWN(tx, '23 sa 14 dk', { dark: true, s: 28, is: 28 });
    IMG(hero, 'Pamuk tarlası ve atölye', { W: 'fill', H: 260, tone: 4, r: RADIUS.lg, p: 24 });
    TV_ROW(sh.main, 'Bu etkinlikteki ürünler', PRODS.slice(0, 5), 1);
    const hint = TV_HINT(sh.f); hint.layoutChild.absolute = true; hint.resize(d.w, 110); penpotUtils.setParentXY(hint, 0, d.h - 110); hint.fills = [{ fillColor: C.ink, fillOpacity: 1 }];
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Flash Fırsatlar', x, y);
  const hs = SECTION(sh.main, 'Etkinlik hero', d, { bg: C.ink, dir: WIDE(d) ? 'row' : 'column', ai: WIDE(d) ? 'center' : 'stretch', gap: d.gap * 2, pt: d.gap * 2.5, pb: d.gap * 2.5 });
  const tx = B(hs, 'metin', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.round(d.cw * 0.45) : 'fill', H: 'hug' });
  T(tx, '48 saatlik seçki · 18 üretici', { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.goldOnDark });
  T(tx, 'Ege’nin Pamuk Atölyeleri', { f: 'serif', s: d.ts.h1, w: 500, c: C.onDark, fill: true, lh: 1.05, name: 'h1 · Ege’nin Pamuk Atölyeleri' });
  T(tx, 'Denizli ve Uşak’tan organik penye, havlu ve nevresim kumaşları; liste fiyatına göre %18’e varan toptan indirim.', { s: d.ts.b + 2, c: C.onDarkMuted, fill: true, lh: 1.6 });
  const cd = B(tx, 'Geri sayım (aria-live=off · dakikada bir güncellenir)', { dir: 'row', gap: 12, W: 'fill', H: 'hug' });
  [['23', 'saat'], ['14', 'dakika']].forEach(([v, l]) => { const b = B(cd, 'birim · ' + l, { dir: 'column', ai: 'center', p: [12, 16], W: 'hug', H: 'hug', bg: C.inkSoft, r: RADIUS.md }); T(b, v, { f: 'serif', s: d.ts.h2, w: 600, c: C.onDark }); T(b, l, { s: d.ts.b, c: C.onDarkMuted }); });
  BTN(tx, 'Etkinliğe göz at', { kind: 'onDark', s: d.ts.b, W: d.w <= 360 ? 'fill' : 'hug' });
  IMG(hs, 'Pamuk tarlası ve atölye', { H: WIDE(d) ? Math.round(d.cw * 0.3) : Math.round(d.cw * 0.6), tone: 4, r: RADIUS.md });
  const tb = SECTION(sh.main, 'Sekmeler (tablist)', d, { pt: d.gap, pb: 0 });
  const tr = B(tb, 'tabs', { dir: 'row', gap: 24, W: 'fill', H: 'hug', clip: true });
  ['Şu an yayında (6)', 'Yakında (4)', 'Son şans (2)'].forEach((t, i) => { const b = B(tr, `tab · ${t}`, { dir: 'column', jc: 'center', H: d.tgt + 4, W: 'hug' }); T(b, t, { s: d.ts.b, w: i === 0 ? 700 : 500, u: i === 0, c: i === 0 ? C.ink : C.muted }); });
  DIV(tb);
  EVENTS_SEC(sh.main, d, { over: 'Şu an yayında', title: 'Tüm satış etkinlikleri' });
  EVENTS_SEC(sh.main, d, { name: 'Yakında', over: 'Hatırlatıcı kurun', title: 'Yarın başlıyor', upcoming: true, items: EVENTS.slice(2), n: { phone: 2, phoneL: 2, tablet: 2, tabletL: 3, desktop: 3, wide: 4, ultra: 4 }[d.fam] });
  return END(sh, d, { tab: 'Keşfet' });
};

// ---------- 16 · Cart ----------
function cartLine(parent, d, p, qty, unit, total, w) {
  const small = d.w < 500;
  const r = B(parent, 'satır · ' + p.n, { dir: 'row', gap: 16, ai: 'start', p: [16, 0], W: 'fill', H: 'hug' });
  const tw = small ? 88 : Math.round(Math.min(160, w * 0.16));
  IMG(r, p.n, { W: tw, H: tw, tone: p.t, r: RADIUS.sm, caption: false });
  const info = B(r, 'bilgi', { dir: 'column', gap: 6, W: w - tw - 16, H: 'hug' });
  T(info, p.n, { s: d.ts.b, w: 600, fill: true });
  T(info, 'Renk: Ekru · ' + unit, { s: d.ts.b, c: C.muted, fill: true });
  const ctl = B(info, 'kontroller', { dir: small ? 'column' : 'row', gap: 12, ai: small ? 'start' : 'center', jc: 'space-between', W: 'fill', H: 'hug' });
  STEPPER(ctl, qty, { s: d.ts.b, h: 44, vw: 96 });
  const tt = B(ctl, 'tutar', { dir: 'row', gap: 16, ai: 'center', W: 'hug', H: 'hug' }); T(tt, total, { s: d.ts.p, w: 700 }); LINK(tt, 'Kaldır', { s: d.ts.b });
  return r;
}
BUILD.cart = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Sepet', x, y, { over: 'Sepetiniz · 3 ürün', h1: 'Toplam ₺312.480', body: 'Siparişi güvenle onaylamak için telefonunuza aktarın. Sepetiniz tüm cihazlarınızda aynı kalır.', steps: ['QR kodu okutun', 'Teslimat ve ödeme bilgisini onaylayın'], qr: 'Sepeti telefonda aç', cta: 'Sepeti telefona gönder' });
  const sh = SHELL(d, 'Sepet', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Sepet'], 'Sepetiniz', '3 ürün · 2 tedarikçi');
  const sumW = WIDE(d) ? Math.round(Math.max(360, d.cw * 0.3)) : d.cw;
  let L, R;
  if (WIDE(d)) [L, R] = TWO(sh.main, d, 'Sepet içeriği', d.cw - sumW - d.gap * 1.5, { ln: 'Ürünler', rn: 'Sipariş özeti (aside)' });
  else { const s = SECTION(sh.main, 'Sepet içeriği', d); L = B(s, 'Ürünler', { dir: 'column', gap: d.gap, W: 'fill', H: 'hug' }); R = B(s, 'Sipariş özeti (aside)', { dir: 'column', gap: d.gap, W: 'fill', H: 'hug' }); }
  const lw = WIDE(d) ? d.cw - sumW - d.gap * 1.5 : d.cw;
  const grp = (sup, city, lines) => { const g = BOX(L, 'Tedarikçi grubu · ' + sup, { gap: 0, p: [8, 20] }); const h = B(g, 'başlık', { dir: 'row', gap: 8, ai: 'center', p: [8, 0], W: 'fill', H: 'hug', wrap: true }); I(h, 'shield', { s: 20, c: C.ok }); T(h, sup, { s: d.ts.b, w: 700 }); T(h, '· ' + city, { s: d.ts.b, c: C.muted }); lines.forEach((ln, i) => { DIV(g); cartLine(g, d, ...ln, lw - 40); }); return g; };
  grp('Ege Tekstil A.Ş.', 'Denizli', [[PRODS[0], '2.000 metre', '₺129,00 / metre (2.000+ kademesi)', '₺258.000']]);
  const tip = BOX(L, 'Kademe ipucu (bilgi)', { dir: 'row', bg: '#EEF3FB', stroke: '#B8C7E6', ai: 'start' }); I(tip, 'arrowR', { s: 20, c: C.focus }); T(tip, '8.000 metre daha eklerseniz birim fiyat ₺118,00’e düşer (−₺22.000).', { s: d.ts.b, fill: true });
  grp('Ayvalık Zeytincilik', 'Balıkesir', [[PRODS[2], '40 teneke', '₺1.240 / teneke', '₺49.600'], [PRODS[8], '20 kg', '₺265 / kg (numune)', '₺5.300']]);
  const s = BOX(R, 'Özet kartı', { bg: C.ivory, stroke: C.ivory, gap: 12, p: 24 });
  T(s, 'Sipariş özeti', { f: 'serif', s: d.ts.h3, w: 500, fill: true });
  [['Ara toplam', '₺312.900'], ['Kademe indirimi', '−₺420'], ['Kargo', 'Tedarikçiyle netleşir'], ['KDV (%20)', 'Dahil']].forEach(([k, v]) => { const r = B(s, 'satır · ' + k, { dir: 'row', jc: 'space-between', W: 'fill', H: 'hug', gap: 12 }); T(r, k, { s: d.ts.b, c: C.muted }); T(r, v, { s: d.ts.b, w: 600 }); });
  DIV(s);
  const t = B(s, 'toplam', { dir: 'row', jc: 'space-between', ai: 'end', W: 'fill', H: 'hug' }); T(t, 'Toplam', { s: d.ts.b, w: 700 }); T(t, '₺312.480', { s: d.ts.h3, w: 700 });
  CHECK(s, 'Ticaret Güvencesi ile öde (önerilir)', true, { s: d.ts.b });
  if (d.fam !== 'phone') BTN(s, 'Siparişi onayla', { kind: 'primary', W: 'fill', icon: 'lock', h: d.tgt + 4, s: d.ts.b });
  T(s, 'Havale/EFT · Kurumsal kart · Onaylı alıcılara 60 gün vadeli açık hesap', { s: d.ts.b, c: C.muted, fill: true });
  return END(sh, d, {
    tab: 'Keşfet', sticky: (f) => {
      const bar = B(f, 'Sabit eylem çubuğu (sepet)', { dir: 'row', gap: 12, ai: 'center', jc: 'space-between', p: [12, 16, 16, 16], W: d.w, H: 'hug', bg: C.paper, stroke: C.line });
      const tt = B(bar, 'toplam', { dir: 'column', W: 'hug', H: 'hug' }); T(tt, 'Toplam', { s: 16, c: C.muted }); T(tt, '₺312.480', { s: 18, w: 700 });
      BTN(bar, 'Siparişi onayla', { kind: 'primary', icon: 'lock', s: 16 });
      return bar;
    },
  });
};

// ---------- 17 · Auth ----------
BUILD.auth = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Giriş / Kayıt', x, y, { over: 'Giriş yap', h1: 'Telefonunuzla giriş yapın', body: 'Uzaktan kumandayla şifre yazmanıza gerek yok. arasta.com.tr/tv adresine gidin ve bu kodu girin ya da QR kodu okutun.', code: 'K74QX', qr: 'arasta.com.tr/tv', cta: 'Yeni kod al', side: 'Kod 10 dakika geçerli. Passkey veya e-posta bağlantısıyla onaylayabilirsiniz (WCAG 3.3.8).' });
  const sh = SHELL(d, 'Giriş / Kayıt', x, y, { promo: false });
  const formW = WIDE(d) ? Math.min(520, Math.round(d.cw * 0.42)) : Math.min(d.cw, 520);
  let host;
  if (WIDE(d)) { const [L, R] = TWO(sh.main, d, 'Giriş', d.cw - formW - d.gap * 3, { ln: 'Editoryal görsel', rn: 'form (Giriş)', gap: d.gap * 3, pt: d.gap * 2, pb: d.gap * 3 }); IMG(L, 'Denizli dokuma atölyesinde usta eller', { H: Math.round(Math.min(d.h * 0.8, 900)), tone: 0, r: RADIUS.md, p: 24 }); host = R; }
  else { const s = SECTION(sh.main, 'Giriş', d, { ai: 'center', pt: d.gap * 1.5, pb: d.gap * 3 }); host = B(s, 'form (Giriş)', { dir: 'column', gap: d.gap, W: formW, H: 'hug' }); }
  host.flex.rowGap = d.gap;
  T(host, 'Hesabınız', { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.gold });
  H1(host, d, 'Tekrar hoş geldiniz');
  const seg = B(host, 'Hesap türü (radiogroup)', { dir: 'row', p: 4, W: 'fill', H: 'hug', bg: C.ivory, r: RADIUS.md });
  const sw = (formW - 8) / 2;
  const s1 = B(seg, 'Alıcı (seçili)', { dir: 'row', ai: 'center', jc: 'center', W: sw, H: 44, bg: C.paper, r: RADIUS.sm, stroke: C.line }); T(s1, 'Alıcı', { s: d.ts.b, w: 700 });
  const s2 = B(seg, 'Tedarikçi', { dir: 'row', ai: 'center', jc: 'center', W: sw, H: 44 }); T(s2, 'Tedarikçi', { s: d.ts.b, w: 500, c: C.muted });
  BTN(host, 'Passkey ile giriş yap', { kind: 'primary', icon: 'lock', W: 'fill', h: d.tgt + 4, s: d.ts.b });
  const or = B(host, 'ayırıcı · veya', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); DIV(or); T(or, 'veya e-posta ile', { s: d.ts.b, c: C.muted }); DIV(or);
  or.children.forEach((c) => { if (c.type === 'rectangle') { c.resize((formW - 150) / 2, 1); c.layoutChild.horizontalSizing = 'fix'; } });
  FIELD(host, 'E-posta', { value: 'ayse.demir@firma.com.tr', s: d.ts.b, help: 'autocomplete="username"' });
  const pw = FIELD(host, 'Şifre', { value: '••••••••••••', s: d.ts.b, focus: true, help: 'Yapıştırma ve şifre yöneticisi desteklenir.' });
  const box = pw.children.find((c) => c.name === 'input'); if (box) { const sb = B(box, 'button · Şifreyi göster', { dir: 'row', ai: 'center', p: [0, 8], H: 44, W: 'hug' }); T(sb, 'Göster', { s: d.ts.b, w: 600, u: true }); }
  const rr = B(host, 'yardımcı', { dir: 'row', jc: 'space-between', ai: 'center', W: 'fill', H: 'hug', wrap: true, gap: 8 }); CHECK(rr, 'Beni hatırla', true, { W: 'hug', s: d.ts.b }); LINK(rr, 'Şifremi unuttum', { w: 600, s: d.ts.b });
  BTN(host, 'Giriş yap', { kind: 'secondary', W: 'fill', h: d.tgt + 4, s: d.ts.b });
  BTN(host, 'E-postama giriş bağlantısı gönder', { kind: 'ghost', W: 'fill', s: d.ts.b, icon: 'msg' });
  DIV(host);
  const su = B(host, 'kayıt', { dir: 'row', gap: 6, W: 'fill', H: 'hug', wrap: true }); T(su, 'Hesabınız yok mu?', { s: d.ts.b, c: C.muted }); LINK(su, 'Ücretsiz hesap oluşturun', { w: 700, s: d.ts.b });
  T(host, 'Bulmaca/CAPTCHA yok · 3.3.8 Erişilebilir Kimlik Doğrulama', { s: d.ts.b, c: C.muted, fill: true, name: 'a11y not' });
  return END(sh, d, { tab: 'Hesap' });
};

// ---------- 18 · Trade assurance ----------
BUILD.trust = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, 'Ticaret Güvencesi', x, y);
    TV_SPLIT(sh, d, (L) => {
      TVT(L, 'Ticaret Güvencesi', { s: 24, w: 600, up: true, ls: 2, c: C.goldOnDark }); TVT(L, 'Ödemeniz, siz onaylayana kadar güvende.', { f: 'serif', s: 64, lh: 1.08 });
      [['1', 'Sipariş verin, ödeme emanete alınır'], ['2', 'Tedarikçi üretir ve sevk eder'], ['3', 'Teslim alıp onaylayın'], ['4', 'Ödeme tedarikçiye aktarılır']].forEach(([n, t]) => { const r = B(L, 'adım ' + n, { dir: 'row', gap: 20, ai: 'center', W: 'fill', H: 'hug' }); const b = B(r, 'num', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: RADIUS.lg, bg: C.inkSoft }); T(b, n, { s: 28, w: 700, c: C.onDark }); TVT(r, t); });
    }, (R) => { IMG(R, 'Teslim alınan koliler, kalite kontrol', { W: 'fill', H: 520, tone: 1, r: RADIUS.lg, p: 24 }); });
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Ticaret Güvencesi', x, y);
  HERO(sh.main, d, { over: 'Ticaret Güvencesi', title: 'Ödemeniz, siz onaylayana kadar güvende.', body: 'Kalite, miktar veya teslim tarihi sözleşmeye uymazsa tutarın tamamı ya da bir kısmı iade edilir. Alıcıya ek ücret yok.', cta1: 'Nasıl çalışır?', cta2: 'Anlaşmazlık başlat', img: 'Teslim alınan koliler, kalite kontrol', tone: 1 });
  const st = SECTION(sh.main, 'Adımlar (ol)', d, { bg: C.ivory });
  HEAD(st, d, '4 adımda', 'Güvenli ticaret nasıl işler?');
  const sc = d.fam === 'phone' ? 1 : ['tablet', 'phoneL'].includes(d.fam) ? 2 : 4;
  ROWS(st, [['Sipariş verin', 'Ödemeniz Arasta emanet hesabına alınır.'], ['Üretim ve sevkiyat', 'Tedarikçi, sözleşmedeki tarih ve koşullarla sevk eder.'], ['Teslim alın, kontrol edin', 'İnceleme için 7 gününüz var; sorun varsa bildirin.'], ['Ödeme aktarılır', 'Onayınızın ardından tutar tedarikçiye geçer.']], sc, d.gap, (r, [t, b], k) => {
    const c = BOX(r, 'adım ' + (k + 1), { gap: 8, p: 20 }); const n = B(c, 'num', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 44, r: RADIUS.lg, bg: C.ink }); T(n, String(k + 1), { s: 18, w: 700, c: C.onDark }); T(c, t, { s: d.ts.b + 2, w: 700, fill: true }); T(c, b, { s: d.ts.b, c: C.muted, fill: true }); return c;
  }, 'grid', d.cw);
  const cv = SECTION(sh.main, 'Kapsam', d);
  HEAD(cv, d, 'Kapsam', 'Neleri korur?');
  const cc = d.fam === 'phone' ? 1 : 3;
  ROWS(cv, [['check', 'Ürün kalitesi', 'Sözleşmedeki özelliklere uymayan ürünlerde iade.'], ['clock', 'Zamanında sevkiyat', 'Gecikmede sipariş tutarının %0,5’i günlük telafi.'], ['lock', 'Ödeme koruması', 'Ödeme teslim onayına kadar emanette tutulur.']], cc, d.gap, (r, [ic, t, b]) => { const c = BOX(r, 'kapsam · ' + t, { gap: 8 }); I(c, ic, { box: 44, s: 22, bg: C.ivory, r: RADIUS.md }); T(c, t, { f: 'serif', s: d.ts.h3, w: 500, fill: true }); T(c, b, { s: d.ts.b, c: C.muted, fill: true }); return c; }, 'grid', d.cw);
  const fq = SECTION(sh.main, 'SSS', d, { bg: C.ivory });
  HEAD(fq, d, 'Sıkça sorulanlar', 'Sorular ve yanıtlar');
  const faqs = ['Ticaret Güvencesi ücretli mi?', 'Hangi ödeme yöntemleri kapsanır?', 'Anlaşmazlık süreci ne kadar sürer?', 'Numune siparişleri de korunur mu?', 'Yurt dışı sevkiyatlar kapsama dahil mi?'];
  const acc = B(fq, 'Akordeon (button aria-expanded)', { dir: 'column', W: 'fill', H: 'hug', bg: C.paper, r: RADIUS.md, stroke: C.line });
  faqs.forEach((q, i) => { const it = B(acc, `soru · ${q}${i === 0 ? ' (açık)' : ''}`, { dir: 'column', gap: 8, p: [16, 20], W: 'fill', H: 'hug' }); const h = B(it, 'başlık', { dir: 'row', gap: 12, ai: 'center', jc: 'space-between', W: 'fill', H: 'hug' }); T(h, q, { s: d.ts.b, w: 600, fill: true }); I(h, i === 0 ? 'minus' : 'plus', { box: 44, s: 20 }); if (i === 0) T(it, 'Hayır. Alıcılar için ücretsizdir; hizmet bedeli tedarikçi komisyonuna dahildir.', { s: d.ts.b, c: C.muted, fill: true }); if (i < faqs.length - 1) DIV(acc); });
  RFQ_BAND(sh.main, d);
  return END(sh, d, { tab: 'Keşfet' });
};

// ---------- 19 · 404 & empty state ----------
BUILD.notfound = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = TV_SHELL(d, '404 & Boş Durum', x, y);
    TV_SPLIT(sh, d, (L) => {
      TVT(L, '404', { f: 'serif', s: 160, lh: 1, c: C.goldOnDark, fill: false });
      TVT(L, 'Bu içerik artık yayında değil.', { f: 'serif', s: 56, lh: 1.1 });
      TVT(L, 'Etkinlik sona ermiş veya ürün kaldırılmış olabilir.', { c: C.onDarkMuted });
      const b = BTN(L, 'Ana sayfaya dön', { kind: 'onDark', h: 64, s: 28, px: 32, icon: 'home' }); b.strokes = [{ strokeColor: C.focusOnDark, strokeWidth: 4, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }]; b.name += ' [focused]';
    }, (R) => { IMG(R, 'Boş vitrin rafı', { W: 'fill', H: 480, tone: 5, r: RADIUS.lg, p: 24 }); });
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, '404 & Boş Durum', x, y);
  const s = SECTION(sh.main, '404', d, { ai: WIDE(d) ? 'start' : 'stretch', pt: d.gap * 3, pb: d.gap * 2 });
  const inner = B(s, 'içerik', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.min(d.cw, 960) : 'fill', H: 'hug' });
  T(inner, '404 · Sayfa bulunamadı', { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.gold });
  H1(inner, d, 'Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.', { s: d.ts.h1 });
  T(inner, 'Flash satış etkinlikleri süreli yayınlanır; bağlantı eski bir etkinliğe ait olabilir.', { s: d.ts.b + 2, c: C.muted, fill: true });
  FIELD(inner, 'Ürün veya tedarikçi arayın', { icon: 'search', ph: 'örn. organik pamuk kumaş', s: d.ts.b });
  const a = B(inner, 'eylemler', { dir: d.w <= 360 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug' });
  BTN(a, 'Ana sayfaya dön', { kind: 'primary', icon: 'home', W: d.w <= 360 ? 'fill' : 'hug', s: d.ts.b }); BTN(a, 'Yardım merkezi', { kind: 'secondary', W: d.w <= 360 ? 'fill' : 'hug', s: d.ts.b });
  T(inner, 'Popüler kategoriler', { s: d.ts.b, w: 700 });
  const ch = B(inner, 'kategori bağlantıları', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); CATS.slice(0, 6).forEach(([c]) => CHIP(ch, c, { s: d.ts.b, h: 44 }));
  const e = SECTION(sh.main, 'Boş durum · arama', d, { bg: C.ivory, ai: 'stretch' });
  T(e, 'Boş durum örneği', { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.gold });
  const eb = BOX(e, 'Sonuç yok (role=status)', { gap: 12, p: d.fam === 'phone' ? 20 : 32 });
  I(eb, 'search', { box: 56, s: 28, bg: C.ivory, r: RADIUS.lg });
  T(eb, '“hidrolik pres 400 ton” için sonuç bulunamadı', { f: 'serif', s: d.ts.h3, w: 500, fill: true });
  ['Yazımı kontrol edin veya daha genel bir terim deneyin (örn. “hidrolik pres”).', 'Filtreleri kaldırın: şu anda 3 filtre uygulanmış.', 'Aradığınızı üreticilere sorun: tek formla teklif alın.'].forEach((t) => { const r = B(eb, 'öneri', { dir: 'row', gap: 8, ai: 'start', W: 'fill', H: 'hug' }); I(r, 'check', { s: 20, c: C.ok }); T(r, t, { s: d.ts.b, fill: true }); });
  const ea = B(eb, 'eylemler', { dir: d.w <= 360 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug' });
  BTN(ea, 'Teklif talebi oluştur', { kind: 'primary', icon: 'rfq', W: d.w <= 360 ? 'fill' : 'hug', s: d.ts.b }); BTN(ea, 'Filtreleri temizle', { kind: 'secondary', W: d.w <= 360 ? 'fill' : 'hug', s: d.ts.b });
  return END(sh, d, { tab: 'Keşfet' });
};
