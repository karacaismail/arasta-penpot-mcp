// 25 · Giriş — mirrors designer/v2/pages-c.js BUILD.login
import { ctx, ic, btn, field, check, link, isTV } from '../lib/html.mjs';
import { splitAuth, tvHandoff } from './_c-kit.mjs';

export default function login() {
  if (isTV()) return { main: `<div class="pg-c pg-giris">${tvHandoff({ over: 'Giriş yap', h1: 'Telefonunuzla giriş yapın', body: 'Şifre yazmanıza gerek yok. arasta.com.tr/tv adresine gidin ve kodu girin ya da QR kodu okutun.', code: 'K74QX', qr: 'arasta.com.tr/tv', cta: 'Yeni kod al', ctaIcon: 'key', side: 'Passkey veya e-posta bağlantısıyla onaylayın (WCAG 3.3.8).' })}</div>` };
  const pwToggle = `var i=document.getElementById('lg-pw'),s=i.type==='password';i.type=s?'text':'password';this.querySelector('span').textContent=s?'Gizle':'Göster'`;
  const form = `<span class="mark c-authmark" aria-hidden="true">a</span>
<div class="c-authhead"><h1 class="h2">Tekrar hoş geldiniz</h1><p class="muted">Kurumsal hesabınızla devam edin.</p></div>
<div class="c-seg" role="radiogroup" aria-label="Hesap türü">${[['Alıcı', 1], ['Tedarikçi', 0]].map(([l, on]) => `<label><input type="radio" name="acct" value="${l}"${on ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
${btn('Passkey ile giriş yap', 'primary', { icon: 'fingerprint', block: true })}
<p class="c-or"><span>veya e-posta ile</span></p>
<form class="c-form" action="${link('panel')}" onsubmit="event.preventDefault();location.href=this.action">
${field('İş e-postası', { type: 'email', value: 'ayse.demir@demirtekstil.com.tr', icon: 'envelope-simple', auto: 'username', inputmode: 'email' })}
<div class="field"><label for="lg-pw">Şifre</label><div class="control">${ic('lock-simple', { cls: 'lead' })}<input id="lg-pw" type="password" value="Arasta-2026!" autocomplete="current-password" aria-describedby="lg-pw-h"><button type="button" class="c-pwbtn" aria-controls="lg-pw" onclick="${pwToggle}">${ic('eye')}<span>Göster</span></button></div><p class="help" id="lg-pw-h">Yapıştırma ve şifre yöneticisi desteklenir.</p></div>
<div class="row wrap gap8 between">${check('Beni hatırla', true)}<a class="c-link" href="${link('yardim')}">Şifremi unuttum</a></div>
${btn('Giriş yap', 'secondary', { iconR: 'arrow-right', block: true, type: 'submit' })}
</form>
${btn('E-postama giriş bağlantısı gönder', 'tertiary', { icon: 'envelope-simple', block: true, cls: 'c-wrapbtn' })}
<a class="c-sso" href="${link('panel')}">${ic('buildings')}<span>Kurumsal SSO (SAML/OIDC) ile giriş</span>${ic('caret-right')}</a>
<p class="c-note">${ic('shield-check', { s: 20 })}<span>CAPTCHA yok · bilişsel test yok · WCAG 3.3.8</span></p>`;
  return { main: `<div class="pg-c pg-giris">${splitAuth('giris', 'Satın alma ekibiniz tek hesapta.', 'Onay akışları, bütçe limitleri ve e-Fatura; 3.200+ kurumsal alıcı Arasta’yı kullanıyor.', form)}</div>` };
}
