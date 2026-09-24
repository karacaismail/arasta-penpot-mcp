const pg = '05 · İkonlar & İllüstrasyonlar';
if (penpot.currentPage.name !== pg) { await penpot.openPage(penpotUtils.getPageByName(pg)); await sleep(300); }
const L = penpot.library.local; const t0 = Date.now(); let n = 0;
const SIZES = ARGS.sizes;
for (const [si, size] of SIZES.entries()) {
  const lb = T(null, `Phosphor · ${size}px`, 'headline/s'); lb.x = 0; lb.y = ARGS.y0 + si * 600;
  UI_ICONS.forEach((name, k) => { const ic = mkIconComp(name, size); ic.x = (k % 28) * 72; ic.y = ARGS.y0 + si * 600 + 60 + Math.floor(k / 28) * 72; L.createComponent([ic]); n++; });
}
if (ARGS.illu) { const lb = T(null, 'İllüstrasyon · Phosphor duotone 56px', 'headline/s'); lb.x = 0; lb.y = ARGS.y0 + SIZES.length * 600; Object.keys(ILLU).forEach((k, i) => { const il = mkIllu(k); il.x = i * 96; il.y = ARGS.y0 + SIZES.length * 600 + 60; L.createComponent([il]); n++; }); }
resetComps();
return { n, ms: Date.now() - t0 };
