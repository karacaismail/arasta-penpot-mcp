// Page builders + runner (runs inside Penpot via MCP)
const BUILD = {};
const GROUPS = [['Telefon · dikey', ['P320', 'P360', 'P390', 'P430']], ['Telefon · yatay', ['L480', 'L844', 'L932']], ['Tablet · dikey', ['T600', 'T768', 'T1024P']],
  ['Tablet · yatay', ['T960', 'T1024L', 'T1366']], ['Laptop & desktop', ['K1280', 'K1440', 'K1728', 'D1920']], ['Büyük ekranlar · 5K, 4K TV, 8K', ['W2560', 'TV', 'U8K']]];
function slot(id) { for (const [gi, [, ids]] of GROUPS.entries()) { const k = ids.indexOf(id); if (k >= 0) { let x = 0; for (let j = 0; j < k; j++) x += DEVS.find((d) => d.id === ids[j]).w + 160; return { x, y: gi * 30000 }; } } }
async function RUN(pageName, key, ids) {
  if (penpot.currentPage.name !== pageName) { await penpot.openPage(penpotUtils.getPageByName(pageName)); await sleep(300); }
  const out = [];
  for (const id of ids) {
    const t0 = Date.now(); const d = DEVS.find((x) => x.id === id); const { x, y } = slot(id);
    penpot.root.children.filter((s) => s.getPluginData && s.getPluginData('dev') === id).forEach((s) => s.remove());
    try { const f = await BUILD[key](d, x, y); await sleep(200); out.push(`${id} ok ${Date.now() - t0}ms h=${Math.round(f.height)} shapes=${penpotUtils.findShapes(() => true, f).length}`); }
    catch (e) { out.push(`${id} ERR ${e.message} @${Date.now() - t0}ms`); }
  }
  return out;
}
async function ARRANGE(pageName, title) {
  if (penpot.currentPage.name !== pageName) { await penpot.openPage(penpotUtils.getPageByName(pageName)); await sleep(300); }
  for (const s of penpotUtils.findShapes((s) => s.parent && s.parent.id === penpot.root.id && s.getPluginData('label') === '1', penpot.root)) s.remove();
  const frames = penpot.root.children.filter((s) => s.getPluginData && s.getPluginData('dev'));
  let y = 0;
  const pt = T(null, title, { f: 'serif', s: 96, w: 500 }); pt.x = 0; pt.y = -260; pt.setPluginData('label', '1');
  const sub = T(null, 'Adaptive-first: her cihaz ailesi ayrı UI ve ayrı bileşenler kullanır · min yazı 16px (1rem) · max radius 12px · WCAG 2.2 AA', { s: 32, c: C.muted }); sub.x = 0; sub.y = -130; sub.setPluginData('label', '1');
  for (const [name, ids] of GROUPS) {
    const row = ids.map((id) => frames.find((f) => f.getPluginData('dev') === id)).filter(Boolean);
    if (!row.length) continue;
    const lb = T(null, name, { s: 48, w: 600 }); lb.x = 0; lb.y = y; lb.setPluginData('label', '1');
    y += 100; let x = 0, mh = 0;
    for (const f of row) { f.x = x; f.y = y; x += f.width + 160; mh = Math.max(mh, f.height); }
    y += mh + 240;
  }
  return frames.length;
}
