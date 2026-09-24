// Page shell + shared marketing sections (runs inside Penpot via MCP)

const HDR = { phone: 'Header/phone', tablet: 'Header/tablet', tabletL: 'Header/tablet-landscape', desktop: 'Header/desktop', wide: 'Header/wide-5k', ultra: 'Header/ultra-8k', tv: 'Header/tv-10ft' };
const FOOT = { phone: 'Footer/compact', phoneL: 'Footer/compact', tablet: 'Footer/regular', tabletL: 'Footer/regular', desktop: 'Footer/regular', wide: 'Footer/large', ultra: 'Footer/xl' };
function padX(inst, px) { if (inst.flex) { inst.flex.leftPadding = px; inst.flex.rightPadding = px; } }
function variantOf(prop, val) { for (const h of COMPS().filter((c) => c.isVariant())) for (const v of h.variants.variantComponents()) if (v.variantProps && v.variantProps[prop] === val) return v; return null; }

function SHELL(d, title, x, y, o = {}) {
  const f = FRAME(`${title} · ${d.id} · ${d.label}`, d.w, d.h, x, y, { bg: d.dark ? C.ink : C.paper });
  f.setPluginData('dev', d.id); f.setPluginData('page', title);
  if (d.fam === 'tv') { f.flex.verticalSizing = 'fix'; f.resize(d.w, d.h); f.clipContent = true; }
  let content = f;
  if (d.fam === 'phoneL') {
    f.flex.dir = 'row'; f.flex.alignItems = 'start';
    const rail = INST(f, 'Rail/phone-landscape', { W: 96 }); rail.resize(96, d.h); rail.name = 'Rail (nav · sabit, safe-area sol)'; o.__rail = rail;
    content = B(f, 'content', { dir: 'column', W: d.w - 96, H: 'hug' });
    const h = INST(content, 'Header/phone-landscape'); h.name = 'Header (banner)';
  } else {
    if (['tablet', 'tabletL', 'desktop', 'wide', 'ultra'].includes(d.fam) && o.promo !== false) {
      const pb = B(f, 'Promo bar', { dir: 'row', jc: 'center', ai: 'center', gap: 8, p: [10, d.px], W: 'fill', H: 'hug', bg: C.ink });
      I(pb, 'shield', { s: 20, c: C.goldOnDark });
      T(pb, 'Ticaret Güvencesi: ödemeniz, siz teslim alıp onaylayana kadar korunur.', { s: d.ts.b, c: C.onDark, align: 'center' });
    }
    const h = INST(f, HDR[d.fam]); h.name = 'Header (banner)';
    if (['desktop', 'tablet', 'tabletL'].includes(d.fam)) padX(h, d.px);
  }
  const main = B(content, 'main (landmark)', { dir: 'column', W: 'fill', H: 'hug', bg: o.mainBg });
  return { f, content, main, rail: o.__rail };
}
async function END(sh, d, o = {}) {
  if (d.fam !== 'tv' && o.footer !== false) { const ft = INST(sh.content, FOOT[d.fam]); ft.name = 'Footer (contentinfo)'; if (['desktop', 'tablet', 'tabletL'].includes(d.fam)) padX(ft, d.px); }
  if (d.fam === 'phone' && o.tab !== null) {
    let nav;
    if (o.sticky) nav = o.sticky(sh.f);
    else { const v = variantOf('Aktif', o.tab || 'Keşfet'); nav = v.instance(); sh.f.appendChild(nav); nav.name = `BottomNav (sabit · ${o.tab || 'Keşfet'} aktif)`; }
    nav.layoutChild.absolute = true; nav.resize(d.w, nav.height);
    nav.fixedWhenScrolling = true;
    sh.f.flex.bottomPadding = nav.height; // content never hidden behind the sticky bar (WCAG 2.4.11)
    sh.nav = nav;
  }
  try { sh.f.addRulerGuide('horizontal', d.h); } catch (e) {}
  await FIXUP(sh.f);
  if (sh.rail) { sh.rail.resize(96, sh.f.height); }
  if (sh.nav) { await sleep(150); penpotUtils.setParentXY(sh.nav, 0, sh.f.height - sh.nav.height); }
  return sh.f;
}

// ---------- shared sections ----------
function PROMO_TEXT(d) { return d.fam === 'phone' ? 'Ödemeniz teslimata kadar Ticaret Güvencesi altında.' : 'Ödemeniz, siz teslim alıp onaylayana kadar Ticaret Güvencesi altında.'; }

function HERO(main, d, o) { // o: over, title, body, cta1, cta2, img, tone
  const stacked = ['phone', 'tablet'].includes(d.fam);
  const s = SECTION(main, 'Hero', d, { dir: stacked ? 'column' : 'row', gap: stacked ? d.gap * 1.5 : d.gap * 2, pt: d.fam === 'phone' ? 16 : d.gap * 2, ai: stacked ? 'stretch' : 'center', bg: o.bg });
  const txt = B(s, 'hero-copy', { dir: 'column', gap: d.gap, W: stacked ? 'fill' : Math.round(d.cw * (d.fam === 'phoneL' ? 0.5 : 0.44)), H: 'hug' });
  T(txt, o.over, { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.gold, name: 'overline' });
  T(txt, o.title, { f: 'serif', s: d.ts.h1, w: 500, fill: true, lh: 1.08, name: 'h1 · ' + o.title });
  T(txt, o.body, { s: d.ts.b + (d.fam === 'phone' ? 0 : 2), c: C.muted, fill: true, lh: 1.6 });
  const ctas = B(txt, 'cta-group', { dir: d.w <= 360 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug', wrap: d.w > 360 });
  BTN(ctas, o.cta1, { kind: 'primary', h: d.tgt + 4, s: d.ts.b, icon: o.icon1, W: d.w <= 360 ? 'fill' : 'hug' });
  if (o.cta2) BTN(ctas, o.cta2, { kind: 'secondary', h: d.tgt + 4, s: d.ts.b, W: d.w <= 360 ? 'fill' : 'hug' });
  if (o.meta) { const m = B(txt, 'hero-meta', { dir: 'row', gap: 16, W: 'fill', H: 'hug', wrap: true }); o.meta.forEach(([ic, t]) => { const r = B(m, 'meta · ' + t, { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 'hug' }); I(r, ic, { s: 20, c: C.ok }); T(r, t, { s: d.ts.b, c: C.muted }); }); }
  const ih = stacked ? Math.round(d.cw * (d.fam === 'phone' ? 0.75 : 0.5)) : Math.round(Math.min(d.h * 0.62, d.cw * 0.42));
  IMG(s, o.img, { H: ih, tone: o.tone, r: RADIUS.md, p: d.gap });
  return s;
}
function TRUST(main, d) {
  const items = [['shield', 'Ticaret Güvencesi', 'Ödeme, teslimat onayına kadar emanette'], ['check', 'Doğrulanmış üreticiler', 'Yerinde denetim ve belge kontrolü'], ['truck', '81 ile lojistik', 'Anlaşmalı taşıyıcılarla kapıya teslim'], ['rfq', 'Tek formla teklif', '24 saatte ortalama 6 teklif']];
  const cols = d.fam === 'phone' ? 1 : d.fam === 'tablet' || d.id === 'L480' ? 2 : 4;
  const s = SECTION(main, 'Güvence şeridi', d, { bg: C.ivory, pt: d.gap * 1.5, pb: d.gap * 1.5 });
  ROWS(s, items, cols, d.gap, (r, [ic, t, b]) => {
    const c = B(r, 'trust · ' + t, { dir: 'row', gap: 12, ai: 'start', W: 'fill', H: 'hug' });
    I(c, ic, { box: d.tgt, s: d.is, bg: C.paper, r: RADIUS.md, c: C.ink });
    const tx = B(c, 'text', { dir: 'column', gap: 2, W: 'fill', H: 'hug' });
    T(tx, t, { s: d.ts.b, w: 700, fill: true }); T(tx, b, { s: d.ts.b, c: C.muted, fill: true });
    return c;
  }, 'grid', d.cw);
}
function EVENT_CARD(parent, d, e, w, o = {}) {
  const c = B(parent, 'EventCard · ' + e.n, { dir: 'column', gap: 12, W: 'fill', H: 'hug' });
  const im = IMG(c, e.n, { H: Math.round(w * (o.ratio || 0.66)), tone: e.t, r: RADIUS.md, caption: false, p: 12 });
  im.flex.justifyContent = 'space-between'; im.flex.alignItems = 'start';
  if (o.upcoming) BADGE(im, 'Yakında · ' + e.e, { icon: 'bell', bg: C.paper, s: d.ts.b }); else COUNTDOWN(im, e.e, { s: d.ts.b });
  T(c, e.k, { s: d.ts.b, w: 600, up: true, ls: 1.4, c: C.gold });
  T(c, e.n, { f: 'serif', s: d.ts.h3, w: 500, fill: true, lh: 1.2, name: 'h3 · ' + e.n });
  if (o.upcoming) BTN(c, 'Başlayınca hatırlat', { kind: 'secondary', icon: 'bell', h: d.tgt, s: d.ts.b, W: 'hug' });
  else LINK(c, 'Satışa göz atın', { s: d.ts.b, w: 600 });
  return c;
}
function EVENTS_SEC(main, d, o = {}) {
  const cols = { phone: 1, phoneL: d.w < 600 ? 1 : 2, tablet: 2, tabletL: 3, desktop: 3, wide: 4, ultra: 4 }[d.fam];
  const s = SECTION(main, o.name || 'Flash satış etkinlikleri', d);
  HEAD(s, d, o.over || 'Bugün başladı · sınırlı süre', o.title || 'Flash satış etkinlikleri', { link: 'Tüm etkinlikler' });
  const w = colW(d, cols);
  ROWS(s, (o.items || EVENTS).slice(0, o.n || (cols === 1 ? 3 : cols * (d.fam === 'phoneL' ? 1 : 2))), cols, d.gap, (r, e, k, cw) => EVENT_CARD(r, d, e, cw, o), 'grid', d.cw);
  return s;
}
function CATS_SEC(main, d) {
  const cols = { phone: 2, phoneL: d.w < 600 ? 2 : 4, tablet: d.w < 700 ? 3 : 4, tabletL: 5, desktop: 5, wide: 5, ultra: 5 }[d.fam];
  const n = d.fam === 'phone' ? 6 : d.fam === 'phoneL' ? cols * 2 : cols * 2;
  const s = SECTION(main, 'Kategoriler', d, { bg: C.ivory });
  HEAD(s, d, 'Sektörler', 'Kategorilere göz atın', { link: 'Tüm kategoriler' });
  const w = colW(d, cols);
  ROWS(s, CATS.slice(0, n), cols, d.gap, (r, [name, city, t], k, w) => {
    const c = B(r, 'CategoryTile · ' + name, { dir: 'column', gap: 8, W: 'fill', H: 'hug' });
    IMG(c, name, { H: Math.round(w * 0.8), tone: t, r: RADIUS.md, caption: false });
    T(c, name, { s: d.ts.b + (d.fam === 'phone' ? 0 : 2), w: 600, fill: true, name: 'link · ' + name });
    T(c, city, { s: d.ts.b, c: C.muted, fill: true });
    return c;
  }, 'grid', d.cw);
}
function PRODUCTS_SEC(main, d, o = {}) {
  const cols = d.cols;
  const s = SECTION(main, o.name || 'Önerilen ürünler', d);
  if (o.title !== false) HEAD(s, d, o.over || 'Sizin için seçildi', o.title || 'Öne çıkan toptan ürünler', { link: 'Daha fazlası' });
  const w = colW(d, cols);
  const rows = o.rows || (d.fam === 'phone' ? (cols === 1 ? 3 : 2) : 2);
  ROWS(s, (o.items || PRODS).slice(o.offset || 0, (o.offset || 0) + cols * rows), cols, d.gap, (r, p, k, cw) => CARD(r, d, p, cw, cols === 1 ? Math.round(cw * 0.62) : cw), 'grid', d.cw);
  return s;
}
function RFQ_BAND(main, d) {
  const s = SECTION(main, 'RFQ bandı', d, { bg: C.ink, dir: ['phone', 'tablet'].includes(d.fam) ? 'column' : 'row', ai: ['phone', 'tablet'].includes(d.fam) ? 'stretch' : 'center', jc: 'space-between', pt: d.gap * 2.5, pb: d.gap * 2.5 });
  const t = B(s, 'copy', { dir: 'column', gap: 8, W: ['phone', 'tablet'].includes(d.fam) ? 'fill' : Math.round(d.cw * 0.6), H: 'hug' });
  T(t, 'Teklif İste (RFQ)', { s: d.ts.b, w: 600, up: true, ls: 1.6, c: C.goldOnDark });
  T(t, 'Aradığınızı bulamadınız mı? Tek formla onlarca üreticiden teklif alın.', { f: 'serif', s: d.ts.h2, w: 500, c: C.onDark, fill: true, lh: 1.15 });
  BTN(s, 'Teklif talebi oluştur', { kind: 'onDark', icon: 'rfq', h: d.tgt + 4, s: d.ts.b, W: d.w <= 360 ? 'fill' : 'hug' });
}

// ---------- TV (10-foot) building blocks ----------
function TV_ROW(parent, title, items, focusIdx) {
  const r = B(parent, 'row · ' + title, { dir: 'column', gap: 20, p: [0, 96], W: 'fill', H: 'hug' });
  T(r, title, { f: 'serif', s: 40, w: 500, c: C.onDark, name: 'h2 · ' + title });
  const line = B(r, 'rail (D-pad ←/→, taşan kartlar kaydırılır)', { dir: 'row', gap: 32, W: 'fill', H: 'hug', clip: true, ai: 'start' });
  items.forEach((p, i) => {
    const v = variantOf('Durum', i === focusIdx ? 'Odakta (D-pad)' : 'Varsayılan'); const c = v.instance(); line.appendChild(c);
    SET(c, 'title', p.n); SET(c, 'price', `${p.p} ${p.u}`); SET(c, 'moq', 'Min. sipariş: ' + p.m); c.name = `TVCard · ${p.n}${i === focusIdx ? ' [focused]' : ''}`;
    const m = penpotUtils.findShape((s) => s.name === 'media', c); const [a, z] = TONES[p.t % TONES.length];
    if (m) m.fills = [{ fillOpacity: 1, fillColorGradient: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: a, opacity: 1, offset: 0 }, { color: z, opacity: 1, offset: 1 }] } }];
  });
  return r;
}
function TV_HINT(parent) {
  const h = B(parent, 'Uzaktan kumanda ipuçları', { dir: 'row', gap: 40, p: [16, 96, 54, 96], W: 'fill', H: 'hug', jc: 'end' });
  for (const [k, t] of [['OK', 'Seç'], ['←→↑↓', 'Gezin'], ['Geri', 'Önceki ekran'], ['Mikrofon', 'Sesli ara']]) {
    const r = B(h, 'hint · ' + t, { dir: 'row', gap: 12, ai: 'center', W: 'hug', H: 'hug' });
    const k1 = B(r, 'key', { dir: 'row', p: [4, 12], r: RADIUS.sm, stroke: C.onDarkMuted, W: 'hug', H: 'hug' }); T(k1, k, { s: 24, w: 600, c: C.onDark });
    T(r, t, { s: 24, c: C.onDarkMuted });
  }
  return h;
}
