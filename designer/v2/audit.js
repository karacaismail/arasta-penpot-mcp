// Arasta v2 · automated design audit (runs inside Penpot via MCP)
function __lum(h) { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function __cr(a, b) { const x = __lum(a), y = __lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function __visible(s) { let p = s; while (p) { if (p.hidden) return false; p = p.parent; } return true; }
function __bgColors(s) {
  let p = s.parent;
  while (p) {
    const f = (p.fills || []).find((x) => (x.fillOpacity ?? 1) >= 0.9 && (x.fillColor || x.fillColorGradient));
    if (f) return f.fillColor ? [f.fillColor] : f.fillColorGradient.stops.map((st) => st.color);
    p = p.parent;
  }
  return ['#FFFFFF'];
}
async function AUDIT(pageName, o = {}) {
  if (penpot.currentPage.name !== pageName) { await penpot.openPage(penpotUtils.getPageByName(pageName)); await sleep(300); }
  const frames = penpot.root.children.filter((s) => s.getPluginData && s.getPluginData('dev'));
  const res = [];
  for (const f of frames) {
    const dev = f.getPluginData('dev'); const fam = (DEVS.find((d) => d.id === dev) || {}).fam;
    const r = { dev, shapes: 0, texts: 0, small: [], radius: [], overflow: [], target: [], contrast: [], collapsed: [], unlinked: 0, fills: 0 };
    const all = penpotUtils.findShapes(() => true, f);
    const fx0 = f.x, fx1 = f.x + f.width;
    for (const s of all) {
      if (!__visible(s)) continue; r.shapes++;
      for (const fl of s.fills || []) { if (fl.fillColor) { r.fills++; if (!fl.fillColorRefId) r.unlinked++; } }
      if ((s.borderRadius || 0) > 12.01) r.radius.push(s.name + ':' + s.borderRadius);
      if (s.type === 'board' && s.width > 2 && s.height < 1 && s.children?.length) r.collapsed.push(s.name);
      if (s.type === 'text') {
        r.texts++;
        const fs = parseFloat(s.fontSize); if (fs < 16) r.small.push(`${s.name}:${fs}`);
        if (s.x < fx0 - 1 || s.x + s.width > fx1 + 1) r.overflow.push(s.name.slice(0, 40));
        const col = s.fills?.[0]?.fillColor; if (col) { const worst = Math.min(...__bgColors(s).map((b) => __cr(col, b))); const large = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700); if (worst < (large ? 3 : 4.5)) r.contrast.push(`${s.name.slice(0, 30)} ${worst.toFixed(2)}`); }
      }
      if (/^button ·|^IconButton|^tab ·|^fav ·/.test(s.name) || (s.isComponentInstance && s.isComponentInstance() && /Button|IconButton|Checkbox|Radio|Chip|Switch/.test(s.component()?.name || '') && s.parent && !/^Button|^IconButton/.test(s.parent.name))) {
        const min = fam === 'tv' ? 64 : ['phone', 'phoneL', 'tablet', 'tabletL'].includes(fam) ? 44 : 24;
        if (Math.min(s.width, s.height) < Math.min(min, 24) - 0.5) r.target.push(`${s.name.slice(0, 30)} ${Math.round(s.width)}×${Math.round(s.height)}`);
        else if (Math.min(s.width, s.height) < min - 0.5 && s.type === 'board') r.target.push(`(touch) ${s.name.slice(0, 26)} ${Math.round(s.width)}×${Math.round(s.height)}`);
      }
      if (s.type !== 'text' && s.parent === f && (s.x < fx0 - 1 || s.x + s.width > fx1 + 1) && !(s.layoutChild && s.layoutChild.absolute)) r.overflow.push('[blok] ' + s.name.slice(0, 30));
    }
    r.tokenAdherence = r.fills ? Math.round(100 * (1 - r.unlinked / r.fills)) : 100;
    for (const k of ['small', 'radius', 'overflow', 'target', 'contrast', 'collapsed']) { r[k + 'N'] = r[k].length; r[k] = r[k].slice(0, o.samples ?? 6); }
    res.push(r);
  }
  return res;
}
