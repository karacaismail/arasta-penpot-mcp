// Arasta v2 · core (semi-flat 2.0, Roboto, Phosphor) — executed inside Penpot via MCP, then kept in plugin globals
const COL = {
  'bg/canvas': '#F4F6FA', 'bg/surface': '#FFFFFF', 'bg/subtle': '#FAFBFC', 'bg/muted': '#EBEEF3', 'bg/inverse': '#111623', 'bg/inverse-2': '#1E2533',
  'bg/brand': '#2446D8', 'bg/brand-subtle': '#EEF2FF', 'bg/brand-subtle-2': '#DDE4FF', 'bg/ai-subtle': '#F3F0FF', 'bg/success-subtle': '#ECFDF3',
  'bg/warning-subtle': '#FFF6E5', 'bg/danger-subtle': '#FEF0EF', 'bg/highlight': '#FDB022',
  'text/primary': '#111623', 'text/secondary': '#4B5567', 'text/tertiary': '#647084', 'text/on-brand': '#FFFFFF', 'text/brand': '#2446D8', 'text/link': '#1B36B0',
  'text/ai': '#5B3CD6', 'text/success': '#067647', 'text/warning': '#B54708', 'text/danger': '#B42318', 'text/inverse': '#FFFFFF', 'text/inverse-muted': '#C3CAD6',
  'border/subtle': '#DCE1E9', 'border/default': '#7D879A', 'border/strong': '#343D4E', 'border/brand': '#2446D8', 'border/danger': '#D92D20',
  'action/primary': '#2446D8', 'action/primary-hover': '#1B36B0', 'action/primary-pressed': '#16298A', 'action/danger': '#D92D20', 'action/disabled-bg': '#EBEEF3', 'action/disabled-text': '#8D96A8',
  'focus/ring': '#2446D8', 'focus/ring-on-dark': '#BCC9FF', 'accent/violet': '#7A5AF8', 'accent/saffron': '#FDB022', 'accent/coral': '#D92D20', 'accent/green': '#12B76A',
};
const TYPE = { // name: [family, weight, size, lineHeight(px), letterSpacing, upper]
  'display/2xl': ['Roboto', 700, 88, 96, -2], 'display/xl': ['Roboto', 700, 72, 80, -1.5], 'display/l': ['Roboto', 700, 56, 64, -1], 'display/m': ['Roboto', 700, 44, 52, -0.5],
  'headline/l': ['Roboto', 600, 36, 44, -0.5], 'headline/m': ['Roboto', 600, 28, 36, -0.25], 'headline/s': ['Roboto', 600, 24, 32, 0],
  'title/l': ['Roboto', 600, 20, 28, 0], 'title/m': ['Roboto', 600, 18, 26, 0],
  'body/xl': ['Roboto', 400, 20, 32, 0], 'body/l': ['Roboto', 400, 18, 28, 0], 'body/m': ['Roboto', 400, 16, 24, 0], 'body/m-strong': ['Roboto', 500, 16, 24, 0],
  'label/xl': ['Roboto', 500, 20, 28, 0], 'label/l': ['Roboto', 500, 18, 24, 0], 'label/m': ['Roboto', 500, 16, 20, 0], 'overline': ['Roboto', 600, 16, 20, 0.8, 1],
  'price/l': ['Roboto', 700, 24, 32, -0.25], 'price/m': ['Roboto', 700, 20, 28, 0], 'mono/m': ['Roboto Mono', 400, 16, 24, 0], 'mono/l': ['Roboto Mono', 500, 28, 36, 2],
  'tv/display': ['Roboto', 700, 80, 88, -1.5], 'tv/headline': ['Roboto', 600, 48, 56, -0.5], 'tv/title': ['Roboto', 600, 32, 40, 0], 'tv/body': ['Roboto', 400, 28, 40, 0], 'tv/label': ['Roboto', 500, 24, 32, 0],
};
const R = { xs: 4, s: 8, m: 12 }; // radius scale — hard cap 12
const EL = {
  e1: [[0, 1, 2, 0, 0.06], [0, 1, 3, 0, 0.1]], e2: [[0, 2, 4, -2, 0.06], [0, 4, 8, -2, 0.1]], e3: [[0, 4, 6, -2, 0.05], [0, 12, 16, -4, 0.1]],
  e4: [[0, 8, 8, -4, 0.04], [0, 20, 24, -4, 0.1]], e5: [[0, 24, 48, -12, 0.18]],
};
function shadows(level, color = '#101828') { return (EL[level] || []).map(([x, y, b, s, o]) => ({ style: 'drop-shadow', offsetX: x, offsetY: y, blur: b, spread: s, hidden: false, color: { color, opacity: o } })); }
function glow(color = '#2446D8') { return [{ style: 'drop-shadow', offsetX: 0, offsetY: 1, blur: 2, spread: 0, hidden: false, color: { color, opacity: 0.2 } }, { style: 'drop-shadow', offsetX: 0, offsetY: 6, blur: 16, spread: -4, hidden: false, color: { color, opacity: 0.35 } }]; }

// ---- library lookups (cached per call) ----
let __lc = null, __lt = null;
function LC() { if (!__lc || !__lc.__n) { __lc = {}; for (const c of penpot.library.local.colors) __lc[(c.path ? c.path.replace(/^Arasta\s*\/\s*/, '') + '/' : '') + c.name] = c; __lc.__n = 1; } return __lc; }
function LT() { if (!__lt || !__lt.__n) { __lt = {}; for (const t of penpot.library.local.typographies) __lt[(t.path ? t.path.replace(/^Arasta\s*\/\s*/, '') + '/' : '') + t.name] = t; __lt.__n = 1; } return __lt; }
function resetCaches() { __lc = null; __lt = null; }
function fill(name, op) { const c = LC()[name]; if (c) { const f = c.asFill(); if (op != null) f.fillOpacity = op; return f; } return { fillColor: COL[name] || name, fillOpacity: op ?? 1 }; }
function stroke(name, w = 1, align = 'inner', style = 'solid') { const c = LC()[name]; const s = c ? c.asStroke() : { strokeColor: COL[name] || name, strokeOpacity: 1 }; return Object.assign(s, { strokeWidth: w, strokeAlignment: align, strokeStyle: style }); }
const FONTS = {};
function font(fam) { return FONTS[fam] || (FONTS[fam] = penpot.fonts.all.find((f) => f.name === fam) || penpot.fonts.findByName(fam)); }
function fvar(fam, w) { const f = font(fam); return f.variants.find((v) => v.fontWeight == String(w) && v.fontStyle !== 'italic') || f.variants[0]; }

// ---- primitives ----
function setPad(fl, p) { if (p == null) return; const [t, r, b, l] = typeof p === 'number' ? [p, p, p, p] : p.length === 2 ? [p[0], p[1], p[0], p[1]] : p; fl.topPadding = t; fl.rightPadding = r; fl.bottomPadding = b; fl.leftPadding = l; }
function sizeIt(s, W, H) {
  if (typeof W === 'number' || typeof H === 'number') s.resize(typeof W === 'number' ? W : s.width, typeof H === 'number' ? H : s.height); // resize first: it resets sizing modes
  const lc = s.layoutChild;
  if (s.flex) { if (W === 'hug') s.flex.horizontalSizing = 'auto'; if (H === 'hug') s.flex.verticalSizing = 'auto'; }
  if (lc) {
    if (W === 'fill') lc.horizontalSizing = 'fill'; else if (W === 'hug') lc.horizontalSizing = 'auto'; else if (typeof W === 'number') lc.horizontalSizing = 'fix';
    if (H === 'fill') lc.verticalSizing = 'fill'; else if (H === 'hug') lc.verticalSizing = 'auto'; else if (typeof H === 'number') lc.verticalSizing = 'fix';
  }
}
// Board. o: dir, gap, rgap, cgap, p, bg(name|hex), bgo, grad, r, W, H, ai, jc, wrap, st(stroke name), sw, sa, clip, el(elevation), glow, name
function B(parent, name, o = {}) {
  const b = penpot.createBoard(); b.name = name;
  if (parent) parent.appendChild(b);
  b.fills = o.bg ? [fill(o.bg, o.bgo)] : o.grad ? [{ fillColorGradient: o.grad, fillOpacity: 1 }] : [];
  if (o.dir !== 'none') {
    const f = b.addFlexLayout(); f.dir = o.dir || 'column'; f.rowGap = o.rgap ?? o.gap ?? 0; f.columnGap = o.cgap ?? o.gap ?? 0; setPad(f, o.p);
    f.alignItems = o.ai || 'stretch'; f.justifyContent = o.jc || 'start'; if (o.wrap) f.wrap = 'wrap';
  }
  if (o.r) b.borderRadius = Math.min(o.r, 12);
  if (o.st) b.strokes = [stroke(o.st, o.sw || 1, o.sa || 'inner', o.ss || 'solid')];
  if (o.el) b.shadows = shadows(o.el); else if (o.glow) b.shadows = glow(o.glow === true ? '#2446D8' : o.glow);
  b.clipContent = !!o.clip;
  sizeIt(b, o.W ?? 'hug', o.H ?? 'hug');
  return b;
}
// Text with library typography. o: c(color name), fill(true=wrap), align, name, u(underline), W
function T(parent, str, ty = 'body/m', o = {}) {
  const t = penpot.createText(String(str));
  const lt = LT()[ty];
  if (lt) lt.applyToText(t);
  else { const [fam, w, s, lh, ls, up] = TYPE[ty] || TYPE['body/m']; font(fam).applyToText(t, fvar(fam, w)); t.fontSize = String(Math.max(16, s)); t.lineHeight = String(+(lh / s).toFixed(3)); t.letterSpacing = String(ls); if (up) t.textTransform = 'uppercase'; }
  t.fills = [fill(o.c || 'text/primary')];
  if (o.align) t.align = o.align;
  if (o.u) t.textDecoration = 'underline';
  t.name = o.name || String(str).replace(/\n/g, ' ').slice(0, 48);
  if (parent) parent.appendChild(t);
  if (o.W) { t.resize(o.W, t.height); t.growType = 'auto-height'; }
  else if (o.fill) { t.growType = 'auto-height'; if (t.layoutChild) t.layoutChild.horizontalSizing = 'fill'; }
  else t.growType = 'auto-width';
  return t;
}
// Phosphor icon (native paths). o: s(size), c(color name), box, bg, r, st, style('regular'|'duotone'), name
function I(parent, name, o = {}) {
  const s = o.s || 24, box = o.box || s;
  const b = B(parent, o.name || `ph/${name}`, { dir: 'none', W: box, H: box, bg: o.bg, r: o.r, st: o.st, el: o.el });
  const inner = s / 256, off = (box - s) / 2;
  const data = (storage.PH[o.style || 'regular'] || {})[name] || storage.PH.regular[name] || storage.PH.regular['question'];
  for (const [d, op] of data) {
    const p = penpot.createPath(); p.content = d; p.name = name; p.strokes = [];
    p.fills = [fill(o.c || 'text/primary', op)];
    const x0 = p.x, y0 = p.y; p.resize(Math.max(0.5, p.width * inner), Math.max(0.5, p.height * inner));
    b.appendChild(p); penpotUtils.setParentXY(p, off + x0 * inner, off + y0 * inner);
  }
  return b;
}
// Media slot: pastel semi-flat gradient + large duotone category icon (no bitmap import)
const TINTS = { // [from, to, iconColor]
  blue: ['#EEF2FF', '#D6DEFF', '#2446D8'], violet: ['#F3F0FF', '#E0D8FF', '#5B3CD6'], green: ['#ECFDF3', '#CDF3DE', '#067647'], saffron: ['#FFF6E5', '#FFE3B0', '#B54708'],
  coral: ['#FEF0EF', '#FBD3CF', '#B42318'], slate: ['#F4F6FA', '#DDE2EB', '#343D4E'], teal: ['#E8F8F7', '#C4ECE9', '#0E6B66'],
};
function MEDIA(parent, label, o = {}) { // o: W,H,tint,icon,r,iconSize,caption
  const [a, z, ic] = TINTS[o.tint || 'blue'];
  const m = B(parent, `media · ${label}`, { dir: 'column', ai: 'center', jc: 'center', W: o.W ?? 'fill', H: o.H ?? 200, r: o.r ?? R.s, clip: true,
    grad: { type: 'linear', startX: 0.1, startY: 0, endX: 0.9, endY: 1, width: 1, stops: [{ color: a, opacity: 1, offset: 0 }, { color: z, opacity: 1, offset: 1 }] } });
  const ring = Math.round(Math.min(o.iconSize || 64, (typeof o.H === 'number' ? o.H : 200) * 0.46));
  const halo = B(m, 'halo', { dir: 'row', ai: 'center', jc: 'center', W: Math.round(ring * 1.7), H: Math.round(ring * 1.7), r: 12, bg: '#FFFFFF', bgo: 0.55 });
  I(halo, o.icon || 'package', { s: ring, style: 'duotone', c: ic, name: 'illustration (aria-hidden)' });
  m.setPluginData('alt', label);
  return m;
}
function FOCUS(shape, dark) { // double ring: 2px gap + 2px ring (2.4.7 / 2.4.13-friendly)
  shape.strokes = [...shape.strokes, stroke(dark ? 'bg/inverse' : 'bg/surface', 2, 'outer'), stroke(dark ? 'focus/ring-on-dark' : 'focus/ring', 4, 'outer')];
  shape.name += ' [focus-visible]';
}
function DIV(parent, o = {}) { const r = penpot.createRectangle(); r.name = 'divider'; parent.appendChild(r); r.resize(o.w || 10, o.t || 1); r.fills = [fill(o.c || 'border/subtle')]; if (r.layoutChild) { if (o.v) { r.resize(o.t || 1, o.h || 24); } else if (!o.w) r.layoutChild.horizontalSizing = 'fill'; } return r; }
function SP(parent, W = 'fill', H = 1) { return B(parent, 'spacer', { dir: 'row', W, H }); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function FIXUP(root) {
  const list = penpotUtils.findShapes((s) => s.type === 'board' && s.layoutChild && !s.layoutChild.absolute &&
    ((s.layoutChild.horizontalSizing === 'fill' && s.layoutChild.verticalSizing === 'fix') || (s.layoutChild.verticalSizing === 'fill' && s.layoutChild.horizontalSizing === 'fix')), root);
  for (const s of list) { const h = s.layoutChild.horizontalSizing, v = s.layoutChild.verticalSizing; s.resize(s.width, s.height); s.layoutChild.horizontalSizing = h; s.layoutChild.verticalSizing = v; }
  await sleep(150);
  let fixed = 0;
  for (let pass = 0; pass < 3; pass++) {
    const rows = penpotUtils.findShapes((s) => s.type === 'board' && s.flex && s.flex.dir === 'row' && s.flex.verticalSizing === 'auto' && s.height < 1 && s.children.length, root);
    if (!rows.length) break;
    for (const r of rows) for (const c of r.children) { if (!c.layoutChild || c.layoutChild.absolute) continue; const w = c.width, h = c.height, v = c.layoutChild.verticalSizing; c.resize(w, h); c.layoutChild.horizontalSizing = 'fix'; c.layoutChild.verticalSizing = v; fixed++; }
    await sleep(200);
  }
  return list.length + fixed;
}
