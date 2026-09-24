// Arasta v2 · navigation components — runs inside Penpot via MCP
const GRAD_BRAND = { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#2446D8', opacity: 1, offset: 0 }, { color: '#7A5AF8', opacity: 1, offset: 1 }] };
function LOGO(parent, size = 32, o = {}) {
  const l = B(parent, 'logo (link · Ana sayfa)', { dir: 'row', gap: Math.round(size / 4), ai: 'center', W: 'hug', H: 'hug' });
  const m = B(l, 'mark', { dir: 'row', ai: 'center', jc: 'center', W: size, H: size, r: Math.min(12, Math.round(size / 4)), grad: GRAD_BRAND });
  T(m, 'a', size >= 40 ? 'headline/m' : 'title/l', { c: 'text/on-brand', name: 'mark-letter' });
  if (o.word !== false) T(l, 'arasta', size >= 48 ? 'headline/l' : size >= 40 ? 'headline/m' : 'headline/s', { c: o.dark ? 'text/inverse' : 'text/primary', name: 'wordmark' });
  return l;
}
function ICONBTN(parent, icon, label, o = {}) { // non-component icon button used inside composite components
  const b = B(parent, `button · ${label}`, { dir: 'row', ai: 'center', jc: 'center', W: o.box || 44, H: o.box || 44, r: R.s, bg: o.bg, st: o.st });
  ICN(b, icon, o.is || 24, o.c || 'text/primary', 'icon');
  if (o.count) { const d = B(b, 'count-badge', { dir: 'row', ai: 'center', jc: 'center', p: [0, 5], W: 'hug', H: 20, r: 10, bg: 'accent/coral' }); T(d, String(o.count), 'label/m', { c: 'text/on-brand', name: 'count' }); d.layoutChild.absolute = true; penpotUtils.setParentXY(d, (o.box || 44) - 20, 2); }
  return b;
}
function SEARCH(parent, o = {}) { // o: H, ph, ai (AI toggle), kbd, cat (category select), btn
  const s = B(parent, 'Search (role=search)', { dir: 'row', gap: 8, ai: 'center', p: [0, o.btn ? 0 : 6, 0, o.cat ? 0 : 14], W: o.W ?? 'fill', H: o.H || 48, r: R.m, bg: 'bg/surface', st: 'border/default', clip: true });
  if (o.cat) { const c = B(s, 'select · Kategori', { dir: 'row', gap: 6, ai: 'center', p: [0, 14], W: 'hug', H: 'fill', bg: 'bg/subtle' }); T(c, 'Tümü', o.ty || 'label/m'); ICN(c, 'caret-down', 16, 'text/secondary', 'caret'); DIV(c, { v: true, h: o.H || 48 }); }
  ICN(s, 'magnifying-glass', 20, 'text/tertiary', 'search-icon');
  T(s, o.ph || 'Ürün, tedarikçi veya kategori ara', o.tyb || 'body/m', { c: 'text/tertiary', name: 'placeholder' });
  SP(s, 'fill', 1);
  if (o.kbd) { const k = B(s, 'kbd ⌘K', { dir: 'row', ai: 'center', p: [0, 6], H: 24, W: 'hug', r: R.xs, bg: 'bg/surface', st: 'border/subtle' }); T(k, '⌘K', 'mono/m', { c: 'text/secondary' }); }
  if (o.ai) { const a = B(s, 'button · Akıllı arama (AI)', { dir: 'row', gap: 6, ai: 'center', p: [0, 10], H: (o.H || 48) - 12, W: 'hug', r: R.s, bg: 'bg/ai-subtle' }); ICN(a, 'sparkle', 16, 'text/ai'); if (o.aiLabel !== false) T(a, 'Akıllı arama', o.ty || 'label/m', { c: 'text/ai' }); }
  ICONBTN(s, 'camera', 'Görselle ara', { box: (o.H || 48) - 4, is: 20, c: 'text/secondary' });
  if (o.btn) { const g = B(s, 'button · Ara', { dir: 'row', gap: 8, ai: 'center', p: [0, 20], H: 'fill', W: 'hug', bg: 'action/primary' }); ICN(g, 'magnifying-glass', 20, 'text/on-brand'); T(g, 'Ara', o.ty || 'label/m', { c: 'text/on-brand' }); }
  return s;
}
function mkHeaderPhone() {
  const h = B(null, 'Header/phone', { dir: 'column', W: 390, H: 'hug', bg: 'bg/surface', el: 'e1' });
  const r = B(h, 'row · bar', { dir: 'row', gap: 4, ai: 'center', p: [8, 8, 8, 16], W: 'fill', H: 'hug' });
  LOGO(r, 28); SP(r); ICONBTN(r, 'bell', 'Bildirimler (3)', { count: 3 }); ICONBTN(r, 'shopping-cart-simple', 'Sepet (3 ürün)', { count: 3 });
  const s = B(h, 'row · search', { dir: 'column', p: [0, 16, 12, 16], W: 'fill', H: 'hug' });
  SEARCH(s, { ph: 'Ürün veya tedarikçi ara', ai: true, aiLabel: false });
  return h;
}
function mkHeaderPhoneL() {
  const h = B(null, 'Header/phone-landscape', { dir: 'row', gap: 8, ai: 'center', p: [8, 24, 8, 16], W: 836, H: 'hug', bg: 'bg/surface', el: 'e1' });
  SEARCH(h, { ph: 'Ürün veya tedarikçi ara', ai: true, H: 44 }); ICONBTN(h, 'bell', 'Bildirimler (3)', { count: 3 }); ICONBTN(h, 'chat-circle-dots', 'Mesajlar (2)', { count: 2 });
  return h;
}
const TABS = [['Keşfet', 'house'], ['Kategori', 'squares-four'], ['Teklifler', 'file-text'], ['Hesap', 'user']];
function navItem(parent, label, icon, on, o = {}) {
  const it = B(parent, `tab · ${label}${on ? ' (aria-current=page)' : ''}`, { dir: 'column', gap: 4, ai: 'center', jc: 'center', W: o.W ?? 'fill', H: o.H ?? 'hug', p: o.p ?? 0 });
  const ind = B(it, 'indicator', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 32, r: R.m, bg: on ? 'bg/brand-subtle' : undefined });
  const ic = I(ind, icon, { s: 24, style: on ? 'duotone' : 'regular', c: on ? 'text/brand' : 'text/secondary', name: 'icon' });
  T(it, label, on ? 'label/m' : 'body/m', { c: on ? 'text/brand' : 'text/secondary', name: 'label' });
  return it;
}
function mkBottomNav(active) {
  const n = B(null, `BottomNav/phone/${active}`, { dir: 'row', p: [8, 0, 12, 0], W: 390, H: 80, bg: 'bg/surface', st: 'border/subtle' });
  n.shadows = [{ style: 'drop-shadow', offsetX: 0, offsetY: -4, blur: 16, spread: -4, hidden: false, color: { color: '#101828', opacity: 0.08 } }];
  for (const [l, ic] of TABS) navItem(n, l, ic, l === active);
  return n;
}
function mkRail(active) {
  const r = B(null, `Rail/phone-landscape/${active}`, { dir: 'column', gap: 8, ai: 'center', p: [12, 0], W: 96, H: 430, bg: 'bg/surface', st: 'border/subtle' });
  LOGO(r, 32, { word: false }); SP(r, 1, 8);
  for (const [l, ic] of [...TABS.slice(0, 3), ['Sepet', 'shopping-cart-simple'], TABS[3]]) navItem(r, l, ic, l === active, { W: 88 });
  return r;
}
function mkHeaderTablet() {
  const h = B(null, 'Header/tablet', { dir: 'column', W: 768, H: 'hug', bg: 'bg/surface', el: 'e1' });
  const r = B(h, 'row · bar', { dir: 'row', gap: 12, ai: 'center', p: [12, 32], W: 'fill', H: 'hug' });
  LOGO(r, 32); SEARCH(r, { ai: true, aiLabel: false }); ICONBTN(r, 'bell', 'Bildirimler (3)', { count: 3 }); ICONBTN(r, 'shopping-cart-simple', 'Sepet (3)', { count: 3 }); INST(r, 'Avatar/company');
  const t = B(h, 'row · categories (tablist, yatay kaydırma)', { dir: 'row', gap: 8, ai: 'center', p: [0, 32, 12, 32], W: 'fill', H: 'hug', clip: true });
  [['Tümü', 'squares-four', 1], ['Flash Fırsatlar', 'lightning'], ['Tekstil', 't-shirt'], ['Makine', 'factory'], ['Gıda', 'leaf'], ['Yapı', 'cube'], ['Ambalaj', 'package'], ['Elektrik', 'lightbulb']].forEach(([l, ic, on]) => {
    const c = B(t, `tab · ${l}`, { dir: 'row', gap: 6, ai: 'center', p: [0, 12], H: 36, W: 'hug', r: R.m, bg: on ? 'bg/inverse' : 'bg/subtle' });
    I(c, ic, { s: 16, c: on ? 'text/inverse' : l === 'Flash Fırsatlar' ? 'text/danger' : 'text/secondary' }); T(c, l, 'label/m', { c: on ? 'text/inverse' : 'text/primary' });
  });
  return h;
}
function mkHeaderDesk(name, o) { // o: w, pad, ty, tyb, box, logo, util, nav, gap, H
  const h = B(null, name, { dir: 'column', W: o.w, H: 'hug', bg: 'bg/surface', el: 'e1' });
  if (o.util) {
    const u = B(h, 'row · utility', { dir: 'row', gap: 24, ai: 'center', p: [0, o.pad], W: 'fill', H: o.box - 4, bg: 'bg/canvas' });
    const l = B(u, 'value-prop', { dir: 'row', gap: 8, ai: 'center', W: 'hug', H: 'hug' }); ICN(l, 'seal-check', 16, 'text/success'); T(l, '48.000 doğrulanmış üretici · Ticaret Güvencesi ile korunan ödeme', o.tyb, { c: 'text/secondary' });
    SP(u);
    for (const t of ['Tedarikçi olun', 'İhracat masası', 'Yardım']) T(u, t, o.tyb, { c: 'text/secondary', name: 'link · ' + t });
    const loc = B(u, 'button · Dil, para birimi, Incoterm', { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 'hug' }); ICN(loc, 'globe-simple', 16, 'text/secondary'); T(loc, 'TR · ₺ TRY · EXW', o.ty, { c: 'text/primary' }); ICN(loc, 'caret-down', 16, 'text/secondary');
  }
  const m = B(h, 'row · main', { dir: 'row', gap: o.gap || 16, ai: 'center', p: [12, o.pad], W: 'fill', H: 'hug' });
  LOGO(m, o.logo);
  const cb = B(m, 'button · Kategoriler (mega menü)', { dir: 'row', gap: 8, ai: 'center', p: [0, 14], H: o.box + 4, W: 'hug', r: R.s, bg: 'bg/brand-subtle' }); ICN(cb, 'squares-four', 20, 'text/brand'); T(cb, 'Kategoriler', o.ty, { c: 'text/brand' });
  SEARCH(m, { cat: true, ai: true, kbd: true, H: o.box + 4, ty: o.ty, tyb: o.tyb });
  ICONBTN(m, 'bell', 'Bildirimler (3)', { count: 3, box: o.box }); ICONBTN(m, 'chat-circle-dots', 'Mesajlar (2)', { count: 2, box: o.box });
  const cart = B(m, 'button · Sepet (3)', { dir: 'row', gap: 8, ai: 'center', p: [0, 14], H: o.box + 4, W: 'hug', r: R.s, st: 'border/default', el: 'e1', bg: 'bg/surface' }); ICN(cart, 'shopping-cart-simple', 20); T(cart, 'Sepet · 3', o.ty);
  const acc = B(m, 'button · Hesap menüsü', { dir: 'row', gap: 8, ai: 'center', W: 'hug', H: 'hug' }); INST(acc, 'Avatar/company'); const at = B(acc, 'meta', { dir: 'column', W: 'hug', H: 'hug' }); T(at, 'Demir Tekstil', o.ty, { name: 'company' }); T(at, 'Alıcı · Kurumsal', o.tyb, { c: 'text/tertiary', name: 'role' });
  if (o.nav) {
    const n = B(h, 'row · nav (nav aria-label=Ana menü)', { dir: 'row', gap: o.navGap || 24, ai: 'center', p: [0, o.pad], W: 'fill', H: o.box + 8, st: 'border/subtle' });
    const f = B(n, 'link · Flash Fırsatlar', { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 'hug' }); ICN(f, 'lightning', 20, 'text/danger'); T(f, 'Flash Fırsatlar', o.ty, { c: 'text/danger' });
    for (const t of ['Seçkin Üreticiler', 'Yeni Gelenler', 'Bölgesel Pazarlar', 'Toplu Sipariş (CSV)', 'Fuarlar']) T(n, t, o.ty, { name: 'link · ' + t });
    SP(n);
    const d = B(n, 'button · Teslimat konumu', { dir: 'row', gap: 6, ai: 'center', W: 'hug', H: 'hug' }); ICN(d, 'map-pin', 20, 'text/secondary'); T(d, 'Teslimat: İzmir', o.ty, { c: 'text/secondary' });
    const rq = B(n, 'button · Teklif İste', { dir: 'row', gap: 8, ai: 'center', p: [0, 16], H: o.box - 4, W: 'hug', r: R.s, bg: 'action/primary', glow: true }); ICN(rq, 'file-text', 20, 'text/on-brand'); T(rq, 'Teklif İste', o.ty, { c: 'text/on-brand' });
  }
  return h;
}
function mkHeaderTV() {
  const h = B(null, 'Header/tv-10ft', { dir: 'row', gap: 40, ai: 'center', p: [48, 96, 24, 96], W: 1920, H: 'hug', bg: 'bg/inverse' });
  LOGO(h, 48, { dark: true });
  const tabs = B(h, 'tabs (D-pad ←/→)', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' });
  ['Keşfet', 'Kategoriler', 'Flash Fırsatlar', 'Üreticiler', 'Tekliflerim'].forEach((t, i) => {
    const b = B(tabs, `tab · ${t}${i === 0 ? ' [focused]' : ''}`, { dir: 'row', ai: 'center', p: [0, 28], H: 64, W: 'hug', r: R.m, bg: i === 0 ? 'bg/surface' : undefined });
    T(b, t, 'tv/label', { c: i === 0 ? 'text/primary' : 'text/inverse-muted' });
    if (i === 0) { FOCUS(b, true); b.shadows = glow('#BCC9FF'); }
  });
  ICONBTN(h, 'magnifying-glass', 'Sesli / metin arama', { box: 64, is: 32, c: 'text/inverse', bg: 'bg/inverse-2' });
  ICONBTN(h, 'user', 'Profil', { box: 64, is: 32, c: 'text/inverse', bg: 'bg/inverse-2' });
  return h;
}
function mkFooter(kind) { // compact | regular | large | xl
  const ty = { compact: 'body/m', regular: 'body/m', large: 'body/l', xl: 'body/xl' }[kind], tyh = { compact: 'title/m', regular: 'title/m', large: 'title/l', xl: 'headline/s' }[kind];
  const w = { compact: 390, regular: 1280, large: 2560, xl: 3840 }[kind], pad = { compact: 16, regular: 40, large: 160, xl: 320 }[kind];
  const f = B(null, `Footer/${kind}`, { dir: 'column', gap: kind === 'compact' ? 24 : 48, p: [kind === 'compact' ? 32 : 64, pad, 32, pad], W: w, H: 'hug', bg: 'bg/inverse' });
  const nl = B(f, 'newsletter-card', { dir: kind === 'compact' ? 'column' : 'row', gap: 16, ai: kind === 'compact' ? 'stretch' : 'center', p: kind === 'compact' ? 20 : 32, W: 'fill', H: 'hug', r: R.m, bg: 'bg/inverse-2' });
  const tx = B(nl, 'copy', { dir: 'column', gap: 4, W: kind === 'compact' ? 'fill' : Math.round((w - 2 * pad) * 0.5), H: 'hug' });
  T(tx, 'Flash etkinlikleri ve fiyat düşüşlerini ilk siz duyun', tyh, { c: 'text/inverse', fill: true }); T(tx, 'Haftada en fazla 2 e-posta. İstediğiniz an ayrılabilirsiniz.', ty, { c: 'text/inverse-muted', fill: true });
  if (kind !== 'compact') SP(nl);
  const fm = B(nl, 'form', { dir: 'row', gap: 8, ai: 'center', W: kind === 'compact' ? 'fill' : 520, H: 'hug' });
  const inp = B(fm, 'input · E-posta', { dir: 'row', gap: 8, ai: 'center', p: [0, 14], W: 'fill', H: 48, r: R.s, bg: 'bg/inverse', st: 'border/default' }); ICN(inp, 'envelope-simple', 20, 'text/inverse-muted'); T(inp, 'ornek@firma.com.tr', ty, { c: 'text/inverse-muted' });
  const sb = B(fm, 'button · Abone ol', { dir: 'row', ai: 'center', p: [0, 18], H: 48, W: 'hug', r: R.s, bg: 'bg/surface' }); T(sb, 'Abone ol', 'label/m');
  const cols = [['Alıcılar', ['Teklif iste (RFQ)', 'Toplu sipariş (CSV)', 'Ticaret Güvencesi', 'Numune talebi', 'Lojistik hesaplayıcı']], ['Tedarikçiler', ['Tedarikçi olun', 'Mağaza yönetimi', 'Reklam çözümleri', 'İhracat akademisi']], ['Kurumsal', ['Hakkımızda', 'Kariyer', 'Basın', 'Sürdürülebilirlik', 'Yatırımcı ilişkileri']], ['Destek', ['Yardım merkezi', 'Anlaşmazlık çözümü', 'Güvenlik', 'Erişilebilirlik beyanı', 'Sistem durumu']]];
  if (kind === 'compact') {
    for (const [hd] of cols) { const r = B(f, `accordion · ${hd} (aria-expanded=false)`, { dir: 'row', ai: 'center', jc: 'space-between', W: 'fill', H: 48, st: 'border/strong' }); r.strokes = []; T(r, hd, 'title/m', { c: 'text/inverse' }); ICN(r, 'caret-down', 20, 'text/inverse'); }
  } else {
    const g = B(f, 'link-columns', { dir: 'row', gap: 40, W: 'fill', H: 'hug' });
    const bw = (w - 2 * pad - 40 * 4) / 5;
    const brand = B(g, 'brand', { dir: 'column', gap: 12, W: bw, H: 'hug' }); LOGO(brand, kind === 'regular' ? 32 : kind === 'large' ? 40 : 48, { dark: true }); T(brand, 'Türkiye’nin seçkin üreticilerini dünyayla buluşturan B2B pazar yeri.', ty, { c: 'text/inverse-muted', fill: true });
    for (const [hd, ls] of cols) { const c = B(g, 'column · ' + hd, { dir: 'column', gap: 12, W: bw, H: 'hug' }); T(c, hd, tyh, { c: 'text/inverse' }); ls.forEach((l) => T(c, l, ty, { c: 'text/inverse-muted', name: 'link · ' + l })); }
  }
  DIV(f, { c: 'bg/inverse-2' });
  const lg = B(f, 'legal', { dir: kind === 'compact' ? 'column' : 'row', gap: 16, W: 'fill', H: 'hug', ai: kind === 'compact' ? 'start' : 'center' });
  T(lg, '© 2026 Arasta Teknoloji A.Ş. · ISO 27001 · PCI DSS', ty, { c: 'text/inverse-muted' });
  if (kind !== 'compact') SP(lg);
  const ll = B(lg, 'legal-links', { dir: 'row', gap: 16, W: 'hug', H: 'hug', wrap: true }); ['KVKK', 'Çerez tercihleri', 'Koşullar'].forEach((l) => T(ll, l, ty, { c: 'text/inverse', u: true }));
  return f;
}
function mkCommandPalette() {
  const p = B(null, 'Overlay/CommandPalette (⌘K, role=dialog)', { dir: 'column', W: 640, H: 'hug', r: R.m, bg: 'bg/surface', el: 'e5', st: 'border/subtle', clip: true });
  const s = B(p, 'input', { dir: 'row', gap: 10, ai: 'center', p: [0, 16], W: 'fill', H: 56, st: 'border/subtle' }); ICN(s, 'magnifying-glass', 20, 'text/tertiary'); T(s, 'penye kumaş denizli', 'body/l', { name: 'query' }); SP(s); INST(s, 'Kbd');
  const g = (title, rows) => { const b = B(p, 'group · ' + title, { dir: 'column', p: [8, 8], W: 'fill', H: 'hug' }); T(b, title, 'overline', { c: 'text/tertiary' }).layoutChild.leftMargin = 8; rows.forEach(([ic, t, meta], i) => { const r = B(b, 'option · ' + t, { dir: 'row', gap: 12, ai: 'center', p: [0, 8], W: 'fill', H: 44, r: R.s, bg: i === 0 && title === 'Öneriler' ? 'bg/brand-subtle' : undefined }); ICN(r, ic, 20, i === 0 && title === 'Öneriler' ? 'text/brand' : 'text/secondary'); T(r, t, 'body/m', { fill: true }); if (meta) T(r, meta, 'body/m', { c: 'text/tertiary' }); }); };
  g('Öneriler', [['sparkle', 'AI: Denizli’den organik penye, 5.000 m, 30 gün', 'Enter'], ['magnifying-glass', 'penye kumaş denizli — 1.204 ürün', ''], ['storefront', 'Ege Tekstil A.Ş. — tedarikçi', '']]);
  g('Eylemler', [['file-text', 'Yeni teklif talebi oluştur', 'R'], ['file-csv', 'CSV ile toplu sipariş yükle', 'U'], ['arrows-left-right', 'Karşılaştırma listesini aç (3)', 'C']]);
  const ft = B(p, 'footer', { dir: 'row', gap: 16, ai: 'center', p: [0, 16], W: 'fill', H: 40, bg: 'bg/subtle' }); T(ft, '↑↓ gezin · Enter seç · Esc kapat', 'body/m', { c: 'text/tertiary' });
  return p;
}
function mkMegaMenu() {
  const m = B(null, 'Overlay/MegaMenu', { dir: 'row', gap: 32, p: 24, W: 1200, H: 'hug', r: R.m, bg: 'bg/surface', el: 'e4', st: 'border/subtle' });
  const l = B(m, 'sectors (listbox)', { dir: 'column', gap: 2, W: 260, H: 'hug' });
  [['Tekstil & Hazır Giyim', 't-shirt', 1], ['Makine & Endüstri', 'factory'], ['Gıda & Tarım', 'leaf'], ['Yapı & Seramik', 'cube'], ['Ambalaj & Baskı', 'package'], ['Elektrik & Aydınlatma', 'lightbulb'], ['Mobilya & Ev', 'couch'], ['Kimya & Plastik', 'flask']].forEach(([t, ic, on]) => { const r = B(l, 'sector · ' + t, { dir: 'row', gap: 10, ai: 'center', p: [0, 12], W: 'fill', H: 44, r: R.s, bg: on ? 'bg/brand-subtle' : undefined }); I(r, ic, { s: 20, style: on ? 'duotone' : 'regular', c: on ? 'text/brand' : 'text/secondary' }); T(r, t, on ? 'label/m' : 'body/m', { c: on ? 'text/brand' : 'text/primary', fill: true }); if (on) ICN(r, 'caret-right', 16, 'text/brand'); });
  const c = B(m, 'subcategories', { dir: 'row', gap: 32, W: 'fill', H: 'hug' });
  [['Örme kumaş', ['Penye', 'Ribana', 'İnterlok', 'Süprem']], ['Dokuma kumaş', ['Gabardin', 'Keten', 'Denim', 'Poplin']], ['Ev tekstili', ['Havlu', 'Nevresim', 'Perde']]].forEach(([h, ls]) => { const col = B(c, 'col · ' + h, { dir: 'column', gap: 10, W: 'fill', H: 'hug' }); T(col, h, 'title/m'); ls.forEach((x) => T(col, x, 'body/m', { c: 'text/secondary' })); });
  const p = B(m, 'promo', { dir: 'column', gap: 10, p: 16, W: 280, H: 'hug', r: R.m, bg: 'bg/ai-subtle' }); INST(p, 'Badge#AI'); T(p, 'Tekstilde AI tedarikçi eşleştirme', 'title/m', { fill: true }); T(p, 'İhtiyacınızı yazın; kapasite, sertifika ve teslim süresine göre sıralayalım.', 'body/m', { c: 'text/secondary', fill: true });
  return m;
}
function mkBottomSheet() {
  const s = B(null, 'Overlay/BottomSheet · Filtreler (role=dialog)', { dir: 'column', gap: 16, p: [8, 16, 16, 16], W: 390, H: 'hug', r: R.m, bg: 'bg/surface', el: 'e5' });
  s.borderRadiusBottomLeft = 0; s.borderRadiusBottomRight = 0;
  const hdl = B(s, 'handle', { dir: 'row', jc: 'center', W: 'fill', H: 'hug' }); B(hdl, 'grip', { W: 40, H: 4, r: 2, bg: 'border/subtle' });
  const hd = B(s, 'header', { dir: 'row', ai: 'center', W: 'fill', H: 'hug' }); T(hd, 'Filtreler', 'title/l', { fill: true }); ICONBTN(hd, 'x', 'Kapat');
  T(s, 'Tedarikçi', 'title/m'); ['Doğrulanmış üretici', 'Ticaret Güvencesi', 'Yerinde denetimli'].forEach((t, i) => { const c = INST(s, i < 2 ? 'Checkbox#Seçili|Varsayılan' : 'Checkbox#Seçili değil|Varsayılan'); SETT(c, 'label', t); });
  T(s, 'Min. sipariş (MOQ)', 'title/m'); const ch = B(s, 'chips', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); ['≤ 100', '≤ 500', '≤ 1.000', 'Tümü'].forEach((t, i) => { const c = INST(ch, i === 1 ? 'Chip#Filtre|Seçili' : 'Chip#Filtre|Varsayılan'); SETT(c, 'label', t); });
  const ft = B(s, 'actions', { dir: 'row', gap: 12, W: 'fill', H: 'hug' });
  const a = INST(ft, 'Button#İkincil|Varsayılan'); SETT(a, 'label', 'Temizle'); HIDE(a, 'icon');
  const b = INST(ft, 'Button#Birincil|Varsayılan'); SETT(b, 'label', '1.204 ürünü göster'); HIDE(b, 'icon'); b.layoutChild.horizontalSizing = 'fill';
  return s;
}
