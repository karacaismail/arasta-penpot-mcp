// Arasta v2 · page builders 18–24 — runs inside Penpot via MCP
function FIELDI(parent, d, label, value, o = {}) {
  const i = INST(parent, `${o.kind || 'Input'}#${o.state || (value ? 'Dolu' : 'Varsayılan')}`, { W: o.W ?? 'fill', name: 'Field · ' + label });
  SETT(i, 'label', label); if (value != null) SETT(i, 'value', value || o.ph || '');
  if (o.req) SETT(i, 'hint', '(zorunlu)'); else if (o.opt) SETT(i, 'hint', '(isteğe bağlı)'); else HIDE(i, 'hint');
  if (o.help) SETT(i, 'help', o.help); else HIDE(i, 'help');
  if (o.error) SETT(i, 'error', o.error);
  if (o.icon) SETI(i, o.icon, 'text/tertiary'); else if (!o.kind || o.kind === 'Input') HIDE(i, 'icon');
  return i;
}
function TWO(main, d, name, lw, o = {}) {
  const s = SECTION(main, name, d, { dir: WIDE(d) ? 'row' : 'column', ai: 'start', gap: o.gap ?? d.gap * 1.5, pt: o.pt ?? 16 });
  const L = B(s, o.ln || 'col-main', { dir: 'column', gap: d.gap, W: WIDE(d) ? lw : 'fill', H: 'hug' });
  const R2 = B(s, o.rn || 'col-aside', { dir: 'column', gap: d.gap, W: WIDE(d) ? d.cw - lw - (o.gap ?? d.gap * 1.5) : 'fill', H: 'hug' });
  return [L, R2, WIDE(d) ? lw : d.cw, WIDE(d) ? d.cw - lw - (o.gap ?? d.gap * 1.5) : d.cw];
}
function SUMROWS(parent, d, rows) { rows.forEach(([k, v, strong]) => { const r = B(parent, 'satır · ' + k, { dir: 'row', gap: 12, ai: 'end', W: 'fill', H: 'hug' }); TX(r, d, k, strong ? 'label' : 'body', { c: strong ? 'text/primary' : 'text/secondary', fill: true }); TX(r, d, v, strong ? 'price' : 'label'); }); }
function STICKYBAR(f, d, title, sub, label, icon) { const bar = B(f, 'Sabit eylem çubuğu', { dir: 'row', gap: 12, ai: 'center', p: [12, 16, 16, 16], W: d.w, H: 'hug', bg: 'bg/surface', st: 'border/subtle' }); bar.shadows = [{ style: 'drop-shadow', offsetX: 0, offsetY: -4, blur: 16, spread: -4, hidden: false, color: { color: '#101828', opacity: 0.1 } }]; const p = B(bar, 'özet', { dir: 'column', W: 'hug', H: 'hug' }); T(p, title, 'price/m'); T(p, sub, 'body/m', { c: 'text/tertiary' }); SP(bar); BTNI(bar, d, label, 'Birincil', icon); return bar; }

// ---------- 18 · AI RFQ ----------
BUILD.rfq = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Teklif İste (AI RFQ)', x, y, { over: 'Teklif asistanı', h1: 'Talebinizi sesle anlatın, formu telefonda onaylayın.', body: 'Uzun formlar uzaktan kumandayla zahmetlidir. Konuşun; AI talebi oluştursun, siz telefonunuzda kontrol edin.', steps: ['Mikrofon tuşuna basıp ihtiyacınızı söyleyin', 'QR kodu okutup taslağı telefonda açın', 'Teklifler bu ekranda ve telefonunuzda'], qr: 'Taslağı telefonda aç', cta: 'Sesle anlat', ctaIcon: 'microphone', side: 'Kod 10 dakika geçerli; süre dolarsa yenileyebilirsiniz (2.2.1).' });
  const sh = SHELL(d, 'Teklif İste (AI RFQ)', x, y, { tab: 'Teklifler' });
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Teklif İste'], 'Teklif talebi oluşturun', 'Ortalama 24 saatte 6 teklif · yalnızca doğrulanmış üreticiler');
  const [F, A, fw] = TWO(sh.main, d, 'Form + yardım', Math.min(960, Math.round(d.cw * 0.64)), { ln: 'form (RFQ)', rn: 'aside' });
  const ai = CARDBOX(F, 'AI taslak (textbox)', d, { bg: 'bg/ai-subtle', st: 'bg/ai-subtle', el: 'e0', gap: 12 });
  const ah = B(ai, 'başlık', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true }); BADGEI(ah, 'AI', 'Teklif asistanı', 'robot'); TX(ah, d, 'Serbest metinden formu doldurur', 'body', { c: 'text/ai' });
  const ta = FIELDI(ai, d, 'İhtiyacınızı anlatın', 'Denizli’den GOTS sertifikalı organik penye, 180 g/m², ekru ve antrasit, toplam 5.000 metre. İzmir’e 30 gün içinde teslim.', { kind: 'Textarea' });
  const aa = B(ai, 'eylemler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); BTNI(aa, d, 'Formu doldur', 'Birincil', 'sparkle'); BTNI(aa, d, 'Teknik çizim yükle', 'İkincil', 'upload-simple');
  const err = CARDBOX(F, 'Hata özeti (role=alert, odak buraya)', d, { dir: 'row', gap: 12, ai: 'start', bg: 'bg/danger-subtle', st: 'border/danger', el: 'e0', p: 16 }); ICN(err, 'warning-circle', 24, 'text/danger'); const et = B(err, 't', { dir: 'column', gap: 2, W: 'fill', H: 'hug' }); TX(et, d, '1 alanı kontrol edin', 'label', { c: 'text/danger', fill: true }); TX(et, d, 'Hedef birim fiyat: sayı olmalı (örn. 125,00)', 'body', { c: 'text/danger', u: true, fill: true });
  const steps = B(F, 'Adımlar (ol, aria-current=step)', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); [['Başarı', 'Ürün', 'check'], ['Marka', 'Miktar & teslimat', 'truck'], ['Nötr', 'Onay', 'list-checks']].forEach(([tn, l, ic]) => BADGEI(steps, tn, l, ic));
  const sec = (t) => { const c = CARDBOX(F, 'fieldset · ' + t, d, { gap: 16 }); TX(c, d, t, 'h3', { name: 'legend · ' + t }); return c; };
  const s1 = sec('Ürün');
  const aiField = (label, v) => { const w = B(s1, 'AI alanı · ' + label, { dir: 'column', gap: 6, W: 'fill', H: 'hug' }); FIELDI(w, d, label, v, { req: true }); const b = B(w, 'güven', { dir: 'row', gap: 6, ai: 'center', W: 'fill', H: 'hug' }); ICN(b, 'sparkle', 16, 'text/ai'); TX(b, d, 'AI tarafından dolduruldu · kontrol edin', 'body', { c: 'text/ai' }); };
  aiField('Ürün adı', 'Organik pamuk penye kumaş'); FIELDI(s1, d, 'Kategori', 'Tekstil › Örme kumaş › Penye', { kind: 'Select', req: true, icon: 'squares-four' });
  const s2 = sec('Miktar ve teslimat');
  const r1 = B(s2, 'miktar', { dir: d.w < 500 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug', ai: 'start' });
  const half = d.w < 500 ? 'fill' : ((WIDE(d) ? fw : d.cw) - (SMALL(d) ? 32 : 48) - 12) / 2;
  FIELDI(r1, d, 'Miktar', '5.000', { W: half, req: true }); FIELDI(r1, d, 'Birim', 'metre', { kind: 'Select', W: half });
  FIELDI(s2, d, 'Hedef birim fiyat', '125 TL', { state: 'Hata', opt: true, error: 'Sayı girin, örn. 125,00' });
  const r2 = B(s2, 'teslimat', { dir: d.w < 500 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug', ai: 'start' });
  FIELDI(r2, d, 'Teslim adresi', 'Karşıyaka, İzmir', { kind: 'Select', W: half, icon: 'map-pin' }); FIELDI(r2, d, 'Son teslim', '15.11.2026', { W: half, icon: 'calendar-blank', help: 'GG.AA.YYYY' });
  SETT(INST(s2, 'Checkbox#Seçili|Varsayılan'), 'label', 'Kayıtlı şirket adresimi kullan (3.3.7)');
  const up = B(s2, 'Dosya ekle', { dir: 'column', gap: 8, ai: 'center', p: 24, W: 'fill', H: 'hug', r: R.m, st: 'border/default', ss: 'dashed', bg: 'bg/subtle' }); ICONTILE(up, 'upload-simple', 'blue', 48); TX(up, d, 'Sürükleyip bırakın veya dosya seçin', 'label', { align: 'center', fill: true }); TX(up, d, 'PDF, DWG, JPG · en fazla 50 MB · sürüklemeye alternatif düğme (2.5.7)', 'body', { c: 'text/tertiary', align: 'center', fill: true }); BTNI(up, d, 'Dosya seç', 'İkincil', 'paperclip');
  const act = B(F, 'form eylemleri', { dir: d.w < 500 ? 'column-reverse' : 'row', gap: 12, W: 'fill', H: 'hug', jc: 'end' }); BTNI(act, d, 'Taslağı kaydet', 'İkincil', null, { W: d.w < 500 ? 'fill' : undefined }); BTNI(act, d, 'Talebi gönder', 'Birincil', 'paper-plane-right', { W: d.w < 500 ? 'fill' : undefined });
  const how = CARDBOX(A, 'Nasıl çalışır', d, { gap: 14 }); TX(how, d, 'Sonrasında ne olur?', 'h3');
  [['Tamamlandı', 'Talep oluşturuldu', 'Şimdi'], ['Şimdi', 'AI 12 uygun üreticiyi seçer', '≈ 5 dk'], ['Sırada', 'Teklifler karşılaştırmaya düşer', '≈ 24 sa']].forEach(([s, t, m]) => { const i = INST(how, `TimelineStep/${s}`, { W: 'fill' }); SETT(i, 'title', t); SETT(i, 'meta', m); });
  const hp = CARDBOX(A, 'Yardım (tutarlı konum · 3.2.6)', d, { dir: 'row', gap: 12, ai: 'center' }); ICONTILE(hp, 'headset', 'green', 44); const ht = B(hp, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(ht, d, 'İhracat masası', 'label', { fill: true }); TX(ht, d, 'Hafta içi 09–18 · 0850 000 00 00', 'body', { c: 'text/secondary', fill: true });
  return END(sh, { tab: 'Teklifler' });
};

// ---------- 19 · Quotes comparison ----------
BUILD.quotes = async (d, x, y) => {
  const Q = [['Ege Tekstil A.Ş.', 'ET', '₺121,00 / m', '18 gün', 'Ücretsiz', '%30 peşin', 1], ['Uşak Örme San.', 'UÖ', '₺126,50 / m', '24 gün', '₺350', '%50 peşin'], ['Bursa Kumaş', 'BK', '₺119,00 / m', '35 gün', '₺600', '%100 peşin'], ['Denizli Dokuma', 'DD', '₺131,00 / m', '15 gün', 'Ücretsiz', 'Vadeli 30 gün']];
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Teklif Karşılaştırma', x, y);
    const t = B(sh.main, 'teklifler', { dir: 'column', gap: 16, p: [16, 96], W: 'fill', H: 'hug' }); T(t, '4 teklif · organik penye 5.000 m', 'tv/headline', { c: 'text/inverse' });
    Q.slice(0, 3).forEach(([n, , p, l, , , best], i) => { const r = B(t, 'teklif · ' + n, { dir: 'row', gap: 32, ai: 'center', p: [16, 24], W: 'fill', H: 'hug', r: R.m, bg: i === 0 ? 'bg/surface' : 'bg/inverse-2' }); T(r, n, 'tv/title', { c: i === 0 ? 'text/primary' : 'text/inverse', W: 520 }); T(r, p, 'tv/title', { c: i === 0 ? 'text/primary' : 'text/inverse', W: 360 }); T(r, l, 'tv/body', { c: i === 0 ? 'text/secondary' : 'text/inverse-muted', W: 240 }); if (best) BADGEI(r, 'AI', 'En iyi değer', 'sparkle'); if (i === 0) FOCUS(r, true); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Teklif Karşılaştırma', x, y, { tab: 'Teklifler' });
  PAGEHEAD(sh.main, d, ['Hesabım', 'Teklif talepleri', 'RFQ-2026-0412'], 'Organik penye · 5.000 m', '4 teklif geldi · 2 bekleniyor · son yanıt 16 Eki', { actions: (hr) => { if (!SMALL(d)) { BTNI(hr, d, 'Excel’e aktar', 'İkincil', 'download-simple'); BTNI(hr, d, 'Onaya gönder', 'Birincil', 'list-checks'); } } });
  const s = SECTION(sh.main, 'Teklifler', d, { pt: 8 });
  const ins = CARDBOX(s, 'AI önerisi', d, { dir: SMALL(d) ? 'column' : 'row', gap: 12, ai: SMALL(d) ? 'start' : 'center', bg: 'bg/ai-subtle', st: 'bg/ai-subtle', el: 'e0', p: 16 }); ICN(ins, 'sparkle', 24, 'text/ai'); TX(ins, d, 'Ege Tekstil; fiyat, teslim süresi ve zamanında teslim geçmişinde en iyi dengeyi sunuyor. Bursa Kumaş daha ucuz ama 35 gün teslim hedefinizi aşıyor.', 'body', { fill: true });
  if (WIDE(d)) Q.forEach(([n, ini, p, l, sm, tr, best]) => { const r = INST(s, `QuoteRow/${best ? 'En iyi' : 'Standart'}`, { W: 'fill' }); SETT(r, 'name', n); SETT(r, 'initials', ini); SETT(r, 'price', p); SETT(r, 'lead', l); SETT(r, 'sample', sm); SETT(r, 'terms', tr); });
  else Q.forEach(([n, ini, p, l, sm, tr, best]) => { const c = CARDBOX(s, 'teklif · ' + n, d, { gap: 10, st: best ? 'border/brand' : 'border/subtle' }); const h = B(c, 'h', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); const lg = B(h, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 44, r: R.m, grad: GRAD_BRAND }); T(lg, ini, 'label/m', { c: 'text/on-brand' }); TX(h, d, n, 'label', { fill: true }); if (best) BADGEI(c, 'AI', 'En iyi değer', 'sparkle'); SUMROWS(c, d, [['Birim fiyat', p], ['Teslim', l], ['Numune', sm], ['Ödeme', tr]]); BTNI(c, d, 'Teklifi kabul et', best ? 'Birincil' : 'İkincil', null, { W: 'fill' }); });
  return END(sh, { tab: 'Teklifler' });
};

// ---------- 20 · Cart ----------
function cartLine(parent, d, p, qty, unit, total, W) {
  const small = d.w < 500;
  const r = B(parent, 'satır · ' + p.n, { dir: 'row', gap: 16, ai: 'start', p: [16, 0], W: 'fill', H: 'hug' });
  const tw = small ? 72 : 112; const t = B(r, 'görsel', { dir: 'row', ai: 'center', jc: 'center', W: tw, H: tw, r: R.s, grad: tintFill(p.t)[0].fillColorGradient }); I(t, ILLU[p.i], { s: Math.round(tw * 0.5), style: 'duotone', c: (TINTS[p.t] || TINTS.blue)[2] });
  const info = B(r, 'bilgi', { dir: 'column', gap: 6, W: W - tw - 16, H: 'hug' });
  TX(info, d, p.n, 'label', { fill: true }); TX(info, d, 'Renk: Ekru · ' + unit, 'body', { c: 'text/tertiary', fill: true });
  const ctl = B(info, 'kontroller', { dir: small ? 'column' : 'row', gap: 12, ai: small ? 'start' : 'center', W: 'fill', H: 'hug' });
  const sp = INST(ctl, 'Stepper'); SETT(sp, 'value', qty); if (!small) SP(ctl);
  const tt = B(ctl, 'tutar', { dir: 'row', gap: 12, ai: 'center', W: 'hug', H: 'hug' }); TX(tt, d, total, 'price'); ICONBTN(tt, 'trash', 'Kaldır', { c: 'text/secondary' });
  return r;
}
BUILD.cart = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Sepet', x, y, { over: 'Sepetiniz · 3 ürün', h1: 'Toplam ₺312.480', body: 'Siparişi güvenle onaylamak için telefonunuza aktarın; sepetiniz tüm cihazlarda eşit kalır.', steps: ['QR kodu okutun', 'Teslimat ve ödeme adımlarını onaylayın'], qr: 'Sepeti telefonda aç', cta: 'Telefona gönder', ctaIcon: 'paper-plane-right' });
  const sh = SHELL(d, 'Sepet', x, y);
  PAGEHEAD(sh.main, d, ['Ana sayfa', 'Sepet'], 'Sepetiniz', '3 ürün · 2 tedarikçi · Ticaret Güvencesi dahil');
  const [L, A, lw] = TWO(sh.main, d, 'Sepet içeriği', Math.round(d.cw * 0.64), { ln: 'Ürünler', rn: 'Sipariş özeti (aside)' });
  const grp = (sup, lines) => { const g = CARDBOX(L, 'Tedarikçi grubu · ' + sup, d, { gap: 0 }); const h = B(g, 'başlık', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', p: [0, 0, 8, 0] }); ICN(h, 'seal-check', 20, 'text/success'); TX(h, d, sup, 'label', { fill: true }); TX(h, d, 'Tahmini teslim: 12–15 gün', 'body', { c: 'text/tertiary' }); lines.forEach((ln) => { DIV(g); cartLine(g, d, ...ln, lw - (SMALL(d) ? 32 : 48)); }); return g; };
  grp('Ege Tekstil A.Ş. · Denizli', [[PRODS[0], '2.000', '₺129 / m (2.000+ kademesi)', '₺258.000']]);
  const tip = CARDBOX(L, 'Kademe ipucu', d, { dir: 'row', gap: 12, ai: 'center', bg: 'bg/brand-subtle', st: 'bg/brand-subtle', el: 'e0', p: 16 }); ICN(tip, 'trend-up', 24, 'text/brand'); const tt = B(tip, 't', { dir: 'column', gap: 6, W: 'fill', H: 'hug' }); TX(tt, d, '8.000 m daha ekleyin, birim fiyat ₺118’e düşsün (−₺22.000).', 'body', { fill: true }); INST(tt, 'TierProgress', { W: 'fill' });
  grp('Ayvalık Zeytincilik · Balıkesir', [[PRODS[2], '40', '₺1.240 / teneke', '₺49.600']]);
  const sm = CARDBOX(A, 'Özet', d, { gap: 12 }); TX(sm, d, 'Sipariş özeti', 'h3');
  SUMROWS(sm, d, [['Ara toplam', '₺307.600'], ['Kademe indirimi', '−₺420'], ['Lojistik (tahmini)', '₺4.780'], ['KDV (%20)', 'Dahil']]); DIV(sm); SUMROWS(sm, d, [['Toplam', '₺312.480', 1]]);
  SETT(INST(sm, 'Checkbox#Seçili|Varsayılan'), 'label', 'Ticaret Güvencesi ile öde');
  if (!SMALL(d)) BTNI(sm, d, 'Ödemeye geç', 'Birincil', 'lock-simple', { W: 'fill' });
  const pay = B(sm, 'ödeme yöntemleri', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); [['bank', 'Havale/EFT'], ['credit-card', 'Kurumsal kart'], ['receipt', 'Açık hesap 60 gün']].forEach(([ic, t]) => BADGEI(pay, 'Nötr', t, ic));
  return END(sh, { tab: 'Keşfet', sticky: (f) => STICKYBAR(f, d, '₺312.480', 'KDV dahil', 'Ödemeye geç', 'lock-simple') });
};

// ---------- 21 · Checkout ----------
BUILD.checkout = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Ödeme', x, y, { over: 'Güvenli ödeme', h1: 'Ödemeyi telefonunuzda tamamlayın', body: 'Kart ve hesap bilgileri TV’de girilmez. Kodu okutun; ödeme Ticaret Güvencesi emanetine alınsın.', steps: ['QR kodu okutun', 'Passkey ile onaylayın'], qr: 'Ödemeyi telefonda aç', cta: 'Telefona gönder', ctaIcon: 'lock-simple' });
  const sh = SHELL(d, 'Ödeme', x, y, { tab: null });
  PAGEHEAD(sh.main, d, ['Sepet', 'Ödeme'], 'Güvenli ödeme', 'Adım 2 / 3 · Teslimat ve ödeme');
  const [L, A, lw] = TWO(sh.main, d, 'Ödeme', Math.round(d.cw * 0.62), { ln: 'form (Ödeme)', rn: 'Özet (aside)' });
  const st = B(L, 'Adımlar', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); [['Başarı', '1 · Sepet', 'check'], ['Marka', '2 · Teslimat & ödeme', 'credit-card'], ['Nötr', '3 · Onay', 'list-checks']].forEach(([t, l, ic]) => BADGEI(st, t, l, ic));
  const s1 = CARDBOX(L, 'fieldset · Teslimat', d, { gap: 14 }); TX(s1, d, 'Teslimat adresi', 'h3');
  [['Merkez depo · Karşıyaka, İzmir', 'Demir Tekstil A.Ş. · 8400 m² depo', 1], ['Fabrika · Çiğli OSB, İzmir', 'Rampa: 08.00–17.00', 0]].forEach(([t, s, on]) => { const c = B(s1, 'adres · ' + t, { dir: 'row', gap: 12, ai: 'start', p: 16, W: 'fill', H: 'hug', r: R.m, st: on ? 'border/brand' : 'border/subtle', sw: on ? 2 : 1, bg: on ? 'bg/brand-subtle' : undefined }); const rb = INST(c, `Radio#${on ? 'Seçili' : 'Seçili değil'}|Varsayılan`); SETT(rb, 'label', ''); const tx = B(c, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(tx, d, t, 'label', { fill: true }); TX(tx, d, s, 'body', { c: 'text/tertiary', fill: true }); });
  const s2 = CARDBOX(L, 'fieldset · Ödeme yöntemi', d, { gap: 14 }); TX(s2, d, 'Ödeme yöntemi', 'h3');
  [['bank', 'Havale / EFT', 'Emanet hesabına · IBAN sipariş sonrası', 1], ['credit-card', 'Kurumsal kart', '3D Secure · 12 aya kadar taksit', 0], ['receipt', 'Açık hesap (60 gün)', 'Onaylı alıcılar · limit ₺2.000.000', 0]].forEach(([ic, t, s, on]) => { const c = B(s2, 'yöntem · ' + t, { dir: 'row', gap: 12, ai: 'center', p: 16, W: 'fill', H: 'hug', r: R.m, st: on ? 'border/brand' : 'border/subtle', sw: on ? 2 : 1 }); ICONTILE(c, ic, on ? 'blue' : 'slate', 44); const tx = B(c, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(tx, d, t, 'label', { fill: true }); TX(tx, d, s, 'body', { c: 'text/tertiary', fill: true }); if (on) ICN(c, 'check-circle', 24, 'text/brand'); });
  const s3 = CARDBOX(L, 'fieldset · Fatura ve onay', d, { gap: 14 }); TX(s3, d, 'Fatura ve iç onay', 'h3');
  FIELDI(s3, d, 'Vergi numarası', '1234567890', { icon: 'receipt', help: 'e-Fatura otomatik düzenlenir' }); FIELDI(s3, d, 'Satın alma sipariş no (PO)', 'PO-2026-1187', { opt: true });
  const ap = B(s3, 'onay akışı', { dir: 'row', gap: 12, ai: 'center', p: 12, W: 'fill', H: 'hug', r: R.s, bg: 'bg/warning-subtle' }); ICN(ap, 'list-checks', 20, 'text/warning'); TX(ap, d, '₺250.000 üzeri: Finans onayı gerekir (Ayşe D.)', 'body', { c: 'text/warning', fill: true });
  const sm = CARDBOX(A, 'Özet', d, { gap: 12 }); TX(sm, d, 'Sipariş özeti', 'h3'); SUMROWS(sm, d, [['Ürünler (2 tedarikçi)', '₺307.180'], ['Lojistik', '₺4.780'], ['KDV', 'Dahil']]); DIV(sm); SUMROWS(sm, d, [['Toplam', '₺312.480', 1]]);
  const tg = B(sm, 'güvence', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); ICN(tg, 'shield-check', 20, 'text/success'); TX(tg, d, 'Ödeme teslim onayına kadar emanette', 'body', { c: 'text/success', fill: true });
  if (!SMALL(d)) BTNI(sm, d, 'Onaya gönder ve öde', 'Birincil', 'lock-simple', { W: 'fill' });
  return END(sh, { tab: null, sticky: (f) => STICKYBAR(f, d, '₺312.480', 'Finans onayı gerekir', 'Onaya gönder', 'lock-simple') });
};

// ---------- 22 · Order tracking ----------
BUILD.order = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Sipariş Onayı & Takip', x, y);
    TV_SPLIT(sh, (L) => { BADGEI(L, 'Başarı', 'Sipariş onaylandı', 'check-circle'); T(L, 'SIP-2026-10482 · Yolda', 'tv/headline', { c: 'text/inverse', fill: true }); T(L, 'Tahmini teslim: 18 Ekim, 10.00–14.00 · İzmir', 'tv/body', { c: 'text/inverse-muted', fill: true }); TV_FOCUSBTN(L, 'Canlı takibi aç', 'truck'); }, (R2) => { [['Tamamlandı', 'Ödeme emanette'], ['Tamamlandı', 'Üretim tamamlandı'], ['Şimdi', 'Yolda · Manisa'], ['Sırada', 'Teslim ve onay']].forEach(([s, t]) => { const r = B(R2, 'adım · ' + t, { dir: 'row', gap: 16, ai: 'center', W: 'fill', H: 'hug' }); const dot = B(r, 'dot', { dir: 'row', ai: 'center', jc: 'center', W: 48, H: 48, r: 12, bg: s === 'Sırada' ? 'bg/inverse-2' : 'action/primary' }); I(dot, s === 'Tamamlandı' ? 'check' : s === 'Şimdi' ? 'truck' : 'clock', { s: 24, c: 'text/on-brand' }); T(r, t, 'tv/body', { c: s === 'Sırada' ? 'text/inverse-muted' : 'text/inverse', fill: true }); }); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Sipariş Onayı & Takip', x, y, { tab: 'Hesap' });
  const ok = SECTION(sh.main, 'Onay', d, { pt: d.gap * 1.5, pb: 0 });
  const cb = CARDBOX(ok, 'Sipariş onaylandı (role=status)', d, { dir: SMALL(d) ? 'column' : 'row', gap: 16, ai: SMALL(d) ? 'start' : 'center', bg: 'bg/success-subtle', st: 'bg/success-subtle', el: 'e0' });
  ICONTILE(cb, 'check-circle', 'green', 56); const ct = B(cb, 't', { dir: 'column', gap: 4, W: 'fill', H: 'hug' }); TX(ct, d, 'Siparişiniz alındı · SIP-2026-10482', 'h3', { fill: true }); TX(ct, d, 'Ödemeniz Ticaret Güvencesi emanetinde. e-Fatura ve PO eşleşmesi muhasebeye iletildi.', 'body', { c: 'text/secondary', fill: true });
  if (!SMALL(d)) BTNI(cb, d, 'Faturayı indir', 'İkincil', 'download-simple');
  const [L, A] = TWO(sh.main, d, 'Takip', Math.round(d.cw * 0.58), { ln: 'Zaman çizelgesi', rn: 'Detay' });
  const tl = CARDBOX(L, 'Sipariş durumu', d, { gap: 0 }); TX(tl, d, 'Sipariş durumu', 'h3').layoutChild.bottomMargin = 12;
  [['Tamamlandı', 'Ödeme emanete alındı', '02 Eki · 14.12'], ['Tamamlandı', 'Üretim başladı · Ege Tekstil', '03 Eki'], ['Tamamlandı', 'Kalite kontrol · SGS raporu yüklendi', '14 Eki'], ['Şimdi', 'Yolda · Manisa aktarma', 'Bugün 09.40'], ['Sırada', 'Teslim ve 7 gün inceleme', 'Tahmini 18 Eki'], ['Sırada', 'Ödeme tedarikçiye aktarılır', 'Onayınızla']].forEach(([s, t, m]) => { const i = INST(tl, `TimelineStep/${s}`, { W: 'fill' }); SETT(i, 'title', t); SETT(i, 'meta', m); });
  const mp = CARDBOX(A, 'Canlı konum', d, { gap: 12, p: 0 }); const mm = B(mp, 'harita (dekoratif) · metin alternatifi aşağıda', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: SMALL(d) ? 180 : 240, bg: 'bg/brand-subtle' }); I(mm, 'truck', { s: 72, style: 'duotone', c: 'text/brand' }); const mt = B(mp, 't', { dir: 'column', gap: 4, p: [0, 20, 20, 20], W: 'fill', H: 'hug' }); TX(mt, d, 'Manisa → İzmir · 38 km kaldı', 'label', { fill: true }); TX(mt, d, 'Tahmini varış 18 Eki, 10.00–14.00', 'body', { c: 'text/secondary', fill: true });
  const sm = CARDBOX(A, 'Sipariş özeti', d, { gap: 12 }); SUMROWS(sm, d, [['Organik penye · 2.000 m', '₺258.000'], ['Zeytinyağı · 40 teneke', '₺49.600'], ['Lojistik', '₺4.780']]); DIV(sm); SUMROWS(sm, d, [['Toplam', '₺312.480', 1]]);
  const ac = B(A, 'eylemler', { dir: 'row', gap: 8, W: 'fill', H: 'hug', wrap: true }); BTNI(ac, d, 'Tedarikçiye yaz', 'İkincil', 'chat-circle-dots'); BTNI(ac, d, 'Sorun bildir', 'Üçüncül', 'warning-circle');
  return END(sh, { tab: 'Hesap' });
};

// ---------- 23 · Messages ----------
function bubble(parent, d, text, mine, meta, W) { const r = B(parent, mine ? 'mesaj · ben' : 'mesaj · tedarikçi', { dir: 'row', jc: mine ? 'end' : 'start', W: 'fill', H: 'hug' }); const b = B(r, 'balon', { dir: 'column', gap: 4, p: [10, 14], W: Math.round(W * 0.72), H: 'hug', r: R.m, bg: mine ? 'action/primary' : 'bg/surface', st: mine ? undefined : 'border/subtle' }); TX(b, d, text, 'body', { c: mine ? 'text/on-brand' : 'text/primary', fill: true }); TX(b, d, meta, 'body', { c: mine ? 'bg/brand-subtle-2' : 'text/tertiary' }); return r; }
BUILD.messages = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Mesajlar', x, y, { over: 'Mesajlar · 2 okunmamış', h1: 'Ege Tekstil: “Numuneler yarın kargoda.”', body: 'Yazışmaları telefonunuzda sürdürün; TV’de bildirimleri ve özetleri görürsünüz.', steps: ['QR kodu okutun', 'Sohbete kaldığınız yerden devam edin'], qr: 'Sohbeti telefonda aç', cta: 'Telefona gönder', ctaIcon: 'chat-circle-dots' });
  const sh = SHELL(d, 'Mesajlar', x, y, { tab: 'Hesap' });
  const s = SECTION(sh.main, 'Gelen kutusu', d, { dir: WIDE(d) ? 'row' : 'column', ai: 'start', gap: d.gap, pt: 16 });
  const lw = WIDE(d) ? Math.round(Math.min(420, d.cw * 0.32)) : d.cw;
  if (WIDE(d) || d.fam === 'tablet') {
    const list = CARDBOX(s, 'Konuşmalar (listbox)', d, { W: WIDE(d) ? lw : 'fill', gap: 4, p: 8 });
    INST(list, 'Input#Varsayılan', { W: 'fill', name: 'Konuşmalarda ara' });
    [['Ege Tekstil A.Ş.', 'Numuneler yarın kargoda.', '09.41', 2, 1], ['Uşak Örme San.', 'Teklifimizi güncelledik.', 'Dün', 0], ['Bursa Kumaş', 'Renk kartını ekledim.', 'Pzt', 0]].forEach(([n, m, t, un, on]) => { const r = B(list, 'konuşma · ' + n, { dir: 'row', gap: 12, ai: 'center', p: 12, W: 'fill', H: 'hug', r: R.s, bg: on ? 'bg/brand-subtle' : undefined }); const lg = B(r, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 44, H: 44, r: R.m, grad: GRAD_BRAND }); T(lg, n.split(' ').map((w) => w[0]).join('').slice(0, 2), 'label/m', { c: 'text/on-brand' }); const tx = B(r, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(tx, d, n, 'label', { fill: true }); TX(tx, d, m, 'body', { c: 'text/secondary', fill: true }); const mt = B(r, 'meta', { dir: 'column', gap: 4, ai: 'end', W: 'hug', H: 'hug' }); TX(mt, d, t, 'body', { c: 'text/tertiary' }); if (un) BADGEI(mt, 'Marka', String(un)); });
  }
  const cw = WIDE(d) ? d.cw - lw - d.gap : d.cw;
  const chat = CARDBOX(s, 'Sohbet (role=log)', d, { W: WIDE(d) ? cw : 'fill', gap: 12, p: 0 });
  const ch = B(chat, 'başlık', { dir: 'row', gap: 12, ai: 'center', p: [12, 16], W: 'fill', H: 'hug', st: 'border/subtle' }); const lg = B(ch, 'logo', { dir: 'row', ai: 'center', jc: 'center', W: 40, H: 40, r: R.m, grad: GRAD_BRAND }); T(lg, 'ET', 'label/m', { c: 'text/on-brand' }); const ctt = B(ch, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(ctt, d, 'Ege Tekstil A.Ş.', 'label', { fill: true }); TX(ctt, d, 'Çevrimiçi · genelde 4 saat içinde yanıtlar', 'body', { c: 'text/success', fill: true });
  const tr = BADGEI(ch, 'AI', 'Canlı çeviri: TR ⇄ EN', 'translate');
  const body = B(chat, 'mesajlar', { dir: 'column', gap: 12, p: [0, 16], W: 'fill', H: 'hug' });
  const iw = cw - (SMALL(d) ? 32 : 48);
  bubble(body, d, 'Merhaba, 5.000 m organik penye için ekru renkten numune gönderebilir misiniz?', true, '09.12 · Okundu', iw);
  bubble(body, d, 'Merhaba Ayşe Hanım, elbette. Ekru ve antrasit numuneler yarın kargoda. Takip numarasını paylaşacağım.', false, '09.41', iw);
  const att = B(body, 'ek · teklif', { dir: 'row', gap: 12, ai: 'center', p: 12, W: Math.round(iw * 0.72), H: 'hug', r: R.m, st: 'border/subtle', bg: 'bg/subtle' }); ICONTILE(att, 'file-text', 'blue', 40); const at = B(att, 't', { dir: 'column', W: 'fill', H: 'hug' }); TX(at, d, 'Teklif_RFQ-0412.pdf', 'label', { fill: true }); TX(at, d, '₺121/m · 18 gün · 248 KB', 'body', { c: 'text/tertiary', fill: true });
  const cmp = B(chat, 'yazma alanı', { dir: 'row', gap: 8, ai: 'center', p: [12, 16], W: 'fill', H: 'hug', st: 'border/subtle' });
  ICONBTN(cmp, 'paperclip', 'Dosya ekle', { c: 'text/secondary' }); const inp = B(cmp, 'textbox', { dir: 'row', ai: 'center', p: [0, 14], W: 'fill', H: 44, r: R.s, st: 'border/default' }); TX(inp, d, 'Mesaj yazın…', 'body', { c: 'text/tertiary' });
  const sb = INST(cmp, 'IconButton#tonal|Varsayılan', { name: 'button · Gönder' }); SETI(sb, 'paper-plane-right', 'text/brand');
  return END(sh, { tab: 'Hesap' });
};

// ---------- 24 · Buyer dashboard ----------
function chart(parent, d, W, H) {
  const c = CARDBOX(parent, 'Harcama grafiği (tablo alternatifi mevcut)', d, { gap: 12 });
  const h = B(c, 'başlık', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); TX(h, d, 'Aylık harcama', 'h3', { fill: true }); BADGEI(h, 'Nötr', 'Son 12 ay', 'calendar-blank');
  const g = B(c, 'çubuklar', { dir: 'row', gap: 8, ai: 'end', W: 'fill', H: H });
  const vals = [42, 55, 38, 61, 72, 58, 66, 80, 74, 88, 69, 94]; const bw = (W - (SMALL(d) ? 32 : 48) - 8 * 11) / 12;
  vals.forEach((v, i) => { const b = B(g, 'ay ' + (i + 1), { W: bw, H: Math.round(H * v / 100), r: 4, bg: i === 11 ? 'action/primary' : 'bg/brand-subtle-2' }); });
  const lg = B(c, 'eksen', { dir: 'row', jc: 'space-between', W: 'fill', H: 'hug' }); ['Kas', 'Oca', 'Mar', 'May', 'Tem', 'Eyl', 'Eki'].forEach((m) => TX(lg, d, m, 'body', { c: 'text/tertiary' }));
  return c;
}
BUILD.dashboard = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Alıcı Paneli', x, y);
    const g = B(sh.main, 'panel', { dir: 'column', gap: 24, p: [16, 96], W: 'fill', H: 'hug' }); T(g, 'Günaydın, Demir Tekstil', 'tv/headline', { c: 'text/inverse' });
    ROWS(g, [['Bu ay harcama', '₺1.284.500'], ['Açık teklif', '6'], ['Yoldaki sipariş', '3'], ['Onay bekleyen', '2']], 4, 24, (r, [l, v], k) => { const c = B(r, 'kpi · ' + l, { dir: 'column', gap: 8, p: 28, W: 'fill', H: 'hug', r: R.m, bg: k === 0 ? 'bg/surface' : 'bg/inverse-2' }); T(c, l, 'tv/label', { c: k === 0 ? 'text/secondary' : 'text/inverse-muted' }); T(c, v, 'tv/headline', { c: k === 0 ? 'text/primary' : 'text/inverse' }); if (k === 0) FOCUS(c, true); return c; }, 1728);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Alıcı Paneli', x, y, { tab: 'Hesap' });
  PAGEHEAD(sh.main, d, ['Hesabım', 'Panel'], 'Günaydın, Ayşe', 'Demir Tekstil A.Ş. · Satın alma müdürü', { actions: (hr) => { if (!SMALL(d)) { BTNI(hr, d, 'CSV ile toplu sipariş', 'İkincil', 'file-csv'); BTNI(hr, d, 'Yeni teklif talebi', 'Birincil', 'plus'); } } });
  const k = SECTION(sh.main, 'KPI', d, { pt: 8, pb: 0 });
  const kc = SMALL(d) ? (d.w <= 360 ? 1 : 2) : 4;
  ROWS(k, [['receipt', 'Bu ay harcama', '₺1.284.500', '%12 geçen aya göre'], ['file-text', 'Açık teklif talebi', '6', '14 yeni teklif'], ['truck', 'Yoldaki sipariş', '3', '1’i bugün teslim'], ['list-checks', 'Onay bekleyen', '2', '₺486.000 toplam']], kc, d.gap, (r, [ic, l, v, dl]) => { const i = INST(r, 'StatCard'); SETT(i, 'label', l); SETT(i, 'value', v); SETT(i, 'delta', dl); SETI(i, ic, 'text/brand'); return i; }, d.cw);
  const [L, A, lw, aw] = TWO(sh.main, d, 'Analitik + görevler', Math.round(d.cw * 0.62), { ln: 'analitik', rn: 'görevler' });
  chart(L, d, lw, SMALL(d) ? 140 : 220);
  const tbl = CARDBOX(L, 'Son siparişler (table)', d, { gap: 0 }); TX(tbl, d, 'Son siparişler', 'h3').layoutChild.bottomMargin = 12;
  [['SIP-10482', 'Ege Tekstil', '₺258.000', 'Yolda', 'Marka'], ['SIP-10471', 'Gebze Ambalaj', '₺36.800', 'Teslim edildi', 'Başarı'], ['SIP-10466', 'Işık Elektrik', '₺94.000', 'Onay bekliyor', 'Uyarı']].forEach(([no, s, t, st, tone]) => { const r = B(tbl, 'tr · ' + no, { dir: 'row', gap: 12, ai: 'center', p: [12, 0], W: 'fill', H: 'hug', st: 'border/subtle' }); r.strokes = []; TX(r, d, no, 'mono/m', { name: 'td' }); TX(r, d, s, 'body', { fill: true }); if (!SMALL(d)) TX(r, d, t, 'label'); BADGEI(r, tone, st); DIV(tbl); });
  const ap = CARDBOX(A, 'Onay kuyruğu', d, { gap: 12 }); TX(ap, d, 'Onayınızı bekleyenler', 'h3');
  [['PO-1187 · Organik penye', '₺258.000 · Mehmet K. talep etti'], ['PO-1190 · LED panel', '₺228.000 · Selin A. talep etti']].forEach(([t, s]) => { const c = B(ap, 'onay · ' + t, { dir: 'column', gap: 8, p: 12, W: 'fill', H: 'hug', r: R.s, bg: 'bg/subtle' }); TX(c, d, t, 'label', { fill: true }); TX(c, d, s, 'body', { c: 'text/tertiary', fill: true }); const a = B(c, 'eylemler', { dir: 'row', gap: 8, W: 'fill', H: 'hug' }); BTNI(a, d, 'Onayla', 'Birincil', 'check'); BTNI(a, d, 'Reddet', 'İkincil', null); });
  const ai = CARDBOX(A, 'AI içgörü', d, { gap: 10, bg: 'bg/ai-subtle', st: 'bg/ai-subtle', el: 'e0' }); BADGEI(ai, 'AI', 'Tasarruf fırsatı', 'sparkle'); TX(ai, d, 'Penye alımlarınızı çeyreklik birleştirirseniz 10.000 m kademesine geçip yılda ≈ ₺96.000 tasarruf edersiniz.', 'body', { fill: true }); BTNI(ai, d, 'Senaryoyu gör', 'Üçüncül', 'chart-line-up');
  return END(sh, { tab: 'Hesap' });
};
