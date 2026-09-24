const lib = penpot.library.local; const out = { colors: 0, typos: 0, tokens: 0, err: [] };
for (const c of [...lib.colors]) { try { c.remove?.(); } catch (e) {} }
for (const [k, v] of Object.entries(COL)) { try { const c = lib.createColor(); const parts = k.split('/'); c.name = parts.pop(); c.path = 'Arasta / ' + parts.join(' / '); c.color = v; out.colors++; } catch (e) { out.err.push(k + ': ' + e.message); } }
for (const [k, [fam, w, s, lh, ls, up]] of Object.entries(TYPE)) {
  try { const t = lib.createTypography(); const parts = k.split('/'); t.name = parts.pop(); t.path = 'Arasta / ' + parts.join(' / '); t.setFont(font(fam), fvar(fam, w)); t.fontSize = String(s); t.lineHeight = String(+(lh / s).toFixed(3)); t.letterSpacing = String(ls); if (up) t.textTransform = 'uppercase'; out.typos++; }
  catch (e) { out.err.push(k + ': ' + e.message); }
}
const cat = lib.tokens; const add = (set, type, name, value) => { try { set.addToken({ type, name, value: String(value) }); out.tokens++; } catch (e) { out.err.push(name + ': ' + e.message); } };
const prim = cat.addSet({ name: 'arasta/primitives' });
const P = { 'neutral.0': '#FFFFFF', 'neutral.25': '#FAFBFC', 'neutral.50': '#F4F6FA', 'neutral.100': '#EBEEF3', 'neutral.200': '#DCE1E9', 'neutral.300': '#C3CAD6', 'neutral.400': '#8D96A8', 'neutral.450': '#7D879A', 'neutral.500': '#647084', 'neutral.600': '#4B5567', 'neutral.700': '#343D4E', 'neutral.800': '#1E2533', 'neutral.900': '#111623',
  'blue.50': '#EEF2FF', 'blue.100': '#DDE4FF', 'blue.200': '#BCC9FF', 'blue.600': '#2446D8', 'blue.700': '#1B36B0', 'blue.800': '#16298A', 'violet.50': '#F3F0FF', 'violet.500': '#7A5AF8', 'violet.700': '#5B3CD6',
  'saffron.50': '#FFF6E5', 'saffron.400': '#FDB022', 'saffron.700': '#B54708', 'red.50': '#FEF0EF', 'red.600': '#D92D20', 'red.700': '#B42318', 'green.50': '#ECFDF3', 'green.500': '#12B76A', 'green.700': '#067647' };
for (const [k, v] of Object.entries(P)) add(prim, 'color', 'color.' + k, v);
[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128].forEach((v) => add(prim, 'spacing', 'space.' + v, v));
add(prim, 'borderRadius', 'radius.xs', 4); add(prim, 'borderRadius', 'radius.s', 8); add(prim, 'borderRadius', 'radius.m', 12); add(prim, 'borderRadius', 'radius.max', '{radius.m}');
add(prim, 'fontFamilies', 'font.family.sans', 'Roboto'); add(prim, 'fontFamilies', 'font.family.mono', 'Roboto Mono');
[16, 18, 20, 24, 28, 32, 36, 44, 48, 56, 72, 80, 88].forEach((s) => add(prim, 'fontSizes', 'font.size.' + s, s));
add(prim, 'fontWeights', 'font.weight.regular', 400); add(prim, 'fontWeights', 'font.weight.medium', 500); add(prim, 'fontWeights', 'font.weight.semibold', 600); add(prim, 'fontWeights', 'font.weight.bold', 700);
add(prim, 'borderWidth', 'border.width.default', 1); add(prim, 'borderWidth', 'focus.ring.width', 2); add(prim, 'borderWidth', 'focus.ring.offset', 2);
add(prim, 'sizing', 'target.wcag.min', 24); add(prim, 'sizing', 'target.touch', 44); add(prim, 'sizing', 'target.comfort', 48); add(prim, 'sizing', 'target.tv', 64);
add(prim, 'shadow', 'elevation.1', '0 1 2 0 rgba(16,24,40,0.06), 0 1 3 0 rgba(16,24,40,0.10)');
add(prim, 'shadow', 'elevation.2', '0 2 4 -2 rgba(16,24,40,0.06), 0 4 8 -2 rgba(16,24,40,0.10)');
add(prim, 'shadow', 'elevation.3', '0 4 6 -2 rgba(16,24,40,0.05), 0 12 16 -4 rgba(16,24,40,0.10)');
add(prim, 'shadow', 'elevation.4', '0 8 8 -4 rgba(16,24,40,0.04), 0 20 24 -4 rgba(16,24,40,0.10)');
[['xs', 320], ['s', 360], ['m', 390], ['l', 430], ['landscape', 480], ['tablet.s', 600], ['tablet.m', 768], ['tablet.l', 1024], ['laptop.s', 1280], ['laptop.m', 1440], ['laptop.l', 1728], ['desktop', 1920], ['wide5k', 2560], ['ultra8k', 3840]].forEach(([k, v]) => add(prim, 'dimension', 'breakpoint.' + k, v));
const light = cat.addSet({ name: 'arasta/semantic/light' }); const dark = cat.addSet({ name: 'arasta/semantic/dark' });
const SEM = { 'bg.canvas': ['neutral.50', 'neutral.900'], 'bg.surface': ['neutral.0', 'neutral.800'], 'bg.muted': ['neutral.100', 'neutral.700'], 'bg.brand': ['blue.600', 'blue.200'], 'bg.brand-subtle': ['blue.50', 'neutral.700'], 'bg.ai-subtle': ['violet.50', 'neutral.700'],
  'text.primary': ['neutral.900', 'neutral.0'], 'text.secondary': ['neutral.600', 'neutral.300'], 'text.tertiary': ['neutral.500', 'neutral.400'], 'text.brand': ['blue.600', 'blue.200'], 'text.danger': ['red.700', 'red.50'], 'text.success': ['green.700', 'green.50'],
  'border.subtle': ['neutral.200', 'neutral.700'], 'border.default': ['neutral.450', 'neutral.400'], 'focus.ring': ['blue.600', 'blue.200'], 'action.primary': ['blue.600', 'blue.200'] };
for (const [k, [l, dk]] of Object.entries(SEM)) { add(light, 'color', 'color.' + k, `{color.${l}}`); add(dark, 'color', 'color.' + k, `{color.${dk}}`); }
const FAMS = { phone: [16, 12, 16, 36, 2, 44], 'phone-landscape': [24, 12, 16, 28, 3, 44], tablet: [32, 16, 16, 44, 3, 44], 'tablet-landscape': [32, 16, 16, 44, 4, 44], desktop: [40, 24, 16, 56, 5, 44], 'wide-5k': [64, 32, 18, 72, 6, 48], 'ultra-8k': [96, 40, 20, 88, 8, 56], 'tv-10ft': [96, 32, 28, 80, 5, 64] };
const devSets = {};
for (const [k, [g, gap, body, hero, cols, tgt]] of Object.entries(FAMS)) { const s = cat.addSet({ name: 'arasta/device/' + k }); devSets[k] = s; add(s, 'spacing', 'layout.gutter', g); add(s, 'spacing', 'layout.gap', gap); add(s, 'fontSizes', 'text.body', body); add(s, 'fontSizes', 'text.hero', hero); add(s, 'number', 'layout.columns', cols); add(s, 'sizing', 'target.interactive', tgt); }
for (const [mode, set] of [['Açık', light], ['Koyu', dark]]) { try { const th = cat.addTheme({ group: 'Mod', name: mode }); th.addSet(prim); th.addSet(set); } catch (e) { out.err.push('theme ' + mode + ': ' + e.message); } }
for (const [k, s] of Object.entries(devSets)) { try { const th = cat.addTheme({ group: 'Cihaz', name: k }); th.addSet(s); } catch (e) { out.err.push('theme ' + k + ': ' + e.message); } }
[prim, light].forEach((s) => { if (!s.active) s.toggleActive(); });
out.sets = cat.sets.length; out.themes = cat.themes.length;
return out;
