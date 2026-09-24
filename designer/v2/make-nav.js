const pg = '03 · Bileşenler · Navigasyon';
if (penpot.currentPage.name !== pg) { await penpot.openPage(penpotUtils.getPageByName(pg)); await sleep(300); }
resetComps(); const L = penpot.library.local; const t0 = Date.now(); const out = [];
let Y = ARGS.y0;
function head(txt) { const t = T(null, txt, 'headline/m'); t.x = 0; t.y = Y; Y += 60; }
async function mk(s, x) { s.x = x; s.y = Y; await FIXUP(s); const c = L.createComponent([s]); out.push(c.path + '/' + c.name); return s; }
async function vset(name, shapes, props, dx) { let x = 0; const items = []; for (const [i, s] of shapes.entries()) { s.x = x; s.y = Y; x += s.width + (dx || 40); await FIXUP(s); L.createComponent([s]); items.push({ shape: s, properties: props[i] }); } const vc = penpotUtils.createVariantContainer(items); vc.name = name; const vs = vc.variants; for (let k = vs.properties.length - 1; k >= 0; k--) if (/^Property \d+$/.test(vs.properties[k])) vs.removeProperty(k); out.push(name + ' ×' + shapes.length); return vc; }
if (ARGS.part === 1) {
  head('Header · telefon, yatay telefon, tablet'); let a = await mk(mkHeaderPhone(), 0); await mk(mkHeaderPhoneL(), 460); await mk(mkHeaderTablet(), 1360); Y += 200;
  head('Header · tablet yatay ve masaüstü'); a = await mk(mkHeaderDesk('Header/tablet-landscape', { w: 1024, pad: 32, ty: 'label/m', tyb: 'body/m', box: 44, logo: 32, util: false, nav: false, gap: 12 }), 0); Y += a.height + 60;
  a = await mk(mkHeaderDesk('Header/desktop', { w: 1440, pad: 40, ty: 'label/m', tyb: 'body/m', box: 44, logo: 32, util: true, nav: true }), 0); Y += a.height + 60;
}
if (ARGS.part === 2) {
  head('Header · 5K, 8K, TV'); let a = await mk(mkHeaderDesk('Header/wide-5k', { w: 2560, pad: 160, ty: 'label/l', tyb: 'body/l', box: 48, logo: 40, util: true, nav: true, navGap: 32, gap: 20 }), 0); Y += a.height + 60;
  a = await mk(mkHeaderDesk('Header/ultra-8k', { w: 3840, pad: 320, ty: 'label/xl', tyb: 'body/xl', box: 56, logo: 48, util: true, nav: true, navGap: 40, gap: 24 }), 0); Y += a.height + 60;
  a = await mk(mkHeaderTV(), 0); Y += a.height + 80;
}
if (ARGS.part === 3) {
  head('BottomNav (telefon) · Aktif sekme varyantları'); await vset('BottomNav/phone', TABS.map(([l]) => mkBottomNav(l)), TABS.map(([l]) => ({ Aktif: l }))); Y += 180;
  head('Rail (yatay telefon) · Aktif sekme varyantları'); const RL = ['Keşfet', 'Kategori', 'Teklifler', 'Sepet', 'Hesap']; await vset('Rail/phone-landscape', RL.map((l) => mkRail(l)), RL.map((l) => ({ Aktif: l }))); Y += 560;
}
if (ARGS.part === 4) {
  head('Footer · compact / regular'); let a = await mk(mkFooter('compact'), 0); const b = await mk(mkFooter('regular'), 500); Y += Math.max(a.height, b.height) + 60;
  head('Footer · large (5K) / xl (8K)'); a = await mk(mkFooter('large'), 0); Y += a.height + 60; a = await mk(mkFooter('xl'), 0); Y += a.height + 60;
}
if (ARGS.part === 5) {
  head('Overlay · ⌘K komut paleti, mega menü, filtre bottom sheet'); const a = await mk(mkCommandPalette(), 0); const b = await mk(mkMegaMenu(), 700); const c = await mk(mkBottomSheet(), 1960); Y += Math.max(a.height, b.height, c.height) + 60;
}
resetComps();
return { out, ms: Date.now() - t0, Y };
