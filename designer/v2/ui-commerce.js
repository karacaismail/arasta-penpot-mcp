// Arasta v2 · commerce components — runs inside Penpot via MCP
const CARD_SZ = { S: { w: 172, ty: 'body/m-strong', pr: 'price/m', p: [4, 12, 12, 12], gap: 4 }, M: { w: 264, ty: 'body/m-strong', pr: 'price/m', p: [8, 16, 16, 16], gap: 6 },
  L: { w: 320, ty: 'title/m', pr: 'price/l', p: [8, 20, 20, 20], gap: 8 }, XL: { w: 400, ty: 'title/l', pr: 'price/l', p: [12, 24, 24, 24], gap: 10 } };
function mkProductCard(size, state) {
  const z = CARD_SZ[size]; const hover = state === 'Hover';
  const c = B(null, `ProductCard/${size}/${state}`, { dir: 'column', W: z.w, H: 'hug', r: R.m, bg: 'bg/surface', st: hover ? 'border/brand' : 'border/subtle', el: hover ? 'e3' : 'e1', clip: true });
  if (state === 'Yükleniyor') { c.name += ' (aria-busy=true)'; const sk = B(c, 'skeleton', { dir: 'column', gap: 10, p: 8, W: 'fill', H: 'hug' }); B(sk, 'media', { W: 'fill', H: Math.round((z.w - 16) * 0.8), r: R.s, bg: 'bg/muted' }); [0.85, 0.6, 0.45, 0.7].forEach((k) => B(sk, 'line', { W: Math.round((z.w - 16) * k), H: 16, r: 4, bg: 'bg/muted' })); return c; }
  const mw = B(c, 'media-wrap', { dir: 'column', p: 8, W: 'fill', H: 'hug' });
  const m = B(mw, 'media', { dir: 'column', ai: 'center', jc: 'center', W: 'fill', H: Math.round((z.w - 16) * 0.8), r: R.s, clip: true, grad: { type: 'linear', startX: 0.1, startY: 0, endX: 0.9, endY: 1, width: 1, stops: [{ color: '#EEF2FF', opacity: 1, offset: 0 }, { color: '#D6DEFF', opacity: 1, offset: 1 }] } });
  const halo = B(m, 'halo', { dir: 'row', ai: 'center', jc: 'center', W: Math.round(z.w * 0.36), H: Math.round(z.w * 0.36), r: 12, bg: '#FFFFFF', bgo: 0.6 });
  const il = COMP('Illu/textile').instance(); halo.appendChild(il); il.name = 'illu';
  const bd = INST(m, 'Badge#Hata', { name: 'badge' }); bd.layoutChild.absolute = true; penpotUtils.setParentXY(bd, 8, 8); SETT(bd, 'label', 'Flash −%18');
  const fav = INST(m, 'IconButton#surface|Varsayılan', { name: 'fav · Favorilere ekle' }); fav.layoutChild.absolute = true; if (size === 'S') fav.resize(40, 40); penpotUtils.setParentXY(fav, m.width - fav.width - 8, 8);
  const body = B(c, 'body', { dir: 'column', gap: z.gap, p: z.p, W: 'fill', H: 'hug' });
  const sup = B(body, 'supplier', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' }); ICN(sup, 'seal-check', 16, 'text/success', 'verified'); T(sup, 'Ege Tekstil · Denizli', 'body/m', { name: 'supplier', c: 'text/secondary', fill: true });
  T(body, 'Organik pamuk penye kumaş, 180 g/m²', z.ty, { name: 'title', fill: true });
  const pr = B(body, 'price-row', { dir: 'row', gap: 4, ai: 'end', W: 'fill', H: 'hug', wrap: true }); T(pr, '₺118 – ₺142,50', z.pr, { name: 'price' }); T(pr, '/ metre', 'body/m', { name: 'unit', c: 'text/tertiary' });
  T(body, 'Min. 500 metre · 3 kademe', 'body/m', { name: 'moq', c: 'text/tertiary', fill: true });
  const meta = B(body, 'meta', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true }); INST(meta, 'Badge#AI', { name: 'match' }); INST(meta, 'Rating', { name: 'rating' });
  if (size !== 'S') {
    DIV(body);
    const ft = B(body, 'footer', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' });
    const cmp = INST(ft, 'Checkbox#Seçili değil|Varsayılan', { name: 'compare' }); SETT(cmp, 'label', 'Karşılaştır');
    SP(ft);
    const q = INST(ft, 'IconButton#tonal|Varsayılan', { name: 'button · Tedarikçiye yaz' }); SETI(q, 'chat-circle-dots', 'text/brand');
  }
  return c;
}
function mkTVCard(focused) {
  const c = B(null, `ProductCard/tv/${focused ? 'Odakta' : 'Varsayılan'}`, { dir: 'column', gap: 12, p: 16, W: 380, H: 'hug', r: R.m, bg: focused ? 'bg/surface' : 'bg/inverse-2' });
  const m = B(c, 'media', { dir: 'column', ai: 'center', jc: 'center', W: 'fill', H: 180, r: R.s, clip: true, grad: { type: 'linear', startX: 0.1, startY: 0, endX: 0.9, endY: 1, width: 1, stops: [{ color: '#EEF2FF', opacity: 1, offset: 0 }, { color: '#D6DEFF', opacity: 1, offset: 1 }] } });
  const il = COMP('Illu/textile').instance(); m.appendChild(il); il.name = 'illu';
  T(c, 'Organik pamuk penye kumaş', 'tv/label', { name: 'title', c: focused ? 'text/primary' : 'text/inverse', fill: true });
  T(c, '₺118 – ₺142,50 / m', 'tv/title', { name: 'price', c: focused ? 'text/primary' : 'text/inverse' });
  T(c, 'Min. 500 metre', 'tv/label', { name: 'moq', c: focused ? 'text/secondary' : 'text/inverse-muted' });
  if (focused) { FOCUS(c, true); c.shadows = glow('#BCC9FF'); }
  return c;
}
function mkSupplierCard(size) {
  const w = size === 'M' ? 400 : 358;
  const c = B(null, `SupplierCard/${size}`, { dir: 'column', gap: 16, p: 20, W: w, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle', el: 'e1' });
  const h = B(c, 'identity', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' });
  const lg = B(h, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: R.m, grad: GRAD_BRAND }); T(lg, 'ET', 'title/l', { c: 'text/on-brand', name: 'initials' });
  const nm = B(h, 'name', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); T(nm, 'Ege Tekstil A.Ş.', 'title/m', { name: 'name', fill: true }); T(nm, 'Denizli · 12 yıl · Üretici', 'body/m', { name: 'meta', c: 'text/secondary', fill: true });
  const bd = B(c, 'badges', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); SETT(INST(bd, 'Badge#Başarı'), 'label', 'Doğrulanmış'); SETT(INST(bd, 'Badge#AI'), 'label', 'Uyum %94'); INST(bd, 'Rating');
  const st = B(c, 'stats', { dir: 'row', gap: 8, W: 'fill', H: 'hug' });
  [['≤ 4 sa', 'Yanıt'], ['%98,6', 'Zamanında'], ['250+', 'Çalışan']].forEach(([v, l]) => { const s = B(st, 'stat · ' + l, { dir: 'column', gap: 2, p: [8, 10], W: (w - 40 - 16) / 3, H: 'hug', r: R.s, bg: 'bg/subtle' }); T(s, v, 'title/m', { name: 'value' }); T(s, l, 'body/m', { name: 'label', c: 'text/tertiary' }); });
  const th = B(c, 'products', { dir: 'row', gap: 8, W: 'fill', H: 'hug' });
  ['t-shirt', 'package', 'couch'].forEach((ic, i) => { const t = B(th, 'thumb', { dir: 'row', ai: 'center', jc: 'center', W: (w - 40 - 16) / 3, H: 72, r: R.s, bg: ['bg/brand-subtle', 'bg/warning-subtle', 'bg/success-subtle'][i] }); I(t, ic, { s: 32, style: 'duotone', c: ['text/brand', 'text/warning', 'text/success'][i] }); });
  const ac = B(c, 'actions', { dir: 'row', gap: 8, W: 'fill', H: 'hug' });
  const a = INST(ac, 'Button#İkincil|Varsayılan', { name: 'cta-store' }); SETT(a, 'label', 'Mağazayı gör'); HIDE(a, 'icon'); a.layoutChild.horizontalSizing = 'fill';
  const b = INST(ac, 'Button#Üçüncül|Varsayılan', { name: 'cta-message' }); SETT(b, 'label', 'Mesaj'); SETI(b, 'chat-circle-dots', 'text/brand');
  return c;
}
function mkEventCard(size) {
  const w = { S: 358, M: 420, L: 560 }[size];
  const c = B(null, `EventCard/${size}`, { dir: 'column', W: w, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle', el: 'e1', clip: true });
  const m = B(c, 'media', { dir: 'column', jc: 'space-between', p: 12, W: 'fill', H: Math.round(w * 0.5), grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#FFF6E5', opacity: 1, offset: 0 }, { color: '#FFE3B0', opacity: 1, offset: 1 }] } });
  const top = B(m, 'top', { dir: 'row', jc: 'space-between', W: 'fill', H: 'hug' }); const cd = INST(top, 'Badge#Premium', { name: 'countdown' }); SETT(cd, 'label', 'Bitmesine 23 sa 14 dk'); SETI(cd, 'timer', 'text/inverse', 'icon', 16);
  const ill = B(m, 'illu-wrap', { dir: 'row', jc: 'end', W: 'fill', H: 'hug' }); const il = COMP('Illu/textile').instance(); ill.appendChild(il); il.name = 'illu';
  const b = B(c, 'body', { dir: 'column', gap: 6, p: [16, 20, 20, 20], W: 'fill', H: 'hug' });
  T(b, 'Tekstil · 18 üretici', 'overline', { name: 'overline', c: 'text/brand' });
  T(b, 'Ege’nin Pamuk Atölyeleri', size === 'L' ? 'headline/m' : 'headline/s', { name: 'title', fill: true });
  T(b, '%18’e varan toptan indirim · Ücretsiz numune', 'body/m', { name: 'desc', c: 'text/secondary', fill: true });
  const pr = B(b, 'progress', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); const tr = B(pr, 'track', { dir: 'row', W: 'fill', H: 6, r: 3, bg: 'bg/muted' }); B(tr, 'fill', { W: Math.round((w - 40) * 0.64), H: 6, r: 3, bg: 'accent/coral' }); T(pr, 'Kontenjanın %64’ü doldu', 'body/m', { name: 'progress-label', c: 'text/tertiary' });
  return c;
}
function mkCategoryTile(size) {
  const w = size === 'S' ? 172 : 264;
  const c = B(null, `CategoryTile/${size}`, { dir: 'column', gap: 10, p: size === 'S' ? 12 : 16, W: w, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle', el: 'e1' });
  const h = B(c, 'icon-tile', { dir: 'row', ai: 'center', jc: 'center', W: size === 'S' ? 48 : 56, H: size === 'S' ? 48 : 56, r: R.m, bg: 'bg/brand-subtle' });
  const il = COMP('Illu/textile').instance(); h.appendChild(il); il.name = 'illu';
  T(c, 'Tekstil & Hazır Giyim', 'title/m', { name: 'name', fill: true });
  T(c, '12.480 ürün · 1.320 tedarikçi', 'body/m', { name: 'count', c: 'text/tertiary', fill: true });
  return c;
}
function mkPriceTiers() {
  const t = B(null, 'PriceTiers (table)', { dir: 'column', gap: 12, p: 16, W: 480, H: 'hug', r: R.m, bg: 'bg/subtle', st: 'border/subtle' });
  const row = B(t, 'tiers', { dir: 'row', gap: 8, W: 'fill', H: 'hug' });
  [['500 – 1.999 m', '₺142,50'], ['2.000 – 9.999 m', '₺129,00', 1], ['≥ 10.000 m', '₺118,00']].forEach(([q, p, on]) => { const c = B(row, `tier · ${q}${on ? ' (seçili)' : ''}`, { dir: 'column', gap: 2, p: 12, W: (480 - 32 - 16) / 3, H: 'hug', r: R.s, bg: on ? 'bg/surface' : undefined, st: on ? 'border/brand' : undefined, sw: 2, el: on ? 'e1' : undefined }); T(c, p, 'price/m', { name: 'price' }); T(c, q, 'body/m', { name: 'qty', c: 'text/tertiary' }); });
  INST(t, 'TierProgress', { W: 'fill' });
  return t;
}
function mkAISearch(size) {
  const w = size === 'L' ? 720 : 358;
  const c = B(null, `AISearch/${size}`, { dir: 'column', gap: 14, p: size === 'L' ? 24 : 16, W: w, H: 'hug', r: R.m, bg: 'bg/surface', el: 'e4' });
  const h = B(c, 'head', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); INST(h, 'Badge#AI', { name: 'ai-badge' }); SETT(penpotUtils.findShape((s) => s.name === 'ai-badge', h), 'label', 'Akıllı arama'); T(h, 'Doğal dille yazın, filtreye biz çevirelim', 'body/m', { c: 'text/tertiary', name: 'hint' });
  const f = B(c, 'prompt (textbox)', { dir: 'row', gap: 10, ai: 'center', p: [0, 8, 0, 16], W: 'fill', H: 56, r: R.m, st: 'border/brand', sw: 2, bg: 'bg/surface' });
  ICN(f, 'sparkle', 20, 'text/ai'); T(f, 'Denizli’den 5.000 m organik penye, 30 günde', 'body/l', { name: 'prompt', fill: true });
  const go = INST(f, 'Button#Birincil|Varsayılan', { name: 'submit' }); SETT(go, 'label', 'Bul'); SETI(go, 'arrow-right', 'text/on-brand');
  const ch = B(c, 'suggestions', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true });
  ['GOTS sertifikalı', '≤ 30 gün teslim', 'Denizli', '5.000 m'].forEach((t) => SETT(INST(ch, 'Chip#AI öneri|Varsayılan'), 'label', t));
  return c;
}
function mkCompareTray() {
  const c = B(null, 'CompareTray (sabit, role=region)', { dir: 'row', gap: 16, ai: 'center', p: [12, 16], W: 960, H: 'hug', r: R.m, bg: 'bg/inverse', el: 'e5' });
  T(c, 'Karşılaştır', 'title/m', { c: 'text/inverse' });
  for (const ic of ['t-shirt', 'package', 'couch']) { const t = B(c, 'slot', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: R.s, bg: 'bg/inverse-2' }); I(t, ic, { s: 28, style: 'duotone', c: 'focus/ring-on-dark' }); }
  const e = B(c, 'slot · boş', { dir: 'row', ai: 'center', jc: 'center', W: 56, H: 56, r: R.s, st: 'border/default', ss: 'dashed' }); ICN(e, 'plus', 20, 'text/inverse-muted');
  SP(c); T(c, '3 / 4 ürün', 'body/m', { c: 'text/inverse-muted' });
  const b = INST(c, 'Button#Birincil|Varsayılan', { name: 'cta' }); SETT(b, 'label', 'Karşılaştır'); SETI(b, 'arrows-left-right', 'text/on-brand');
  const x = ICONBTN(c, 'x', 'Temizle', { c: 'text/inverse' });
  return c;
}
function mkTimelineStep(state) { // Tamamlandı | Şimdi | Sırada
  const done = state === 'Tamamlandı', now = state === 'Şimdi';
  const s = B(null, `TimelineStep/${state}`, { dir: 'row', gap: 12, ai: 'start', W: 360, H: 'hug' });
  const rail = B(s, 'rail', { dir: 'column', ai: 'center', gap: 4, W: 32, H: 'hug' });
  const dot = B(rail, 'dot', { dir: 'row', ai: 'center', jc: 'center', W: 32, H: 32, r: 12, bg: done ? 'action/primary' : now ? 'bg/brand-subtle' : 'bg/muted', st: now ? 'border/brand' : undefined, sw: 2 });
  ICN(dot, done ? 'check' : now ? 'truck' : 'clock', 16, done ? 'text/on-brand' : now ? 'text/brand' : 'text/tertiary', 'icon');
  B(rail, 'line', { W: 2, H: 28, bg: done ? 'action/primary' : 'border/subtle' });
  const t = B(s, 'text', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); T(t, 'Üretim tamamlandı', 'label/m', { name: 'title', fill: true, c: state === 'Sırada' ? 'text/tertiary' : 'text/primary' }); T(t, '12 Eki 2026 · Denizli', 'body/m', { name: 'meta', c: 'text/tertiary', fill: true });
  return s;
}
function mkStatCard() {
  const c = B(null, 'StatCard', { dir: 'column', gap: 8, p: 20, W: 280, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle', el: 'e1' });
  const h = B(c, 'head', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); const ic = B(h, 'icon-tile', { dir: 'row', ai: 'center', jc: 'center', W: 40, H: 40, r: R.m, bg: 'bg/brand-subtle' }); ICN(ic, 'receipt', 20, 'text/brand', 'icon'); T(h, 'Bu ay harcama', 'body/m', { name: 'label', c: 'text/secondary', fill: true });
  T(c, '₺1.284.500', 'headline/m', { name: 'value' });
  const tr = B(c, 'trend', { dir: 'row', gap: 4, ai: 'center', W: 'fill', H: 'hug' }); ICN(tr, 'trend-up', 16, 'text/success', 'trend-icon'); T(tr, '%12 geçen aya göre', 'body/m', { name: 'delta', c: 'text/success' });
  return c;
}
function mkEmptyState() {
  const c = B(null, 'EmptyState', { dir: 'column', gap: 12, ai: 'center', p: 32, W: 480, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle' });
  const h = B(c, 'illu-tile', { dir: 'row', ai: 'center', jc: 'center', W: 88, H: 88, r: R.m, bg: 'bg/brand-subtle' }); I(h, 'magnifying-glass', { s: 48, style: 'duotone', c: 'text/brand' });
  T(c, 'Sonuç bulunamadı', 'title/l', { name: 'title', align: 'center' });
  T(c, '“hidrolik pres 400 ton” için eşleşme yok. Talebinizi üreticilere iletelim.', 'body/m', { name: 'desc', c: 'text/secondary', align: 'center', fill: true });
  const a = B(c, 'actions', { dir: 'row', gap: 8, W: 'hug', H: 'hug' });
  const b1 = INST(a, 'Button#Birincil|Varsayılan', { name: 'primary' }); SETT(b1, 'label', 'Teklif iste'); SETI(b1, 'file-text', 'text/on-brand');
  const b2 = INST(a, 'Button#İkincil|Varsayılan', { name: 'secondary' }); SETT(b2, 'label', 'Filtreleri temizle'); HIDE(b2, 'icon');
  return c;
}
function mkQuoteRow(best) {
  const r = B(null, `QuoteRow/${best ? 'En iyi' : 'Standart'}`, { dir: 'row', gap: 16, ai: 'center', p: [16, 20], W: 1100, H: 'hug', r: R.m, bg: best ? 'bg/brand-subtle' : 'bg/surface', st: best ? 'border/brand' : 'border/subtle', sw: best ? 2 : 1 });
  const id = B(r, 'supplier', { dir: 'row', gap: 12, ai: 'center', W: 280, H: 'hug' }); const lg = B(id, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 44, r: R.m, grad: GRAD_BRAND }); T(lg, 'ET', 'label/m', { c: 'text/on-brand', name: 'initials' }); const n = B(id, 'n', { dir: 'column', W: 'fill', H: 'hug' }); T(n, 'Ege Tekstil A.Ş.', 'label/m', { name: 'name', fill: true }); T(n, 'Denizli · Doğrulanmış', 'body/m', { name: 'meta', c: 'text/tertiary', fill: true });
  [['₺121,00 / m', 'price'], ['18 gün', 'lead'], ['Ücretsiz', 'sample'], ['%30 peşin', 'terms']].forEach(([v, k]) => { const c = B(r, 'cell · ' + k, { dir: 'column', W: 150, H: 'hug' }); T(c, v, k === 'price' ? 'price/m' : 'label/m', { name: k }); });
  if (best) { const b = INST(r, 'Badge#AI', { name: 'best' }); SETT(b, 'label', 'En iyi değer'); } else SP(r, 120, 1);
  SP(r);
  const a = INST(r, best ? 'Button#Birincil|Varsayılan' : 'Button#İkincil|Varsayılan', { name: 'cta' }); SETT(a, 'label', 'Teklifi kabul et'); HIDE(a, 'icon');
  return r;
}
