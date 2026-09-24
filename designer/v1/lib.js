// Arasta design helpers — executed inside Penpot's plugin context via MCP execute_code.
// Everything below only calls the Penpot Plugin API (createBoard/createText/createPath, flex layout).

const C = {
  ink: '#111111', inkSoft: '#1F1C1A', paper: '#FFFFFF', ivory: '#F6F3EE', sand: '#EAE4DA',
  muted: '#5C5752', line: '#D6D0C7', border: '#857E75', accent: '#8C1D18', gold: '#7A4F0E',
  goldOnDark: '#E0B566', ok: '#1D6B3A', focus: '#0B57D0', focusOnDark: '#8AB4F8',
  onDark: '#FFFFFF', onDarkMuted: '#CFC8BE',
};
const RADIUS = { none: 0, sm: 4, md: 8, lg: 12 }; // hard cap: 12

const FONT = { sans: penpot.fonts.findByName('Inter'), serif: penpot.fonts.findByName('Bodoni Moda') };
function fv(f, w, italic) {
  const font = FONT[f];
  return font.variants.find((v) => v.fontWeight == String(w) && (italic ? v.fontStyle === 'italic' : v.fontStyle !== 'italic')) || font.variants[0];
}

function setPad(fl, p) {
  if (p == null) return;
  const [t, r, b, l] = typeof p === 'number' ? [p, p, p, p] : p.length === 2 ? [p[0], p[1], p[0], p[1]] : p;
  fl.topPadding = t; fl.rightPadding = r; fl.bottomPadding = b; fl.leftPadding = l;
}

// W/H: number (fixed) | 'fill' | 'hug'
function sizeIt(s, W, H) {
  // NOTE: resize() silently resets layoutChild sizing to 'fix' in Penpot 2.18 -> resize first, then set sizing modes
  if (typeof W === 'number' || typeof H === 'number') s.resize(typeof W === 'number' ? W : s.width, typeof H === 'number' ? H : s.height);
  const lc = s.layoutChild;
  if (s.flex) { if (W === 'hug') s.flex.horizontalSizing = 'auto'; if (H === 'hug') s.flex.verticalSizing = 'auto'; }
  if (lc) {
    if (W === 'fill') lc.horizontalSizing = 'fill'; else if (W === 'hug') lc.horizontalSizing = 'auto'; else if (typeof W === 'number') lc.horizontalSizing = 'fix';
    if (H === 'fill') lc.verticalSizing = 'fill'; else if (H === 'hug') lc.verticalSizing = 'auto'; else if (typeof H === 'number') lc.verticalSizing = 'fix';
  }
}

// Work-around for hug parents collapsing to 0 height: re-assert size of fill×fix children, then restore their modes.
async function FIXUP(root) {
  const list = penpotUtils.findShapes((s) => s.type === 'board' && s.layoutChild && !s.layoutChild.absolute &&
    ((s.layoutChild.horizontalSizing === 'fill' && s.layoutChild.verticalSizing === 'fix') || (s.layoutChild.verticalSizing === 'fill' && s.layoutChild.horizontalSizing === 'fix')), root);
  for (const s of list) { const h = s.layoutChild.horizontalSizing, v = s.layoutChild.verticalSizing; s.resize(s.width, s.height); s.layoutChild.horizontalSizing = h; s.layoutChild.verticalSizing = v; }
  await sleep(200);
  // Collapsed rows (row-flex, hug height, only fill-width children): pin children to their computed widths.
  let fixed = 0;
  for (let pass = 0; pass < 3; pass++) {
    const rows = penpotUtils.findShapes((s) => s.type === 'board' && s.flex && s.flex.dir === 'row' && s.flex.verticalSizing === 'auto' && s.height < 1 && s.children.length, root);
    if (!rows.length) break;
    for (const r of rows) for (const c of r.children) { if (!c.layoutChild || c.layoutChild.absolute) continue; const w = c.width, h = c.height, v = c.layoutChild.verticalSizing; c.resize(w, h); c.layoutChild.horizontalSizing = 'fix'; c.layoutChild.verticalSizing = v; fixed++; }
    await sleep(250);
  }
  return list.length + fixed;
}

// Board with flex layout. o: dir, gap, rgap, cgap, p, bg, r, W, H, ai, jc, wrap, stroke, sw, clip, shadow
function B(parent, name, o = {}) {
  const b = penpot.createBoard();
  b.name = name;
  if (parent) parent.appendChild(b);
  b.fills = o.bg ? [{ fillColor: o.bg, fillOpacity: o.bgo ?? 1 }] : o.grad ? [{ fillColorGradient: o.grad, fillOpacity: 1 }] : [];
  if (o.dir !== 'none') {
    const f = b.addFlexLayout();
    f.dir = o.dir || 'column';
    f.rowGap = o.rgap ?? o.gap ?? 0; f.columnGap = o.cgap ?? o.gap ?? 0;
    setPad(f, o.p);
    f.alignItems = o.ai || 'stretch';
    f.justifyContent = o.jc || 'start';
    if (o.wrap) f.wrap = 'wrap';
  }
  if (o.r) b.borderRadius = Math.min(o.r, 12);
  if (o.stroke) b.strokes = [{ strokeColor: o.stroke, strokeWidth: o.sw || 1, strokeAlignment: 'inner', strokeOpacity: 1, strokeStyle: 'solid' }];
  b.clipContent = !!o.clip;
  if (o.shadow) b.shadows = [{ style: 'drop-shadow', offsetX: 0, offsetY: 8, blur: 24, spread: 0, color: { color: '#111111', opacity: 0.12 } }];
  sizeIt(b, o.W ?? 'hug', o.H ?? 'hug');
  if (o.as) b.layoutChild && (b.layoutChild.alignSelf = o.as);
  return b;
}

// Text. o: f(sans|serif), s(size, min 16), w, i, lh, c, ls, up, align, fill(true => wraps within parent width), name, u(underline)
function T(parent, str, o = {}) {
  const t = penpot.createText(str);
  const f = o.f || 'sans';
  FONT[f].applyToText(t, fv(f, o.w || 400, o.i));
  t.fontSize = String(Math.max(16, o.s || 16)); // design rule: never below 1rem
  t.lineHeight = String(o.lh || (o.s >= 32 ? 1.15 : 1.5));
  if (o.ls != null) t.letterSpacing = String(o.ls);
  if (o.up) t.textTransform = 'uppercase';
  if (o.u) t.textDecoration = 'underline';
  t.fills = [{ fillColor: o.c || C.ink, fillOpacity: 1 }];
  if (o.align) t.align = o.align;
  t.name = o.name || str.replace(/\n/g, ' ').slice(0, 48);
  if (parent) parent.appendChild(t);
  if (o.fill) { t.growType = 'auto-height'; if (t.layoutChild) t.layoutChild.horizontalSizing = 'fill'; }
  else t.growType = 'auto-width';
  return t;
}

// Icons: hand-drawn 24×24 stroke paths (native Penpot path shapes)
const ICON = {
  search: 'M10.5 4C14.09 4 17 6.91 17 10.5C17 14.09 14.09 17 10.5 17C6.91 17 4 14.09 4 10.5C4 6.91 6.91 4 10.5 4Z M15.5 15.5L20 20',
  menu: 'M4 7H20 M4 12H20 M4 17H20',
  cart: 'M3 4H5.5L7.6 15H18L20 8H6.4 M9 18.5L9 20.5 M17 18.5L17 20.5',
  user: 'M12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4Z M4.5 20C5.7 16.2 8.5 14.5 12 14.5C15.5 14.5 18.3 16.2 19.5 20',
  home: 'M4 11L12 4L20 11V20H14V14H10V20H4Z',
  grid: 'M4 4H10V10H4Z M14 4H20V10H14Z M4 14H10V20H4Z M14 14H20V20H14Z',
  rfq: 'M6 3H14L19 8V21H6Z M14 3V8H19 M9 13H16 M9 17H16',
  msg: 'M4 5H20V16H9L5 20V16H4Z',
  heart: 'M12 20L4.5 12.5C2.5 10.5 2.8 7 5.5 5.8C7.6 4.9 10 5.6 12 8C14 5.6 16.4 4.9 18.5 5.8C21.2 7 21.5 10.5 19.5 12.5Z',
  shield: 'M12 3L19 6V11C19 15.5 16 19 12 21C8 19 5 15.5 5 11V6Z M9 12L11 14L15 10',
  chevR: 'M9 5L16 12L9 19', chevL: 'M15 5L8 12L15 19', chevD: 'M5 9L12 16L19 9',
  globe: 'M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3Z M3 12H21 M12 3C15 6 15 18 12 21C9 18 9 6 12 3Z',
  truck: 'M2 6H14V16H2Z M14 10H18L21 13V16H14 M5 16V19 M17 16V19',
  clock: 'M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3Z M12 7V12L15 14',
  star: 'M12 3L14.6 8.9L21 9.5L16.2 13.8L17.6 20.1L12 16.8L6.4 20.1L7.8 13.8L3 9.5L9.4 8.9Z',
  filter: 'M4 5H20L14 12.5V19L10 21V12.5Z',
  check: 'M5 12L10 17L19 7',
  x: 'M6 6L18 18 M18 6L6 18', plus: 'M12 5V19 M5 12H19', minus: 'M5 12H19',
  bell: 'M6 16V11C6 7.7 8.7 5 12 5C15.3 5 18 7.7 18 11V16L20 18H4Z M10 20H14',
  play: 'M8 5L19 12L8 19Z', mic: 'M12 3C13.66 3 15 4.34 15 6V12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12V6C9 4.34 10.34 3 12 3Z M5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11 M12 18V21',
  camera: 'M3 8H7L9 5H15L17 8H21V19H3Z M12 10C13.66 10 15 11.34 15 13C15 14.66 13.66 16 12 16C10.34 16 9 14.66 9 13C9 11.34 10.34 10 12 10Z',
  factory: 'M3 21V10L9 13V10L15 13V5H20V21Z M7 17H9 M11 17H13 M15 17H17',
  lock: 'M6 11H18V20H6Z M8.5 11V8C8.5 6.07 10.07 4.5 12 4.5C13.93 4.5 15.5 6.07 15.5 8V11',
  arrowR: 'M4 12H19 M13 6L19 12L13 18',
};

// Icon inside a box (box >= 24; interactive targets use 44–48 box). o: s(icon px), box, c, sw, name, bg, r, stroke
function I(parent, key, o = {}) {
  const s = o.s || 24, box = o.box || s;
  const b = B(parent, o.name || `icon/${key}`, { dir: 'row', ai: 'center', jc: 'center', W: box, H: box, bg: o.bg, r: o.r, stroke: o.stroke });
  const p = penpot.createPath();
  p.content = ICON[key];
  p.name = key;
  p.fills = key === 'star' && o.solid ? [{ fillColor: o.c || C.ink, fillOpacity: 1 }] : [];
  p.strokes = [{ strokeColor: o.c || C.ink, strokeWidth: o.sw || (s >= 32 ? 2.25 : 1.75), strokeAlignment: 'center', strokeOpacity: 1, strokeStyle: 'solid', strokeCapStart: 'round', strokeCapEnd: 'round' }];
  b.appendChild(p);
  const k = s / 24;
  p.resize(Math.max(1, p.width * k), Math.max(1, p.height * k));
  return b;
}

// Image slot (no bitmap import — tonal gradient + caption; real photography is replaced at build time)
const TONES = [
  ['#EDE6DB', '#C9BBA6'], ['#E4E7E3', '#AFB8AE'], ['#EEE2DE', '#C7A79E'], ['#E3E6EC', '#A9B1C0'], ['#F1EADF', '#D2B98F'], ['#E7E3EA', '#B6ABBF'],
];
function IMG(parent, label, o = {}) {
  const [a, z] = TONES[(o.tone ?? 0) % TONES.length];
  const b = B(parent, `Görsel · ${label}`, {
    dir: 'column', jc: 'end', ai: 'start', p: o.p ?? 12, W: o.W ?? 'fill', H: o.H ?? 200, r: o.r ?? 0, clip: true,
    grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: a, opacity: 1, offset: 0 }, { color: z, opacity: 1, offset: 1 }] },
  });
  if (o.caption !== false) T(b, o.caption || label, { s: 16, c: C.inkSoft, w: 500, name: 'alt metni (görsel açıklaması)' });
  return b;
}

// Buttons. kind: primary | secondary | ghost | accent | onDark ; size: m (44) | l (48) | xl (TV 64)
function BTN(parent, label, o = {}) {
  const k = o.kind || 'primary', h = o.h || 48;
  const sty = {
    primary: { bg: C.ink, c: C.onDark }, secondary: { bg: C.paper, c: C.ink, stroke: C.ink }, ghost: { c: C.ink },
    accent: { bg: C.accent, c: C.onDark }, onDark: { bg: C.paper, c: C.ink }, outlineDark: { c: C.onDark, stroke: C.onDark },
  }[k];
  const b = B(parent, `Button/${k}${o.focus ? ' · focus' : ''} · ${label}`, {
    dir: 'row', gap: 8, ai: 'center', jc: 'center', p: [0, o.px ?? 24], H: h, W: o.W ?? 'hug', bg: sty.bg, stroke: sty.stroke, sw: o.sw || (sty.stroke ? 1.5 : 1), r: o.r ?? RADIUS.sm,
  });
  if (o.icon) I(b, o.icon, { c: sty.c, s: o.is || 20 });
  T(b, label, { s: o.s || 16, w: 600, c: sty.c, ls: o.up ? 1.2 : 0, up: o.up });
  if (o.iconR) I(b, o.iconR, { c: sty.c, s: o.is || 20 });
  if (o.focus) FOCUS(b, o.dark);
  return b;
}

// WCAG 2.4.7 / 2.4.13-style visible focus: 3px ring with 2px offset (ring drawn as outer stroke)
function FOCUS(shape, onDark) {
  shape.strokes = [...shape.strokes, { strokeColor: onDark ? C.focusOnDark : C.focus, strokeWidth: 3, strokeAlignment: 'outer', strokeOpacity: 1, strokeStyle: 'solid' }];
  shape.name += ' [focus-visible]';
}

function DIV(parent, o = {}) { // hairline divider
  const r = penpot.createRectangle();
  r.name = 'divider'; parent.appendChild(r);
  r.resize(o.w || 10, o.t || 1); r.fills = [{ fillColor: o.c || C.line, fillOpacity: 1 }];
  if (r.layoutChild) { if (o.v) { r.layoutChild.verticalSizing = 'fill'; r.resize(o.t || 1, 10); } else r.layoutChild.horizontalSizing = 'fill'; }
  return r;
}

function SPACER(parent, o = {}) { const s = B(parent, 'spacer', { dir: 'row', W: o.W ?? 'fill', H: o.H ?? 1 }); return s; }

// A11y annotation chip (kept on a hidden-by-default layer group per frame)
function NOTE(parent, text) {
  const n = B(parent, 'a11y-note', { dir: 'row', p: [4, 8], bg: '#FFF4CC', stroke: '#8A6D00', r: 4, W: 'hug', H: 'hug' });
  T(n, text, { s: 16, c: '#3D3000' });
  return n;
}

// Top-level device frame on the current page. Hugs content height (full-page capture); ruler guide marks the fold.
function FRAME(name, w, h, x, y, o = {}) {
  const f = B(null, name, { dir: 'column', W: w, H: 'hug', bg: o.bg || C.paper, clip: true });
  f.x = x; f.y = y;
  if (f.flex) f.flex.verticalSizing = 'auto';
  f.setPluginData('viewport', `${w}x${h}`);
  return f;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
