// 26 · Kurumsal Kayıt — mirrors designer/v2/pages-c.js BUILD.signup
import { ctx, ic, btn, field, check, link, isTV } from '../lib/html.mjs';
import { splitAuth, tvHandoff } from './_c-kit.mjs';

export default function signup() {
  if (isTV()) return { main: `<div class="pg-c pg-kayit">${tvHandoff({ over: 'Kurumsal hesap', h1: 'Kaydı telefonda 3 dakikada tamamlayın', body: 'VKN ile şirket bilgileri otomatik dolar; belgeleri telefon kamerasıyla yükleyin.', steps: ['QR kodu okutun', 'VKN girin, bilgiler otomatik dolsun', 'Vergi levhasını kamerayla yükleyin'], qr: 'Kaydı telefonda aç', cta: 'Telefona gönder', ctaIcon: 'buildings' })}</div>` };
  const narrow = ctx.screen.w < 500;
  const form = `<div class="c-authhead"><h1 class="h2">Kurumsal hesap oluşturun</h1></div>
<div class="c-prog"><div class="progress brand" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="1" aria-valuetext="Adım 1 / 3 · Şirket bilgileri" aria-labelledby="ky-step"><span style="width:33.3%"></span></div><p class="help" id="ky-step">Adım 1 / 3 · Şirket bilgileri</p></div>
<form class="c-form" action="${link('panel')}" onsubmit="event.preventDefault();location.href=this.action">
<div class="c-vkn${narrow ? ' is-stacked' : ''}">${field('Vergi kimlik no (VKN)', { value: '1234567890', req: true, inputmode: 'numeric', auto: 'off' })}${btn('Bilgileri getir', 'tertiary', { icon: 'sparkle' })}</div>
<p class="c-okmsg" role="status">${ic('check-circle')}<span>GİB kaydından 4 alan dolduruldu · kontrol edin</span></p>
${field('Şirket unvanı', { value: 'Demir Tekstil Sanayi ve Ticaret A.Ş.', req: true, auto: 'organization' })}
${field('Vergi dairesi', { kind: 'select', value: 'Karşıyaka', options: ['Karşıyaka', 'Bornova', 'Konak', 'Kordon'] })}
${field('Sektör', { kind: 'select', icon: 'squares-four', value: 'Hazır giyim üretimi', options: ['Hazır giyim üretimi', 'Ev tekstili', 'Gıda', 'Makine'] })}
<div class="c-grid" style="--cols:${narrow ? 1 : 2}">${field('Çalışan sayısı', { kind: 'select', value: '250–499', options: ['1–49', '50–249', '250–499', '500+'] })}${field('Yıllık alım hacmi', { kind: 'select', opt: true, value: '₺10–50 milyon', options: ['₺0–10 milyon', '₺10–50 milyon', '₺50 milyon+'] })}</div>
${check('KVKK aydınlatma metnini okudum', false)}
${btn('Devam et', 'primary', { iconR: 'arrow-right', block: true, type: 'submit' })}
</form>
<p class="c-alt"><span class="muted">Hesabınız var mı?</span> <a class="c-link" href="${link('giris')}">Giriş yapın</a></p>`;
  return { main: `<div class="pg-c pg-kayit">${splitAuth('kayit', 'Kurumsal hesap, kurumsal ayrıcalık.', 'Açık hesap limiti, onay akışları, çoklu kullanıcı ve ERP entegrasyonu — ücretsiz.', form)}</div>` };
}
