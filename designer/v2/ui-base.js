// Arasta v2 · base components (buttons, inputs, selection, badges, feedback) — runs inside Penpot via MCP
const UI_ICONS = ['magnifying-glass', 'list', 'shopping-cart-simple', 'user', 'house', 'squares-four', 'file-text', 'chat-circle-dots', 'heart', 'shield-check', 'caret-right', 'caret-left', 'caret-down', 'globe-simple',
  'truck', 'clock', 'star', 'funnel-simple', 'check', 'check-circle', 'x', 'plus', 'minus', 'bell', 'microphone', 'camera', 'factory', 'lock-simple', 'arrow-right', 'arrow-left', 'sparkle', 'lightning', 'seal-check',
  'package', 'storefront', 'handshake', 'scales', 'calculator', 'map-pin', 'calendar-blank', 'upload-simple', 'download-simple', 'trash', 'pencil-simple', 'eye', 'eye-slash', 'info', 'warning-circle', 'question',
  'headset', 'envelope-simple', 'key', 'fingerprint', 'qr-code', 'command', 'sliders-horizontal', 'sort-ascending', 'bookmark-simple', 'share-network', 'copy', 'dots-three', 'receipt', 'credit-card', 'bank',
  'clipboard-text', 'chart-line-up', 'arrows-left-right', 'tag', 'percent', 'paper-plane-right', 'paperclip', 'circle-notch', 'arrow-square-out', 'file-csv', 'translate', 'robot', 'medal', 'users-three', 'buildings', 'play', 'trend-up', 'list-checks', 'timer', 'certificate'];
const ILLU = { textile: 't-shirt', machine: 'factory', food: 'leaf', build: 'cube', pack: 'package', electric: 'lightbulb', furniture: 'couch', chem: 'flask', auto: 'car', cosmetic: 'drop', coffee: 'coffee', handbag: 'handbag', gift: 'gift', tree: 'tree', wrench: 'wrench', boat: 'boat', warehouse: 'warehouse', chart: 'chart-bar' };

let __cc = null;
function CM() { if (!__cc) { __cc = {}; for (const c of penpot.library.local.components) { __cc[(c.path ? c.path.replace(/\s*\/\s*/g, '/') + '/' : '') + c.name] = c; if (c.isVariant && c.isVariant()) for (const v of c.variants.variantComponents()) __cc[(c.path ? c.path.replace(/\s*\/\s*/g, '/') + '/' : '') + c.name + '#' + Object.values(v.variantProps).join('|')] = v; } } return __cc; }
function resetComps() { __cc = null; }
function COMP(key) { const c = CM()[key]; if (!c) throw new Error('component missing: ' + key); return c; }
// Instance helper. key "Path/Name" or "Path/Name#Val1|Val2" for variants. o: W ('fill'|number), H(number)
function INST(parent, key, o = {}) {
  const i = COMP(key).instance(); if (parent) parent.appendChild(i);
  if (typeof o.W === 'number' || typeof o.H === 'number') i.resize(typeof o.W === 'number' ? o.W : i.width, typeof o.H === 'number' ? o.H : i.height);
  if (i.layoutChild) { if (o.W === 'fill') i.layoutChild.horizontalSizing = 'fill'; if (o.H === 'fill') i.layoutChild.verticalSizing = 'fill'; if (typeof o.W === 'number') i.layoutChild.horizontalSizing = 'fix'; }
  if (o.name) i.name = o.name;
  return i;
}
function SETT(inst, name, text) { const t = penpotUtils.findShape((s) => s.type === 'text' && s.name === name, inst); if (t) { if (text === '' || text == null) t.hidden = true; else t.characters = String(text); } return t; }
function HIDE(inst, name, hidden = true) { const s = penpotUtils.findShape((x) => x.name === name, inst); if (s) s.hidden = hidden; return s; }
function recolor(shape, color) { for (const p of penpotUtils.findShapes((s) => s.type === 'path', shape)) { const op = p.fills[0]?.fillOpacity ?? 1; p.fills = [fill(color, op)]; } }
// swap the nested icon found under slot name (default 'icon') and recolor it
function SETI(inst, iconName, color, slot = 'icon', size) {
  const ic = penpotUtils.findShape((s) => s.name === slot && s.isComponentInstance && s.isComponentInstance(), inst); if (!ic) return null;
  const sz = size || Math.round(ic.width);
  const key = `Icon/${sz}/${iconName}`; const c = CM()[key]; if (!c) return ic;
  ic.swapComponent(c);
  const now = penpotUtils.findShape((s) => s.name === slot || (s.isComponentInstance && s.isComponentInstance() && s.component()?.name === iconName), inst);
  if (color && now) recolor(now, color);
  return now;
}
// Icon instance (falls back to drawn paths when the component is missing)
function ICN(parent, name, size = 20, color, slot = 'icon') {
  const c = CM()[`Icon/${size}/${name}`];
  if (!c) { const d = I(parent, name, { s: size, c: color || 'text/primary' }); d.name = slot; return d; }
  const i = c.instance(); parent.appendChild(i); i.name = slot; if (color && color !== 'text/primary') recolor(i, color); return i;
}

// ---------- builders (return a detached board; make-scripts turn them into components) ----------
const BTN_STY = {
  primary: { bg: 'action/primary', c: 'text/on-brand', glow: true, hover: 'action/primary-hover', press: 'action/primary-pressed' },
  secondary: { bg: 'bg/surface', c: 'text/primary', st: 'border/default', el: 'e1', hover: 'bg/muted', press: 'bg/brand-subtle-2' },
  tertiary: { bg: 'bg/brand-subtle', c: 'text/brand', hover: 'bg/brand-subtle-2', press: 'bg/brand-subtle-2' },
  danger: { bg: 'action/danger', c: 'text/on-brand', glow: '#D92D20', hover: 'text/danger', press: 'text/danger' },
};
function mkButton(kind, state, o = {}) {
  const s = BTN_STY[kind]; const dis = state === 'Pasif', load = state === 'Yükleniyor';
  const bg = dis ? 'action/disabled-bg' : state === 'Hover' ? s.hover : state === 'Basılı' ? s.press : s.bg;
  const col = dis ? 'action/disabled-text' : s.c;
  const b = B(null, `Button/${kind}/${state}`, { dir: 'row', gap: 8, ai: 'center', jc: 'center', p: [0, o.px ?? 20], H: o.h || 44, W: 'hug', r: R.s, bg,
    st: !dis && s.st ? s.st : undefined, el: !dis && s.el && state !== 'Basılı' ? (state === 'Hover' ? 'e2' : s.el) : undefined, glow: !dis && s.glow && state !== 'Basılı' ? s.glow : undefined });
  ICN(b, load ? 'circle-notch' : 'arrow-right', 20, col, 'icon');
  T(b, load ? 'İşleniyor…' : 'Etiket', o.ty || 'label/m', { c: col, name: 'label' });
  if (state === 'Odak') FOCUS(b);
  return b;
}
function mkIconButton(kind, state, box = 44) {
  const dis = state === 'Pasif';
  const b = B(null, `IconButton/${kind}/${state}`, { dir: 'row', ai: 'center', jc: 'center', W: box, H: box, r: R.s,
    bg: dis ? 'action/disabled-bg' : kind === 'tonal' ? 'bg/brand-subtle' : kind === 'surface' ? 'bg/surface' : undefined, st: kind === 'outline' && !dis ? 'border/default' : undefined, el: kind === 'surface' && !dis ? 'e2' : undefined });
  ICN(b, 'heart', 20, dis ? 'action/disabled-text' : kind === 'tonal' ? 'text/brand' : 'text/primary', 'icon');
  if (state === 'Odak') FOCUS(b);
  return b;
}
function fieldShell(name, o = {}) {
  const f = B(null, name, { dir: 'column', gap: 6, W: o.w || 320, H: 'hug' });
  const lr = B(f, 'label-row', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' });
  T(lr, 'Etiket', 'label/m', { name: 'label', c: o.dis ? 'action/disabled-text' : 'text/primary' }); T(lr, '(zorunlu)', 'body/m', { name: 'hint', c: 'text/tertiary' });
  return f;
}
function mkInput(state, o = {}) {
  const dis = state === 'Pasif', err = state === 'Hata', foc = state === 'Odak', filled = state === 'Dolu' || err || foc;
  const f = fieldShell(`${o.kind || 'Input'}/${state}`, { dis });
  const box = B(f, 'field', { dir: 'row', gap: 8, ai: o.area ? 'start' : 'center', p: [o.area ? 12 : 0, 12], W: 'fill', H: o.area ? 120 : 48, r: R.s,
    bg: dis ? 'action/disabled-bg' : 'bg/surface', st: err ? 'border/danger' : foc ? 'border/brand' : dis ? 'border/subtle' : 'border/default', sw: err || foc ? 2 : 1 });
  if (!o.area) ICN(box, o.icon || 'magnifying-glass', 20, 'text/tertiary', 'icon');
  T(box, filled ? 'Organik pamuk penye kumaş' : 'Yer tutucu metin', 'body/m', { name: 'value', c: dis ? 'action/disabled-text' : filled ? 'text/primary' : 'text/tertiary', fill: true });
  if (o.select) ICN(box, 'caret-down', 20, 'text/secondary', 'trailing');
  if (foc) box.shadows = [{ style: 'drop-shadow', offsetX: 0, offsetY: 0, blur: 0, spread: 4, hidden: false, color: { color: '#2446D8', opacity: 0.16 } }];
  T(f, 'Yardımcı metin: örnek değer ve biçim.', 'body/m', { name: 'help', c: 'text/tertiary', fill: true });
  if (err) { const e = B(f, 'error (role=alert)', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' }); ICN(e, 'warning-circle', 20, 'text/danger', 'error-icon'); T(e, 'Bu alan zorunludur. Örnek: 5.000', 'body/m-strong', { name: 'error', c: 'text/danger', fill: true }); }
  return f;
}
function mkCheck(kind, value, state) { // kind: Checkbox | Radio
  const dis = state === 'Pasif', on = value !== 'Seçili değil';
  const r = B(null, `${kind}/${value}/${state}`, { dir: 'row', gap: 12, ai: 'center', H: 44, W: 'hug' });
  const box = B(r, 'control', { dir: 'row', ai: 'center', jc: 'center', W: 24, H: 24, r: kind === 'Radio' ? 12 : R.xs,
    bg: dis ? 'action/disabled-bg' : on && kind === 'Checkbox' ? 'action/primary' : 'bg/surface', st: dis ? 'border/subtle' : on ? 'border/brand' : 'border/default', sw: on && kind === 'Radio' ? 2 : 1.5 });
  if (kind === 'Checkbox' && on) ICN(box, value === 'Belirsiz' ? 'minus' : 'check', 20, dis ? 'action/disabled-text' : 'text/on-brand', 'mark');
  if (kind === 'Radio' && on) B(box, 'dot', { W: 12, H: 12, r: 6, bg: dis ? 'action/disabled-text' : 'action/primary' });
  if (state === 'Odak') FOCUS(box);
  T(r, 'Seçenek etiketi', 'body/m', { name: 'label', c: dis ? 'action/disabled-text' : 'text/primary' });
  return r;
}
function mkSwitch(value) {
  const on = value === 'Açık';
  const r = B(null, `Switch/${value}`, { dir: 'row', gap: 12, ai: 'center', H: 44, W: 'hug' });
  const tr = B(r, 'track', { dir: 'row', ai: 'center', jc: on ? 'end' : 'start', p: 2, W: 44, H: 24, r: 12, bg: on ? 'action/primary' : 'border/default' });
  B(tr, 'knob', { W: 20, H: 20, r: 10, bg: 'bg/surface', el: 'e1' });
  T(r, 'Ayar etiketi', 'body/m', { name: 'label' });
  return r;
}
function mkChip(kind, state) {
  const on = state === 'Seçili', ai = kind === 'AI öneri';
  const c = B(null, `Chip/${kind}/${state}`, { dir: 'row', gap: 6, ai: 'center', p: [0, 12], H: 36, W: 'hug', r: R.m,
    bg: ai ? 'bg/ai-subtle' : on ? 'bg/brand-subtle' : 'bg/surface', st: ai ? undefined : on ? 'border/brand' : 'border/default' });
  ICN(c, ai ? 'sparkle' : on ? 'check' : 'plus', 16, ai ? 'text/ai' : on ? 'text/brand' : 'text/secondary', 'icon');
  T(c, ai ? 'Denizli’den organik penye' : 'Filtre', 'label/m', { name: 'label', c: ai ? 'text/ai' : on ? 'text/brand' : 'text/primary' });
  if (on && !ai) ICN(c, 'x', 16, 'text/brand', 'remove');
  return c;
}
const BADGE_T = { Nötr: ['bg/muted', 'text/secondary', 'info'], Marka: ['bg/brand-subtle', 'text/brand', 'medal'], Başarı: ['bg/success-subtle', 'text/success', 'seal-check'], Uyarı: ['bg/warning-subtle', 'text/warning', 'clock'],
  Hata: ['bg/danger-subtle', 'text/danger', 'lightning'], AI: ['bg/ai-subtle', 'text/ai', 'sparkle'], Premium: ['bg/inverse', 'text/inverse', 'medal'] };
function mkBadge(tone) {
  const [bg, c, ic] = BADGE_T[tone];
  const b = B(null, `Badge/${tone}`, { dir: 'row', gap: 4, ai: 'center', p: [0, 10, 0, 8], H: 24, W: 'hug', r: 12, bg });
  ICN(b, ic, 16, c, 'icon'); T(b, tone === 'AI' ? 'Uyum %92' : tone, 'label/m', { name: 'label', c });
  return b;
}
function mkAvatar() { const a = B(null, 'Avatar/company', { dir: 'row', ai: 'center', jc: 'center', W: 40, H: 40, r: R.m, grad: { type: 'linear', startX: 0, startY: 0, endX: 1, endY: 1, width: 1, stops: [{ color: '#2446D8', opacity: 1, offset: 0 }, { color: '#7A5AF8', opacity: 1, offset: 1 }] } }); T(a, 'DT', 'label/m', { name: 'initials', c: 'text/on-brand' }); return a; }
function mkRating() { const r = B(null, 'Rating', { dir: 'row', gap: 4, ai: 'center', W: 'hug', H: 'hug' }); const s = ICN(r, 'star', 16, 'accent/saffron', 'icon'); recolor(s, 'accent/saffron'); T(r, '4,8', 'label/m', { name: 'value' }); T(r, '(312)', 'body/m', { name: 'count', c: 'text/tertiary' }); return r; }
function mkStepper() {
  const s = B(null, 'Stepper', { dir: 'row', ai: 'center', H: 48, W: 'hug', r: R.s, st: 'border/default', bg: 'bg/surface' });
  const m = B(s, 'button · Azalt', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 'fill' }); ICN(m, 'minus', 20);
  const v = B(s, 'value (spinbutton)', { dir: 'row', ai: 'center', jc: 'center', W: 96, H: 'fill' }); T(v, '2.000', 'label/m', { name: 'value' });
  const p = B(s, 'button · Artır', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 'fill' }); ICN(p, 'plus', 20);
  return s;
}
function mkTooltip() { const t = B(null, 'Tooltip', { dir: 'column', p: [8, 12], W: 'hug', H: 'hug', r: R.s, bg: 'bg/inverse', el: 'e3' }); T(t, 'Tooltip metni', 'body/m', { name: 'label', c: 'text/inverse' }); return t; }
function mkToast(tone) {
  const map = { Başarı: ['check-circle', 'text/success'], Hata: ['warning-circle', 'text/danger'], Bilgi: ['info', 'text/brand'] }[tone];
  const t = B(null, `Toast/${tone}`, { dir: 'row', gap: 12, ai: 'start', p: 16, W: 400, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle', el: 'e4' });
  ICN(t, map[0], 24, map[1], 'icon');
  const tx = B(t, 'text (role=status)', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); T(tx, 'Teklif talebiniz gönderildi', 'title/m', { name: 'title', fill: true }); T(tx, '12 doğrulanmış üreticiye iletildi.', 'body/m', { name: 'desc', c: 'text/secondary', fill: true });
  const x = B(t, 'button · Kapat', { dir: 'row', ai: 'center', jc: 'center', W: 32, H: 32, r: R.s }); ICN(x, 'x', 20, 'text/secondary');
  return t;
}
function mkKbd() { const k = B(null, 'Kbd', { dir: 'row', gap: 2, ai: 'center', p: [0, 6], H: 24, W: 'hug', r: R.xs, bg: 'bg/surface', st: 'border/subtle' }); T(k, '⌘K', 'mono/m', { name: 'label', c: 'text/secondary' }); return k; }
function mkProgress() {
  const p = B(null, 'TierProgress', { dir: 'column', gap: 6, W: 320, H: 'hug' });
  const tr = B(p, 'track', { dir: 'row', W: 'fill', H: 8, r: 4, bg: 'bg/muted' }); B(tr, 'fill', { W: 180, H: 8, r: 4, bg: 'action/primary' });
  const lb = B(p, 'labels', { dir: 'row', jc: 'space-between', W: 'fill', H: 'hug' }); T(lb, '2.000 m', 'label/m', { name: 'current' }); T(lb, 'Sonraki kademe: 10.000 m', 'body/m', { name: 'next', c: 'text/tertiary' });
  return p;
}
function mkSkeleton(w = 260) {
  const s = B(null, 'Skeleton/card', { dir: 'column', gap: 10, p: 8, W: w, H: 'hug', r: R.m, bg: 'bg/surface', st: 'border/subtle' });
  B(s, 'media', { W: 'fill', H: Math.round(w * 0.75), r: R.s, bg: 'bg/muted' }); B(s, 'line', { W: Math.round(w * 0.8), H: 16, r: 4, bg: 'bg/muted' }); B(s, 'line', { W: Math.round(w * 0.5), H: 16, r: 4, bg: 'bg/muted' }); B(s, 'line', { W: Math.round(w * 0.6), H: 24, r: 4, bg: 'bg/muted' });
  return s;
}
function mkIconComp(name, size) { const i = I(null, name, { s: size, c: 'text/primary' }); i.name = `Icon/${size}/${name}`; return i; }
function mkIllu(key, size = 56) { const i = I(null, ILLU[key], { s: size, style: 'duotone', c: 'text/brand' }); i.name = `Illu/${key}`; return i; }
