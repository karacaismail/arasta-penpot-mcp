// Arasta v2 · page builders 25–31 — runs inside Penpot via MCP
function SPLITAUTH(sh, d, illuTitle, illuText, build) {
  if (WIDE(d)) {
    const s = SECTION(sh.main, 'Auth', d, { dir: 'row', ai: 'stretch', gap: d.gap * 2, pt: d.gap * 2, pb: d.gap * 3 });
    const L = B(s, 'Editoryal panel (dekoratif)', { dir: 'column', jc: 'end', gap: 16, p: 40, W: Math.round(d.cw * 0.48), H: 'hug', r: R.m, grad: GRAD_BRAND });
    const ill = B(L, 'illu', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: Math.round(d.cw * 0.22), r: R.m, bg: '#FFFFFF', bgo: 0.12 }); I(ill, 'handshake', { s: Math.round(d.cw * 0.1), style: 'duotone', c: 'text/on-brand' });
    TX(L, d, illuTitle, 'h2', { c: 'text/on-brand', fill: true }); TX(L, d, illuText, 'lead', { c: 'bg/brand-subtle-2', fill: true });
    const f = CARDBOX(s, 'form', d, { W: d.cw - Math.round(d.cw * 0.48) - d.gap * 2, gap: d.gap, p: 40, el: 'e2' }); build(f, d.cw - Math.round(d.cw * 0.48) - d.gap * 2 - 80); return;
  }
  const s = SECTION(sh.main, 'Auth', d, { ai: 'center', pt: d.gap * 1.5, pb: d.gap * 3 });
  const fw = Math.min(d.cw, 520); const f = CARDBOX(s, 'form', d, { W: fw, gap: d.gap, el: 'e2' }); build(f, fw - (SMALL(d) ? 32 : 48));
}
// ---------- 25 · Login ----------
BUILD.login = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Giriş', x, y, { over: 'Giriş yap', h1: 'Telefonunuzla giriş yapın', body: 'Şifre yazmanıza gerek yok. arasta.com.tr/tv adresine gidin ve kodu girin ya da QR kodu okutun.', code: 'K74QX', qr: 'arasta.com.tr/tv', cta: 'Yeni kod al', ctaIcon: 'key', side: 'Passkey veya e-posta bağlantısıyla onaylayın (WCAG 3.3.8).' });
  const sh = SHELL(d, 'Giriş', x, y, { tab: 'Hesap' });
  SPLITAUTH(sh, d, 'Satın alma ekibiniz tek hesapta.', 'Onay akışları, bütçe limitleri ve e-Fatura; 3.200+ kurumsal alıcı Arasta’yı kullanıyor.', (f, fw) => {
    LOGO(f, 40); TX(f, d, 'Tekrar hoş geldiniz', 'h2', { name: 'h1' }); TX(f, d, 'Kurumsal hesabınızla devam edin.', 'body', { c: 'text/secondary' });
    const seg = B(f, 'Hesap türü (radiogroup)', { dir: 'row', p: 4, W: 'fill', H: 'hug', r: R.m, bg: 'bg/muted' }); const sw = (fw - 8) / 2;
    [['Alıcı', 1], ['Tedarikçi', 0]].forEach(([l, on]) => { const b = B(seg, l + (on ? ' (seçili)' : ''), { dir: 'row', ai: 'center', jc: 'center', W: sw, H: 40, r: R.s, bg: on ? 'bg/surface' : undefined, el: on ? 'e1' : undefined }); TX(b, d, l, 'label', { c: on ? 'text/primary' : 'text/secondary' }); });
    BTNI(f, d, 'Passkey ile giriş yap', 'Birincil', 'fingerprint', { W: 'fill' });
    const or = B(f, 'ayırıcı', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); DIV(or, { w: (fw - 160) / 2 }); TX(or, d, 'veya e-posta ile', 'body', { c: 'text/tertiary' }); DIV(or, { w: (fw - 160) / 2 });
    FIELDI(f, d, 'İş e-postası', 'ayse.demir@demirtekstil.com.tr', { icon: 'envelope-simple', help: 'autocomplete="username"' });
    const pw = FIELDI(f, d, 'Şifre', '••••••••••••', { state: 'Odak', icon: 'lock-simple', help: 'Yapıştırma ve şifre yöneticisi desteklenir.' });
    const rr = B(f, 'yardımcı', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug', wrap: true }); SETT(INST(rr, 'Checkbox#Seçili|Varsayılan'), 'label', 'Beni hatırla'); SP(rr); TX(rr, d, 'Şifremi unuttum', 'label', { c: 'text/link', u: true });
    BTNI(f, d, 'Giriş yap', 'İkincil', 'arrow-right', { W: 'fill' }); BTNI(f, d, 'E-postama giriş bağlantısı gönder', 'Üçüncül', 'envelope-simple', { W: 'fill' });
    const sso = B(f, 'SSO', { dir: 'row', gap: 8, ai: 'center', p: 12, W: 'fill', H: 'hug', r: R.s, bg: 'bg/subtle' }); ICN(sso, 'buildings', 20, 'text/secondary'); TX(sso, d, 'Kurumsal SSO (SAML/OIDC) ile giriş', 'body', { c: 'text/secondary', fill: true }); ICN(sso, 'caret-right', 20, 'text/secondary');
    TX(f, d, 'CAPTCHA yok · bilişsel test yok · WCAG 3.3.8', 'body', { c: 'text/tertiary', fill: true });
  });
  return END(sh, { tab: 'Hesap' });
};
// ---------- 26 · Business signup ----------
BUILD.signup = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Kurumsal Kayıt', x, y, { over: 'Kurumsal hesap', h1: 'Kaydı telefonda 3 dakikada tamamlayın', body: 'VKN ile şirket bilgileri otomatik dolar; belgeleri telefon kamerasıyla yükleyin.', steps: ['QR kodu okutun', 'VKN girin, bilgiler otomatik dolsun', 'Vergi levhasını kamerayla yükleyin'], qr: 'Kaydı telefonda aç', cta: 'Telefona gönder', ctaIcon: 'buildings' });
  const sh = SHELL(d, 'Kurumsal Kayıt', x, y, { tab: 'Hesap' });
  SPLITAUTH(sh, d, 'Kurumsal hesap, kurumsal ayrıcalık.', 'Açık hesap limiti, onay akışları, çoklu kullanıcı ve ERP entegrasyonu — ücretsiz.', (f, fw) => {
    TX(f, d, 'Kurumsal hesap oluşturun', 'h2', { name: 'h1' });
    const pr = B(f, 'ilerleme (progressbar 1/3)', { dir: 'column', gap: 6, W: 'fill', H: 'hug' }); const tr = B(pr, 'track', { dir: 'row', W: 'fill', H: 6, r: 3, bg: 'bg/muted' }); B(tr, 'fill', { W: Math.round(fw / 3), H: 6, r: 3, bg: 'action/primary' }); TX(pr, d, 'Adım 1 / 3 · Şirket bilgileri', 'body', { c: 'text/tertiary' });
    const v = B(f, 'VKN satırı', { dir: d.w < 500 ? 'column' : 'row', gap: 8, ai: d.w < 500 ? 'stretch' : 'end', W: 'fill', H: 'hug' }); FIELDI(v, d, 'Vergi kimlik no (VKN)', '1234567890', { W: d.w < 500 ? 'fill' : fw - 180, req: true }); BTNI(v, d, 'Bilgileri getir', 'Üçüncül', 'sparkle');
    const ok = B(f, 'otomatik dolduruldu (role=status)', { dir: 'row', gap: 8, ai: 'center', p: 12, W: 'fill', H: 'hug', r: R.s, bg: 'bg/success-subtle' }); ICN(ok, 'check-circle', 20, 'text/success'); TX(ok, d, 'GİB kaydından 4 alan dolduruldu · kontrol edin', 'body', { c: 'text/success', fill: true });
    FIELDI(f, d, 'Şirket unvanı', 'Demir Tekstil Sanayi ve Ticaret A.Ş.', { req: true }); FIELDI(f, d, 'Vergi dairesi', 'Karşıyaka', { kind: 'Select' });
    FIELDI(f, d, 'Sektör', 'Hazır giyim üretimi', { kind: 'Select', icon: 'squares-four' });
    const r2 = B(f, 'satır', { dir: d.w < 500 ? 'column' : 'row', gap: 12, W: 'fill', H: 'hug' }); const hw = d.w < 500 ? 'fill' : (fw - 12) / 2; FIELDI(r2, d, 'Çalışan sayısı', '250–499', { kind: 'Select', W: hw }); FIELDI(r2, d, 'Yıllık alım hacmi', '₺10–50 milyon', { kind: 'Select', W: hw, opt: true });
    SETT(INST(f, 'Checkbox#Seçili değil|Varsayılan'), 'label', 'KVKK aydınlatma metnini okudum');
    BTNI(f, d, 'Devam et', 'Birincil', 'arrow-right', { W: 'fill' });
    const al = B(f, 'giriş', { dir: 'row', gap: 6, W: 'fill', H: 'hug', wrap: true }); TX(al, d, 'Hesabınız var mı?', 'body', { c: 'text/secondary' }); TX(al, d, 'Giriş yapın', 'label', { c: 'text/link', u: true });
  });
  return END(sh, { tab: 'Hesap' });
};
// ---------- 27 · Trade assurance ----------
BUILD.trust = async (d, x, y) => {
  const steps = [['shopping-cart-simple', 'Sipariş verin', 'Ödeme Arasta emanet hesabına alınır.'], ['factory', 'Üretim ve sevkiyat', 'Tedarikçi sözleşme koşullarıyla sevk eder.'], ['check-circle', 'Teslim alın, kontrol edin', 'İnceleme için 7 gününüz var.'], ['bank', 'Ödeme aktarılır', 'Onayınızla tutar tedarikçiye geçer.']];
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Ticaret Güvencesi', x, y);
    const g = B(sh.main, 'adımlar', { dir: 'column', gap: 24, p: [16, 96], W: 'fill', H: 'hug' }); T(g, 'Ödemeniz, siz onaylayana kadar güvende.', 'tv/headline', { c: 'text/inverse' });
    ROWS(g, steps, 4, 24, (r, [ic, t, ds], k) => { const c = B(r, 'adım · ' + t, { dir: 'column', gap: 16, p: 28, W: 'fill', H: 'hug', r: R.m, bg: k === 0 ? 'bg/surface' : 'bg/inverse-2' }); ICONTILE(c, ic, 'blue', 72); T(c, t, 'tv/title', { c: k === 0 ? 'text/primary' : 'text/inverse', fill: true }); T(c, ds, 'tv/label', { c: k === 0 ? 'text/secondary' : 'text/inverse-muted', fill: true }); if (k === 0) FOCUS(c, true); return c; }, 1728);
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Ticaret Güvencesi', x, y);
  const hs = SECTION(sh.main, 'Hero', d, { grad: GRAD_BRAND, dir: WIDE(d) ? 'row' : 'column', gap: d.gap * 2, ai: 'center', pt: d.gap * 3, pb: d.gap * 3 });
  const hl = B(hs, 'metin', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.round(d.cw * 0.55) : 'fill', H: 'hug' }); BADGEI(hl, 'Başarı', 'Ticaret Güvencesi', 'shield-check');
  TX(hl, d, 'Ödemeniz, siz onaylayana kadar güvende.', 'hero', { c: 'text/on-brand', fill: true, name: 'h1' }); TX(hl, d, 'Kalite, miktar veya teslim tarihi sözleşmeye uymazsa tutarın tamamı ya da bir kısmı iade edilir. Alıcıya ek ücret yok.', 'lead', { c: 'bg/brand-subtle-2', fill: true });
  const a = B(hl, 'eylemler', { dir: 'row', gap: 12, W: 'fill', H: 'hug', wrap: true }); BTNI(a, d, 'Nasıl çalışır', 'İkincil', 'play'); BTNI(a, d, 'Anlaşmazlık başlat', 'Üçüncül', 'scales');
  if (WIDE(d)) { const st = B(hs, 'istatistik kartı', { dir: 'column', gap: 16, p: 32, W: 'fill', H: 'hug', r: R.m, bg: 'bg/surface', el: 'e4' }); [['₺2,1 milyar', 'güvence altındaki işlem (2025)'], ['%99,2', 'sorunsuz tamamlanan sipariş'], ['6 gün', 'ortalama anlaşmazlık çözümü']].forEach(([v, l]) => STAT(st, d, v, l)); }
  const ss = SECTION(sh.main, 'Adımlar (ol)', d); SHEAD(ss, d, '4 adım', 'Güvenli ticaret nasıl işler?');
  const sc = SMALL(d) ? 1 : d.fam === 'tablet' ? 2 : 4; ROWS(ss, steps, sc, d.gap, (r, [ic, t, ds]) => FEATURE(r, d, ic, 'blue', t, ds), d.cw);
  const cv = SECTION(sh.main, 'Kapsam', d, { bg: 'bg/surface' }); SHEAD(cv, d, 'Kapsam', 'Neleri korur?');
  const cc = SMALL(d) ? 1 : 3; ROWS(cv, [['check-circle', 'green', 'Ürün kalitesi', 'Sözleşmedeki özelliklere uymayan ürünlerde iade.'], ['timer', 'saffron', 'Zamanında sevkiyat', 'Gecikmede günlük %0,5 telafi.'], ['lock-simple', 'violet', 'Ödeme koruması', 'Ödeme teslim onayına kadar emanette.']], cc, d.gap, (r, [ic, tn, t, ds]) => FEATURE(r, d, ic, tn, t, ds), d.cw);
  const fq = SECTION(sh.main, 'SSS', d); SHEAD(fq, d, 'Sıkça sorulanlar', 'Sorular ve yanıtlar');
  const acc = CARDBOX(fq, 'Akordeon (button aria-expanded)', d, { gap: 0, p: 0 });
  ['Ticaret Güvencesi ücretli mi?', 'Hangi ödeme yöntemleri kapsanır?', 'Anlaşmazlık süreci ne kadar sürer?', 'Numune siparişleri korunur mu?'].forEach((q, i) => { const it = B(acc, `soru · ${q}${i === 0 ? ' (açık)' : ''}`, { dir: 'column', gap: 8, p: [16, 20], W: 'fill', H: 'hug' }); const h = B(it, 'başlık', { dir: 'row', gap: 12, ai: 'center', W: 'fill', H: 'hug' }); TX(h, d, q, 'label', { fill: true }); ICN(h, i === 0 ? 'minus' : 'plus', 20, 'text/secondary'); if (i === 0) TX(it, d, 'Hayır. Alıcılar için ücretsizdir; hizmet bedeli tedarikçi komisyonuna dahildir.', 'body', { c: 'text/secondary', fill: true }); DIV(acc); });
  return END(sh, { tab: 'Keşfet' });
};
// ---------- 28 · Sell on Arasta ----------
BUILD.sell = async (d, x, y) => {
  if (d.fam === 'tv') return TV_HANDOFF(d, 'Tedarikçi Olun', x, y, { over: 'Tedarikçi olun', h1: '190 ülkedeki alıcılara ulaşın', body: 'Mağazanızı 1 günde açın; doğrulama rozeti ve AI eşleştirme ile ilk teklifinizi bu hafta alın.', steps: ['QR kodu okutun', 'Şirket ve ürün bilgilerini girin', 'Doğrulama randevusu seçin'], qr: 'Başvuruyu telefonda aç', cta: 'Başvur', ctaIcon: 'storefront' });
  const sh = SHELL(d, 'Tedarikçi Olun', x, y);
  const hs = SECTION(sh.main, 'Hero', d, { bg: 'bg/inverse', dir: WIDE(d) ? 'row' : 'column', gap: d.gap * 2, ai: 'center', pt: d.gap * 3, pb: d.gap * 3 });
  const hl = B(hs, 'metin', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.round(d.cw * 0.5) : 'fill', H: 'hug' }); BADGEI(hl, 'AI', 'AI alıcı eşleştirme', 'sparkle');
  TX(hl, d, 'Üretiminizi 190 ülkedeki kurumsal alıcılara açın.', 'hero', { c: 'text/inverse', fill: true, name: 'h1' }); TX(hl, d, 'Komisyon yalnızca tamamlanan siparişten; mağaza, doğrulama ve ilk 3 ay reklam ücretsiz.', 'lead', { c: 'text/inverse-muted', fill: true });
  const a = B(hl, 'eylemler', { dir: 'row', gap: 12, W: 'fill', H: 'hug', wrap: true }); BTNI(a, d, 'Ücretsiz başvur', 'Birincil', 'storefront'); BTNI(a, d, 'Satış ekibiyle görüş', 'İkincil', 'headset');
  const kp = B(hs, 'metrikler', { dir: WIDE(d) ? 'column' : 'row', gap: d.gap, W: 'fill', H: 'hug', wrap: !WIDE(d) }); [['3.200+', 'kurumsal alıcı'], ['₺118 bin', 'ortalama sipariş'], ['24 sa', 'ilk teklif süresi']].forEach(([v, l]) => { const c = B(kp, 'metrik · ' + l, { dir: 'column', gap: 2, p: 20, W: WIDE(d) ? 'fill' : 'hug', H: 'hug', r: R.m, bg: 'bg/inverse-2' }); TX(c, d, v, 'h2', { c: 'text/inverse' }); TX(c, d, l, 'body', { c: 'text/inverse-muted' }); });
  const fs = SECTION(sh.main, 'Özellikler', d); SHEAD(fs, d, 'Neden Arasta', 'Satış ekibiniz için güçlü araçlar');
  const fc = SMALL(d) ? 1 : d.fam === 'tablet' ? 2 : 3; ROWS(fs, [['sparkle', 'violet', 'AI alıcı eşleştirme', 'Teklif taleplerini kapasitenize göre size getirir.'], ['seal-check', 'green', 'Doğrulama rozeti', 'Yerinde denetim ile güven ve dönüşüm artışı.'], ['chart-line-up', 'blue', 'Satış analitiği', 'Görüntülenme, teklif ve kazanma oranı.'], ['translate', 'saffron', 'Canlı çeviri', '14 dilde alıcı yazışması.'], ['truck', 'teal', 'Lojistik ağı', 'Anlaşmalı fiyatlarla kapıdan kapıya.'], ['bank', 'slate', 'Güvenli tahsilat', 'Emanet sistemiyle garantili ödeme.']].slice(0, fc * 2), fc, d.gap, (r, [ic, tn, t, ds]) => FEATURE(r, d, ic, tn, t, ds), d.cw);
  const pr = SECTION(sh.main, 'Paketler', d, { bg: 'bg/surface' }); SHEAD(pr, d, 'Şeffaf fiyatlandırma', 'Paketler');
  const pc = SMALL(d) ? 1 : 3; ROWS(pr, [['Başlangıç', '₺0', '%4 komisyon', ['Mağaza', '50 ürün', 'Standart destek'], 0], ['Profesyonel', '₺2.490/ay', '%2,5 komisyon', ['Sınırsız ürün', 'AI eşleştirme', 'Öncelikli destek'], 1], ['Kurumsal', 'Teklif alın', 'Özel komisyon', ['API ve ERP', 'Hesap yöneticisi', 'SLA'], 0]], pc, d.gap, (r, [n, p, c, fs2, hi]) => { const b = CARDBOX(r, 'paket · ' + n, d, { gap: 12, st: hi ? 'border/brand' : 'border/subtle', el: hi ? 'e3' : 'e1' }); if (hi) BADGEI(b, 'Marka', 'En çok tercih edilen', 'star'); TX(b, d, n, 'h3'); TX(b, d, p, 'h2'); TX(b, d, c, 'body', { c: 'text/tertiary' }); fs2.forEach((f) => { const l = B(b, 'özellik', { dir: 'row', gap: 8, ai: 'center', W: 'fill', H: 'hug' }); ICN(l, 'check', 20, 'text/success'); TX(l, d, f, 'body', { fill: true }); }); BTNI(b, d, hi ? 'Profesyonel’e başla' : 'Seç', hi ? 'Birincil' : 'İkincil', null, { W: 'fill' }); return b; }, d.cw);
  return END(sh, { tab: 'Keşfet' });
};
// ---------- 29 · Help center ----------
BUILD.help = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Yardım Merkezi', x, y);
    TV_SPLIT(sh, (L) => { T(L, 'Size nasıl yardımcı olabiliriz?', 'tv/headline', { c: 'text/inverse', fill: true }); ['Siparişim nerede?', 'Ticaret Güvencesi', 'Kodla giriş yapamıyorum'].forEach((t, i) => { const r = B(L, 'konu · ' + t, { dir: 'row', gap: 16, ai: 'center', p: 20, W: 'fill', H: 'hug', r: R.m, bg: i === 0 ? 'bg/surface' : 'bg/inverse-2' }); I(r, 'question', { s: 32, c: i === 0 ? 'text/brand' : 'focus/ring-on-dark' }); T(r, t, 'tv/title', { c: i === 0 ? 'text/primary' : 'text/inverse', fill: true }); if (i === 0) FOCUS(r, true); }); }, (R2) => { QR(R2, 260, 'Canlı destek telefonda'); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Yardım Merkezi', x, y, { tab: 'Hesap' });
  const hs = SECTION(sh.main, 'Arama', d, { bg: 'bg/brand-subtle', ai: 'center', pt: d.gap * 3, pb: d.gap * 3 });
  TX(hs, d, 'Size nasıl yardımcı olabiliriz?', 'hero', { align: 'center', fill: true, name: 'h1' });
  const sb = B(hs, 'arama', { dir: 'column', W: Math.min(d.cw, 760), H: 'hug' }); const ai = INST(sb, `AISearch/${SMALL(d) ? 'S' : 'L'}`, { W: 'fill' }); SETT(ai, 'prompt', 'Siparişim gecikti, ne yapmalıyım?'); SETT(penpotUtils.findShape((s) => s.name === 'ai-badge', ai), 'label', 'AI asistan');
  const tp = SECTION(sh.main, 'Konular', d); SHEAD(tp, d, 'Konular', 'Popüler başlıklar');
  const tc = SMALL(d) ? 1 : d.fam === 'tablet' ? 2 : 3; ROWS(tp, [['truck', 'blue', 'Sipariş ve teslimat', '32 makale'], ['shield-check', 'green', 'Ticaret Güvencesi', '18 makale'], ['credit-card', 'violet', 'Ödeme ve fatura', '26 makale'], ['file-text', 'saffron', 'Teklif talepleri', '14 makale'], ['users-three', 'teal', 'Kurumsal hesap', '21 makale'], ['storefront', 'slate', 'Tedarikçi mağazası', '40 makale']].slice(0, tc * 2), tc, d.gap, (r, [ic, tn, t, ds]) => FEATURE(r, d, ic, tn, t, ds), d.cw);
  const ct = SECTION(sh.main, 'İletişim (3.2.6 tutarlı yardım)', d, { bg: 'bg/surface' }); SHEAD(ct, d, 'Hâlâ yardım mı gerekiyor?', 'Bize ulaşın');
  const cc = SMALL(d) ? 1 : 3; ROWS(ct, [['chat-circle-dots', 'blue', 'Canlı destek', '7/24 · ortalama 2 dk'], ['headset', 'green', 'Telefon', '0850 000 00 00 · 09–18'], ['envelope-simple', 'violet', 'E-posta', 'destek@arasta.com.tr · 4 sa']], cc, d.gap, (r, [ic, tn, t, ds]) => FEATURE(r, d, ic, tn, t, ds), d.cw);
  return END(sh, { tab: 'Hesap' });
};
// ---------- 30 · About ----------
BUILD.about = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, 'Hakkımızda', x, y);
    TV_SPLIT(sh, (L) => { BADGEI(L, 'Marka', 'Hakkımızda', 'buildings'); T(L, 'Anadolu’nun üretim gücünü dünyayla buluşturuyoruz.', 'tv/display', { c: 'text/inverse', fill: true }); TV_FOCUSBTN(L, 'Hikâyemizi izle', 'play'); }, (R2) => { [['48.000+', 'doğrulanmış üretici'], ['190', 'ülkeye ihracat'], ['2019', 'kuruluş']].forEach(([v, l]) => { const c = B(R2, 'metrik', { dir: 'column', p: 24, W: 'fill', H: 'hug', r: R.m, bg: 'bg/inverse-2' }); T(c, v, 'tv/headline', { c: 'text/inverse' }); T(c, l, 'tv/label', { c: 'text/inverse-muted' }); }); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, 'Hakkımızda', x, y);
  const hs = SECTION(sh.main, 'Hero', d, { pt: d.gap * 3, pb: d.gap * 2 });
  BADGEI(hs, 'Marka', 'Hakkımızda', 'buildings'); TX(hs, d, 'Anadolu’nun üretim gücünü dünyayla buluşturuyoruz.', 'hero', { fill: true, name: 'h1' }); TX(hs, d, '2019’da Denizli’de 12 atölyeyle başladık. Bugün 48.000 doğrulanmış üretici ve 3.200 kurumsal alıcıyla Türkiye’nin B2B ticaret altyapısıyız.', 'lead', { c: 'text/secondary', fill: true });
  const ms = SECTION(sh.main, 'Metrikler', d, { pt: 0 }); const mc = SMALL(d) ? 2 : 4; ROWS(ms, [['48.000+', 'doğrulanmış üretici'], ['190', 'ülkeye ihracat'], ['₺2,1 mlr', 'güvenceli işlem'], ['%42', 'kadın liderliğinde tedarikçi']], mc, d.gap, (r, [v, l]) => { const c = CARDBOX(r, 'metrik · ' + l, d, { gap: 4 }); TX(c, d, v, 'h2'); TX(c, d, l, 'body', { c: 'text/secondary', fill: true }); return c; }, d.cw);
  const vs = SECTION(sh.main, 'Değerler', d, { bg: 'bg/surface' }); SHEAD(vs, d, 'Değerlerimiz', 'Ne için çalışıyoruz?');
  const vc = SMALL(d) ? 1 : 3; ROWS(vs, [['handshake', 'blue', 'Güven', 'Her işlem emanet ve denetimle korunur.'], ['leaf', 'green', 'Sürdürülebilirlik', 'Karbon ayak izi etiketi ve yeşil tedarikçi rozeti.'], ['users-three', 'violet', 'Kapsayıcılık', 'Erişilebilir ürün, KOBİ’lere eşit görünürlük.']], vc, d.gap, (r, [ic, tn, t, ds]) => FEATURE(r, d, ic, tn, t, ds), d.cw);
  const cr = SECTION(sh.main, 'Kariyer', d, { grad: GRAD_BRAND, dir: SMALL(d) ? 'column' : 'row', ai: SMALL(d) ? 'stretch' : 'center', gap: d.gap }); const ct = B(cr, 't', { dir: 'column', gap: 6, W: SMALL(d) ? 'fill' : Math.round(d.cw * 0.6), H: 'hug' }); TX(ct, d, 'Ekibimize katılın', 'h2', { c: 'text/on-brand', fill: true }); TX(ct, d, 'İstanbul, Denizli ve uzaktan 24 açık pozisyon.', 'lead', { c: 'bg/brand-subtle-2', fill: true }); if (!SMALL(d)) SP(cr); BTNI(cr, d, 'Açık pozisyonlar', 'İkincil', 'arrow-right', { W: SMALL(d) ? 'fill' : undefined });
  return END(sh, { tab: 'Keşfet' });
};
// ---------- 31 · 404, maintenance, empty ----------
BUILD.states = async (d, x, y) => {
  if (d.fam === 'tv') {
    const sh = SHELL(d, '404, Bakım & Boş Durumlar', x, y);
    TV_SPLIT(sh, (L) => { T(L, '404', 'tv/display', { c: 'focus/ring-on-dark' }); T(L, 'Bu içerik artık yayında değil.', 'tv/headline', { c: 'text/inverse', fill: true }); T(L, 'Etkinlik sona ermiş ya da ürün kaldırılmış olabilir.', 'tv/body', { c: 'text/inverse-muted', fill: true }); TV_FOCUSBTN(L, 'Ana sayfaya dön', 'house'); }, (R2) => { const g = B(R2, 'illu', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: 420, r: R.m, bg: 'bg/inverse-2' }); I(g, 'magnifying-glass', { s: 180, style: 'duotone', c: 'focus/ring-on-dark' }); });
    return END(sh, { tab: null });
  }
  const sh = SHELL(d, '404, Bakım & Boş Durumlar', x, y);
  const s = SECTION(sh.main, '404', d, { dir: WIDE(d) ? 'row' : 'column', ai: 'center', gap: d.gap * 2, pt: d.gap * 3, pb: d.gap * 2 });
  const t = B(s, 'metin', { dir: 'column', gap: d.gap, W: WIDE(d) ? Math.round(d.cw * 0.5) : 'fill', H: 'hug' });
  BADGEI(t, 'Nötr', 'Hata 404', 'warning-circle'); TX(t, d, 'Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.', 'hero', { fill: true, name: 'h1' }); TX(t, d, 'Flash etkinlikleri süreli yayınlanır; bağlantı eski bir etkinliğe ait olabilir.', 'lead', { c: 'text/secondary', fill: true });
  FIELDI(t, d, 'Ürün veya tedarikçi arayın', 'organik penye', { icon: 'magnifying-glass' });
  const a = B(t, 'eylemler', { dir: 'row', gap: 12, W: 'fill', H: 'hug', wrap: true }); BTNI(a, d, 'Ana sayfaya dön', 'Birincil', 'house'); BTNI(a, d, 'Yardım merkezi', 'İkincil', 'question');
  const il = B(s, 'illüstrasyon', { dir: 'row', ai: 'center', jc: 'center', W: 'fill', H: WIDE(d) ? Math.round(d.cw * 0.3) : Math.round(d.cw * 0.6), r: R.m, grad: GRAD_BRAND }); I(il, 'magnifying-glass', { s: Math.round((WIDE(d) ? d.cw * 0.3 : d.cw * 0.6) * 0.4), style: 'duotone', c: 'text/on-brand' });
  const es = SECTION(sh.main, 'Durum kataloğu', d, { bg: 'bg/surface' }); SHEAD(es, d, 'Sistem durumları', 'Boş, bakım ve bağlantı durumları');
  const cols = SMALL(d) ? 1 : d.fam === 'tablet' ? 2 : 3; const w = colW(d, cols);
  ROWS(es, ['empty', 'maint', 'offline'], cols, d.gap, (r, k) => {
    if (k === 'empty') { const e = INST(r, 'EmptyState'); return e; }
    const c = CARDBOX(r, k === 'maint' ? 'Planlı bakım (role=status)' : 'Bağlantı yok (role=alert)', d, { gap: 12, ai: 'center' });
    ICONTILE(c, k === 'maint' ? 'wrench' : 'warning-circle', k === 'maint' ? 'saffron' : 'coral', 72);
    TX(c, d, k === 'maint' ? 'Planlı bakım · 03.00–04.00' : 'Bağlantınız kesildi', 'h3', { align: 'center', fill: true });
    TX(c, d, k === 'maint' ? 'Siparişleriniz ve ödemeleriniz güvende. Bakım bitince otomatik yenilenir.' : 'Formdaki verileriniz bu cihazda saklandı; bağlantı gelince kaldığınız yerden devam edin.', 'body', { c: 'text/secondary', align: 'center', fill: true });
    BTNI(c, d, k === 'maint' ? 'Durum sayfası' : 'Tekrar dene', 'İkincil', k === 'maint' ? 'arrow-square-out' : 'arrow-right');
    return c;
  }, d.cw);
  return END(sh, { tab: 'Keşfet' });
};
