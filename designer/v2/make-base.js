const pg = '02 · Bileşenler · Temel';
if (penpot.currentPage.name !== pg) { await penpot.openPage(penpotUtils.getPageByName(pg)); await sleep(300); }
resetComps(); const L = penpot.library.local; const t0 = Date.now(); const out = [];
let Y = ARGS.y0;
function head(txt) { const t = T(null, txt, 'headline/m'); t.x = 0; t.y = Y; Y += 60; }
async function variantSet(name, items, cols) { // items: [{shape, props}]
  items.forEach(({ shape }, i) => { shape.x = (i % cols) * (ARGS.cellW || 260); shape.y = Y + Math.floor(i / cols) * (ARGS.cellH || 90); });
  const comps = items.map(({ shape, props }) => ({ shape: (L.createComponent([shape]), shape), properties: props }));
  const vc = penpotUtils.createVariantContainer(comps); vc.name = name;
  const vs = vc.variants; for (let k = vs.properties.length - 1; k >= 0; k--) if (/^Property \d+$/.test(vs.properties[k])) vs.removeProperty(k);
  await FIXUP(vc);
  Y += vc.height + 80; out.push(`${name}: ${items.length} (${vs.properties.join('×')})`);
}
const KINDS = { primary: 'Birincil', secondary: 'İkincil', tertiary: 'Üçüncül', danger: 'Tehlike' };
const STATES = ['Varsayılan', 'Hover', 'Basılı', 'Odak', 'Pasif', 'Yükleniyor'];
if (ARGS.part === 1) {
  head('Button · Tür × Durum');
  await variantSet('Button', Object.entries(KINDS).flatMap(([k, tr]) => STATES.map((s) => ({ shape: mkButton(k, s), props: { Tür: tr, Durum: s } }))), 6);
  head('IconButton · Tür × Durum');
  await variantSet('IconButton', ['ghost', 'tonal', 'outline', 'surface'].flatMap((k) => ['Varsayılan', 'Odak', 'Pasif'].map((s) => ({ shape: mkIconButton(k, s), props: { Tür: k, Durum: s } }))), 6);
}
if (ARGS.part === 2) {
  ARGS.cellW = 380; ARGS.cellH = 200;
  head('Input · Durum');
  await variantSet('Input', ['Varsayılan', 'Odak', 'Dolu', 'Hata', 'Pasif'].map((s) => ({ shape: mkInput(s), props: { Durum: s } })), 5);
  head('Select · Durum');
  await variantSet('Select', ['Varsayılan', 'Odak', 'Dolu', 'Hata', 'Pasif'].map((s) => ({ shape: mkInput(s, { select: true, kind: 'Select', icon: 'list' }), props: { Durum: s } })), 5);
  ARGS.cellH = 260;
  head('Textarea · Durum');
  await variantSet('Textarea', ['Varsayılan', 'Dolu', 'Hata'].map((s) => ({ shape: mkInput(s, { area: true, kind: 'Textarea' }), props: { Durum: s } })), 5);
}
if (ARGS.part === 3) {
  ARGS.cellW = 240; ARGS.cellH = 70;
  head('Checkbox · Değer × Durum');
  await variantSet('Checkbox', ['Seçili', 'Seçili değil', 'Belirsiz'].flatMap((v) => ['Varsayılan', 'Odak', 'Pasif'].map((s) => ({ shape: mkCheck('Checkbox', v, s), props: { Değer: v, Durum: s } }))), 3);
  head('Radio · Değer × Durum');
  await variantSet('Radio', ['Seçili', 'Seçili değil'].flatMap((v) => ['Varsayılan', 'Odak', 'Pasif'].map((s) => ({ shape: mkCheck('Radio', v, s), props: { Değer: v, Durum: s } }))), 3);
  head('Switch');
  await variantSet('Switch', ['Açık', 'Kapalı'].map((v) => ({ shape: mkSwitch(v), props: { Değer: v } })), 2);
  ARGS.cellW = 300;
  head('Chip · Tür × Durum');
  await variantSet('Chip', ['Filtre', 'AI öneri'].flatMap((k) => ['Varsayılan', 'Seçili'].map((s) => ({ shape: mkChip(k, s), props: { Tür: k, Durum: s } }))), 4);
  ARGS.cellW = 180; ARGS.cellH = 50;
  head('Badge · Ton');
  await variantSet('Badge', Object.keys(BADGE_T).map((t) => ({ shape: mkBadge(t), props: { Ton: t } })), 7);
  ARGS.cellW = 440; ARGS.cellH = 120;
  head('Toast · Ton');
  await variantSet('Toast', ['Başarı', 'Hata', 'Bilgi'].map((t) => ({ shape: mkToast(t), props: { Ton: t } })), 3);
  head('Diğer · Avatar, Rating, Stepper, Tooltip, Kbd, TierProgress, Skeleton');
  let x = 0; for (const s of [mkAvatar(), mkRating(), mkStepper(), mkTooltip(), mkKbd(), mkProgress(), mkSkeleton()]) { s.x = x; s.y = Y; await FIXUP(s); L.createComponent([s]); x += s.width + 60; out.push(s.name); }
}
resetComps();
return { out, ms: Date.now() - t0, Y };
