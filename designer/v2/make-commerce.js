const pg = '04 · Bileşenler · Ticaret';
if (penpot.currentPage.name !== pg) { await penpot.openPage(penpotUtils.getPageByName(pg)); await sleep(300); }
resetComps(); const L = penpot.library.local; const t0 = Date.now(); const out = [];
async function mk(s, x, y) { s.x = x; s.y = y; await FIXUP(s); L.createComponent([s]); out.push(s.name); return s; }
const P = ARGS.part;
if (typeof P === 'string' && /^card-(S|M|L|XL)$/.test(P)) { const sz = P.slice(5); const y = { S: 0, M: 600, L: 1300, XL: 2100 }[sz]; let x = 0; for (const st of ['Varsayılan', 'Hover', 'Yükleniyor']) { const s = await mk(mkProductCard(sz, st), x, y); x += s.width + 48; } }
if (P === 'card-variants') {
  const mains = penpot.root.children.filter((s) => /^ProductCard \/ (S|M|L|XL) \//.test(s.name) || /^ProductCard\/(S|M|L|XL)\//.test(s.name));
  const items = mains.map((s) => { const [, size, state] = s.name.replace(/\s/g, '').split('/'); return { shape: s, properties: { Boyut: size, Durum: state } }; });
  const vc = penpotUtils.createVariantContainer(items); vc.name = 'ProductCard'; const vs = vc.variants; for (let k = vs.properties.length - 1; k >= 0; k--) if (/^Property \d+$/.test(vs.properties[k])) vs.removeProperty(k); out.push('ProductCard ×' + items.length + ' ' + vs.properties.join('×'));
}
if (P === 'tv') { const a = await mk(mkTVCard(false), 0, 3000); const b = await mk(mkTVCard(true), 440, 3000); const vc = penpotUtils.createVariantContainer([{ shape: a, properties: { Durum: 'Varsayılan' } }, { shape: b, properties: { Durum: 'Odakta' } }]); vc.name = 'ProductCard/tv'; out.push('tv variants'); }
if (P === 'supplier') { await mk(mkSupplierCard('M'), 0, 3500); await mk(mkSupplierCard('S'), 480, 3500); await mk(mkCategoryTile('M'), 920, 3500); await mk(mkCategoryTile('S'), 1240, 3500); }
if (P === 'event') { let x = 0; for (const s of ['S', 'M', 'L']) { const e = await mk(mkEventCard(s), x, 4100); x += e.width + 48; } }
if (P === 'misc1') { await mk(mkPriceTiers(), 0, 4700); await mk(mkAISearch('L'), 560, 4700); await mk(mkAISearch('S'), 1340, 4700); }
if (P === 'misc2') { await mk(mkCompareTray(), 0, 5100); await mk(mkStatCard(), 1020, 5100); await mk(mkEmptyState(), 1360, 5100); let y = 5500; for (const st of ['Tamamlandı', 'Şimdi', 'Sırada']) { await mk(mkTimelineStep(st), 0, y); y += 90; } }
if (P === 'quote') { await mk(mkQuoteRow(true), 0, 5900); await mk(mkQuoteRow(false), 0, 6020); }
resetComps();
return { out, ms: Date.now() - t0 };
