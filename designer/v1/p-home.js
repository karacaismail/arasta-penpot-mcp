BUILD.home = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Ana Sayfa', x, y);
    const hero = B(sh.main, 'Hero (TV)', { dir: 'row', gap: 64, ai: 'center', p: [24, 96, 40, 96], W: 'fill', H: 'hug' });
    const tx = B(hero, 'copy', { dir: 'column', gap: 20, W: 760, H: 'hug' });
    T(tx, 'Seçkin Üretici Günleri', { s: 24, w: 600, up: true, ls: 2, c: C.goldOnDark });
    T(tx, 'Türkiye’nin en iyi atölyeleri, doğrudan fabrikadan.', { f: 'serif', s: 56, w: 500, c: C.onDark, fill: true, lh: 1.08 });
    const b = BTN(tx, 'Fırsatları keşfet', { kind: 'onDark', h: 64, s: 28, px: 32, icon: 'play', is: 24 });
    COUNTDOWN(tx, '23 sa 14 dk', { dark: true, s: 24, is: 24 });
    IMG(hero, 'Ege pamuk atölyesi, dokuma tezgâhı', { W: 'fill', H: 300, tone: 0, r: RADIUS.lg, p: 24 });
    TV_ROW(sh.main, 'Flash fırsatlar · şu an yayında', PRODS.slice(0, 5), 0);
    
    const hint = TV_HINT(sh.f); hint.layoutChild.absolute = true; penpotUtils.setParentXY(hint, 0, d.h - 110); hint.resize(d.w, 110);
    hint.fills = [{ fillColor: C.ink, fillOpacity: 1 }];
    return END(sh, d, { tab: null });
  }
  const sh = SHELL(d, 'Ana Sayfa', x, y);
  HERO(sh.main, d, {
    over: 'Seçkin Üretici Günleri', title: d.w <= 360 ? 'Türkiye’nin atölyeleri, doğrudan.' : 'Türkiye’nin en iyi atölyeleri, doğrudan fabrikadan.',
    body: 'Doğrulanmış 48.000 üreticiden toptan alım. Kademeli fiyat, numune talebi ve Ticaret Güvencesi ile korunan ödeme.',
    cta1: 'Flash fırsatları gör', cta2: 'Teklif İste', img: 'Ege pamuk atölyesi, dokuma tezgâhı', tone: 0,
    meta: d.fam === 'phone' ? null : [['shield', 'Ticaret Güvencesi'], ['check', 'Doğrulanmış üretici']],
  });
  TRUST(sh.main, d);
  EVENTS_SEC(sh.main, d);
  CATS_SEC(sh.main, d);
  PRODUCTS_SEC(sh.main, d);
  RFQ_BAND(sh.main, d);
  return END(sh, d, { tab: 'Keşfet' });
};
