// Component templates (HTML strings) — 1:1 with the Penpot v2 component library.
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const USED = new Set();
// ctx is set per rendered file by build.mjs: { base, fam, screen, href(slug) }
export const ctx = { base: '', fam: 'phone', href: (s) => s + '.html' };
export const isSmall = () => ['phone', 'phoneL'].includes(ctx.fam);
export const isWide = () => ['tabletL', 'desktop', 'wide', 'ultra'].includes(ctx.fam);
export const isTV = () => ctx.fam === 'tv';

export function ic(name, o = {}) { const id = o.duo ? name + '-duo' : name; USED.add(id); const s = o.s || 20; return `<svg class="ic${o.cls ? ' ' + o.cls : ''}" width="${s}" height="${s}" aria-hidden="true" focusable="false"><use href="${ctx.base}assets/icons.svg#${id}"/></svg>`; }
export const link = (slug) => ctx.href(slug);
// Button: kind primary|secondary|tertiary|danger ; o: icon, iconR, href, block, attrs, size
export function btn(label, kind = 'primary', o = {}) {
  const cls = `btn btn-${kind}${o.block ? ' btn-block' : ''}${o.cls ? ' ' + o.cls : ''}`;
  const inner = `${o.icon ? ic(o.icon) : ''}<span>${esc(label)}</span>${o.iconR ? ic(o.iconR) : ''}`;
  return o.href ? `<a class="${cls}" href="${o.href}"${o.attrs || ''}>${inner}</a>` : `<button type="${o.type || 'button'}" class="${cls}"${o.attrs || ''}>${inner}</button>`;
}
export function iconBtn(icon, label, kind = 'ghost', o = {}) { return `<button type="button" class="icon-btn icon-btn-${kind}${o.cls ? ' ' + o.cls : ''}" aria-label="${esc(label)}"${o.attrs || ''}>${ic(icon)}${o.count ? `<span class="count" aria-hidden="true">${o.count}</span>` : ''}</button>`; }
export function badge(label, tone = 'neutral', icon) { return `<span class="badge badge-${tone}">${icon ? ic(icon, { s: 16 }) : ''}${esc(label)}</span>`; }
export function chip(label, o = {}) { const on = o.on; return `<button type="button" class="chip${o.ai ? ' chip-ai' : ''}${on ? ' is-on' : ''}" aria-pressed="${!!on}"${o.attrs || ''}>${ic(o.ai ? 'sparkle' : on ? 'check' : o.icon || 'plus', { s: 16 })}<span>${esc(label)}</span>${o.remove ? ic('x', { s: 16 }) : ''}</button>`; }
let fid = 0;
export function field(label, o = {}) {
  const id = 'f' + ++fid; const err = o.error; const kind = o.kind || 'input';
  const ctrl = kind === 'textarea' ? `<textarea id="${id}" rows="4"${err ? ` aria-invalid="true" aria-describedby="${id}-e"` : o.help ? ` aria-describedby="${id}-h"` : ''} placeholder="${esc(o.ph || '')}">${esc(o.value || '')}</textarea>`
    : kind === 'select' ? `<select id="${id}">${(o.options || [o.value || 'Seçin']).map((x) => `<option${x === o.value ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`
    : `<input id="${id}" type="${o.type || 'text'}" value="${esc(o.value || '')}" placeholder="${esc(o.ph || '')}"${o.auto ? ` autocomplete="${o.auto}"` : ''}${o.inputmode ? ` inputmode="${o.inputmode}"` : ''}${err ? ` aria-invalid="true" aria-describedby="${id}-e"` : o.help ? ` aria-describedby="${id}-h"` : ''}${o.req ? ' required' : ''}>`;
  return `<div class="field${err ? ' has-error' : ''}${o.cls ? ' ' + o.cls : ''}"><label for="${id}">${esc(label)}${o.req ? ' <span class="hint">(zorunlu)</span>' : o.opt ? ' <span class="hint">(isteğe bağlı)</span>' : ''}</label>
<div class="control${kind === 'select' ? ' is-select' : ''}${kind === 'textarea' ? ' is-area' : ''}">${o.icon ? ic(o.icon, { cls: 'lead' }) : ''}${ctrl}${kind === 'select' ? ic('caret-down', { cls: 'trail' }) : ''}${o.suffix ? `<span class="suffix">${esc(o.suffix)}</span>` : ''}</div>
${o.help ? `<p class="help" id="${id}-h">${esc(o.help)}</p>` : ''}${err ? `<p class="error" id="${id}-e" role="alert">${ic('warning-circle', { s: 20 })}${esc(err)}</p>` : ''}</div>`;
}
export function check(label, on, o = {}) { return `<label class="check${o.radio ? ' is-radio' : ''}"><input type="${o.radio ? 'radio' : 'checkbox'}"${o.name ? ` name="${o.name}"` : ''}${on ? ' checked' : ''}><span class="box" aria-hidden="true">${o.radio ? '' : ic('check', { s: 16 })}</span><span>${esc(label)}</span>${o.count ? `<span class="count-muted">${esc(o.count)}</span>` : ''}</label>`; }
export function toggle(label, on) { return `<label class="switch"><input type="checkbox" role="switch"${on ? ' checked' : ''}><span class="track" aria-hidden="true"><span class="knob"></span></span><span>${esc(label)}</span></label>`; }
export function rating(v = '4,8', n = '(312)') { return `<span class="rating">${ic('star', { s: 16, duo: true, cls: 'star' })}<b>${v}</b><span>${n}</span></span>`; }
export function stepper(v = '2.000', label = 'Miktar') { return `<div class="stepper" data-stepper><button type="button" aria-label="Azalt">${ic('minus')}</button><input aria-label="${esc(label)}" inputmode="numeric" value="${esc(v)}"><button type="button" aria-label="Artır">${ic('plus')}</button></div>`; }
export function kbd(k = 'K') { return `<kbd class="kbd">${ic('command', { s: 16 })}${k}</kbd>`; }
export const TINT = { textile: ['blue', 't-shirt'], machine: ['slate', 'factory'], food: ['green', 'leaf'], build: ['saffron', 'cube'], pack: ['saffron', 'package'], electric: ['violet', 'lightbulb'], furniture: ['teal', 'couch'], chem: ['violet', 'flask'], auto: ['slate', 'car'], cosmetic: ['coral', 'drop'], handbag: ['coral', 'handbag'], coffee: ['saffron', 'coffee'], boat: ['teal', 'boat'] };
export function media(key, alt, o = {}) { const [tint, icon] = TINT[key] || ['blue', 'package']; return `<div class="media tint-${tint}${o.cls ? ' ' + o.cls : ''}" role="img" aria-label="${esc(alt)}"><span class="halo">${ic(icon, { duo: true, s: o.s || 64 })}</span>${o.inner || ''}</div>`; }
export function productCard(p, o = {}) {
  return `<article class="pcard${o.cls ? ' ' + o.cls : ''}"><div class="pcard-media">${media(p.i, p.n + ' görseli', { inner: `${p.b ? `<span class="pos-tl">${badge(p.b, p.b.startsWith('Flash') ? 'danger' : 'brand', p.b.startsWith('Flash') ? 'lightning' : 'medal')}</span>` : ''}<span class="pos-tr">${iconBtn('heart', 'Favorilere ekle: ' + p.n, 'surface')}</span>` })}</div>
<div class="pcard-body"><p class="supplier">${ic('seal-check', { s: 16, cls: 'ok' })}<span>${esc(p.s)}</span></p><h3 class="pcard-title"><a href="${link('urun')}">${esc(p.n)}</a></h3>
<p class="price"><b>${esc(p.p)}</b> <span>${esc(p.u)}</span></p><p class="moq">${esc(p.m)}</p><div class="meta">${badge(p.a, 'ai', 'sparkle')}${rating()}</div>
<div class="pcard-foot">${check('Karşılaştır', false)}${iconBtn('chat-circle-dots', 'Tedarikçiye yaz', 'tonal')}</div></div></article>`;
}
export function supplierCard(s = {}) {
  const n = s.n || 'Ege Tekstil A.Ş.', ini = s.i || 'ET';
  return `<article class="scard card"><div class="scard-id"><span class="logo-tile">${ini}</span><div><h3>${esc(n)}</h3><p class="muted">${esc(s.meta || 'Denizli · 12 yıl · Üretici')}</p></div></div>
<div class="row wrap gap8">${badge('Doğrulanmış', 'success', 'seal-check')}${badge(s.match || 'Uyum %94', 'ai', 'sparkle')}${rating()}</div>
<dl class="stats3"><div><dt>Yanıt</dt><dd>≤ 4 sa</dd></div><div><dt>Zamanında</dt><dd>%98,6</dd></div><div><dt>Çalışan</dt><dd>250+</dd></div></dl>
<div class="thumbs3" aria-hidden="true"><span class="tint-blue">${ic('t-shirt', { duo: true, s: 32 })}</span><span class="tint-saffron">${ic('package', { duo: true, s: 32 })}</span><span class="tint-green">${ic('couch', { duo: true, s: 32 })}</span></div>
<div class="row gap8">${btn('Mağazayı gör', 'secondary', { href: link('magaza'), cls: 'grow' })}${btn('Mesaj', 'tertiary', { icon: 'chat-circle-dots', href: link('mesajlar') })}</div></article>`;
}
export function eventCard(e) { const [n, k, t, key] = e; const [tint, icon] = TINT[key] || ['saffron', 'package']; return `<article class="ecard card"><div class="ecard-media tint-saffron"><span class="badge badge-inverse">${ic('timer', { s: 16 })}${esc(t)}</span><span class="ecard-illu">${ic(icon, { duo: true, s: 56 })}</span></div>
<div class="ecard-body"><p class="over">${esc(k)}</p><h3><a href="${link('flash')}">${esc(n)}</a></h3><p class="muted">%18’e varan toptan indirim · Ücretsiz numune</p><div class="progress" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100" aria-label="Kontenjan"><span style="width:64%"></span></div><p class="muted small">Kontenjanın %64’ü doldu</p></div></article>`; }
export function catTile(c) { const [n, key, , cnt] = c; const [tint, icon] = TINT[key] || ['blue', 'package']; return `<a class="ctile card" href="${link('kategoriler')}"><span class="icon-tile tint-${tint}">${ic(icon, { duo: true, s: 32 })}</span><b>${esc(n)}</b><span class="muted">${esc(cnt)}</span></a>`; }
export function priceTiers() { return `<div class="tiers card-sub"><table class="tier-table"><caption class="sr-only">Kademeli fiyat</caption><tbody><tr>${[['₺142,50', '500 – 1.999 m'], ['₺129,00', '2.000 – 9.999 m', 1], ['₺118,00', '≥ 10.000 m']].map(([p, q, on]) => `<td class="${on ? 'is-on' : ''}"><b>${p}</b><span>${q}</span>${on ? '<em>Seçili miktar</em>' : ''}</td>`).join('')}</tr></tbody></table>${tierProgress()}</div>`; }
export function tierProgress() { return `<div class="tierprog"><div class="progress brand" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" aria-label="Sonraki kademeye ilerleme"><span style="width:56%"></span></div><div class="row between"><b class="small">2.000 m</b><span class="muted small">Sonraki kademe: 10.000 m</span></div></div>`; }
export function aiSearch(o = {}) { return `<form class="aisearch card" role="search" data-aisearch><div class="row gap8 wrap">${badge(o.badge || 'Akıllı arama', 'ai', 'sparkle')}<span class="muted">Doğal dille yazın, filtreye biz çevirelim</span></div>
<div class="aisearch-field">${ic('sparkle', { cls: 'ai' })}<label class="sr-only" for="ai-q">İhtiyacınızı yazın</label><input id="ai-q" name="q" value="${esc(o.q || 'Denizli’den 5.000 m organik penye, 30 günde')}">${btn('Bul', 'primary', { icon: 'arrow-right', type: 'submit' })}</div>
<div class="row wrap gap8" aria-label="Öneriler">${['GOTS sertifikalı', '≤ 30 gün teslim', 'Denizli', '5.000 m'].map((t) => chip(t, { ai: true })).join('')}</div></form>`; }
export function timeline(steps) { return `<ol class="timeline">${steps.map(([st, t, m]) => `<li class="tl-${st}"${st === 'now' ? ' aria-current="step"' : ''}><span class="dot">${ic(st === 'done' ? 'check' : st === 'now' ? 'truck' : 'clock', { s: 16 })}</span><div><b>${esc(t)}</b><span class="muted">${esc(m)}</span></div></li>`).join('')}</ol>`; }
export function statCard(icon, label, value, delta) { return `<div class="stat card"><div class="row gap8"><span class="icon-tile sm tint-blue">${ic(icon)}</span><span class="muted">${esc(label)}</span></div><b class="stat-v">${esc(value)}</b><span class="delta">${ic('trend-up', { s: 16 })}${esc(delta)}</span></div>`; }
export function emptyState(o = {}) { return `<div class="empty card" role="status"><span class="icon-tile lg tint-blue">${ic(o.icon || 'magnifying-glass', { duo: true, s: 48 })}</span><h3>${esc(o.title || 'Sonuç bulunamadı')}</h3><p class="muted">${esc(o.desc || '“hidrolik pres 400 ton” için eşleşme yok. Talebinizi üreticilere iletelim.')}</p><div class="row gap8 wrap center">${btn('Teklif iste', 'primary', { icon: 'file-text', href: link('teklif-iste') })}${btn('Filtreleri temizle', 'secondary')}</div></div>`; }
export function secHead(over, title, o = {}) { return `<div class="sec-head"><div>${over ? `<p class="over">${esc(over)}</p>` : ''}<h2>${esc(title)}</h2>${o.sub ? `<p class="lead">${esc(o.sub)}</p>` : ''}</div>${o.link ? `<a class="more" href="${o.href || '#'}">${esc(o.link)}${ic('arrow-right')}</a>` : ''}</div>`; }
export function breadcrumb(items) { return `<nav class="crumbs" aria-label="Sayfa yolu"><ol>${items.map((it, i) => `<li>${i === items.length - 1 ? `<span aria-current="page">${esc(it)}</span>` : `<a href="${link('ana-sayfa')}">${esc(it)}</a>`}</li>`).join('')}</ol></nav>`; }
export function iconTile(icon, tint = 'blue', size = 'md') { return `<span class="icon-tile ${size} tint-${tint}">${ic(icon, { duo: true, s: size === 'lg' ? 40 : 24 })}</span>`; }
export function feature(icon, tint, title, desc) { return `<div class="feature card">${iconTile(icon, tint)}<h3>${esc(title)}</h3><p class="muted">${esc(desc)}</p></div>`; }
export function section(name, inner, o = {}) { return `<section class="sec${o.cls ? ' ' + o.cls : ''}" aria-label="${esc(name)}"><div class="container">${inner}</div></section>`; }
export function grid(items, o = {}) { return `<div class="grid ${o.cls || 'g-auto'}">${items.join('')}</div>`; }
