// Builds the static site into ../docs : hub → clusters → screens → one HTML file per page per screen.
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { CLUSTERS, SCREENS, PAGES } from './src/devices.mjs';
import { ctx, USED, ic, esc, section, emptyState } from './src/lib/html.mjs';
import { doc } from './src/lib/shell.mjs';
import { viewer } from './src/viewer.mjs';
const W = path.dirname(new URL(import.meta.url).pathname); const OUT = path.resolve(process.env.OUT || path.resolve(W, '../docs'));
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
// clean previous screen output (keep rapor/ and .nojekyll)
for (const c of CLUSTERS) fs.rmSync(path.join(OUT, c.slug), { recursive: true, force: true });
import crypto from 'node:crypto';
const VER = crypto.createHash('sha1').update(['src/tokens.css','src/components.css','src/pages.css','src/app.js'].map((f) => fs.readFileSync(path.join(W, f), 'utf8')).join('') + fs.readdirSync(path.join(W, 'src/pages')).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(W, 'src/pages', f), 'utf8')).join('')).digest('hex').slice(0, 10);
ctx.v = VER;
const mods = {};
for (const p of PAGES) { const f = path.join(W, 'src/pages', p.slug + '.mjs'); mods[p.slug] = (process.env.READY && !process.env.READY.split(',').includes(p.slug)) ? null : fs.existsSync(f) ? (await import(pathToFileURL(f).href + '?v=' + Date.now())).default : null; }
let files = 0, errors = [];
for (const s of SCREENS) {
  for (const p of PAGES) {
    if (only && !only.includes(p.slug)) continue;
    Object.assign(ctx, { base: '../../', fam: s.fam, screen: s, href: (slug) => slug + '.html' });
    let r;
    try { r = mods[p.slug] ? mods[p.slug]({ page: p, screen: s }) : { main: section('Yakında', emptyState({ icon: 'clock', title: p.title + ' hazırlanıyor', desc: 'Bu ekran Penpot tasarımından koda çevriliyor.' })) }; }
    catch (e) { errors.push(`${p.slug}@${s.cluster.slug}/${s.id}: ${e.message}`); r = { main: section('Hata', emptyState({ icon: 'warning-circle', title: 'Derleme hatası', desc: e.message })) }; }
    write(path.join(OUT, s.cluster.slug, s.id, p.slug + '.html'), doc({ page: p.slug, title: r.title || p.title, main: r.main, bottom: r.bottom, screen: s }));
    files++;
  }
}
// ---- index pages ----
const shellDoc = (base, title, body) => `<!doctype html><html lang="tr" data-fam="desktop"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(title)}</title>
<meta name="description" content="Arasta B2B pazar yeri: Penpot’ta MCP ile tasarlanıp koda çevrilmiş, cihaz kümelerine göre ayrı ekranlar.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}assets/arasta.css?v=${VER}"><link rel="icon" href="${base}assets/favicon.svg"></head><body class="hubbody"><main class="hub" id="main">${body}</main><script src="${base}assets/app.js?v=${VER}" defer></script></body></html>`;
Object.assign(ctx, { base: '', fam: 'desktop' });
const pickJs = `<script>function openMine(){var w=innerWidth,h=innerHeight,l=w>h&&h<=500,m=matchMedia('(pointer:none)').matches;var t=m?'tv/4k':l?(w<600?'mobil-yatay/480x320':w<760?'mobil-yatay/667x375':w<900?'mobil-yatay/844x390':'mobil-yatay/932x430'):w<340?'mobil-dikey/320':w<368?'mobil-dikey/360':w<383?'mobil-dikey/375':w<410?'mobil-dikey/390':w<600?'mobil-dikey/430':w<960?(w<700?'tablet-dikey/600':'tablet-dikey/768'):w<1280?(h>w?'tablet-dikey/1024':'tablet-yatay/1024x768'):w<1400?'laptop/1280':w<1600?'laptop/1440':w<1800?'laptop/1728':w<2200?'masaustu/1920':w<3400?'masaustu/2560':'buyuk-ekran/3840';location.href=t+'/ana-sayfa.html'}</script>`;
const hub = `<section class="hub-hero"><p class="over" style="color:#DDE4FF">Penpot → MCP → Frontend</p><h1>Arasta · kurumsal B2B pazar yeri</h1>
<p>Penpot 2.18’de yalnızca MCP ile tasarlanan ve onaylanan 22 sayfa, cihaz kümelerine göre ayrı arayüzlerle koda çevrildi. Her ekran kendi sayfasında: bir küme, ardından bir ekran boyu seçin.</p>
<div class="row gap12 wrap" style="margin-top:20px"><button class="btn btn-onDark" onclick="openMine()">${ic('device-mobile')}<span>Cihazıma uygun ekranı aç</span></button><a class="btn btn-tertiary" href="rapor/index.html">${ic('chart-bar')}<span>Penpot × MCP raporu</span></a><a class="btn btn-tertiary" href="https://github.com/karacaismail/arasta-penpot-mcp">${ic('github-logo')}<span>Kaynak kod</span></a></div></section>
${CLUSTERS.map((c) => `<section class="hub-cluster card" aria-labelledby="c-${c.slug}"><div class="row gap12">${ic(c.icon, { duo: true, s: 32 })}<div><h2 id="c-${c.slug}"><a href="${c.slug}/index.html" style="color:inherit;text-decoration:none">${esc(c.title)}</a></h2><p class="muted">${esc(c.desc)}</p></div></div>
<div class="hub-screens">${c.screens.map((s) => `<a class="hub-screen" href="${c.slug}/${s.id}/index.html"><b>${esc(s.id.includes('x') ? s.id.replace('x', ' × ') : s.id + ' px')}</b><span class="muted">${esc(s.label)}</span>${s.note ? `<span class="muted small">${esc(s.note)}</span>` : ''}</a>`).join('')}</div></section>`).join('')}${pickJs}`;
write(path.join(OUT, 'index.html'), viewer(VER));
write(path.join(OUT, 'ekranlar.html'), shellDoc('', 'Arasta · Ekranlar', hub));
for (const c of CLUSTERS) {
  Object.assign(ctx, { base: '../' });
  write(path.join(OUT, c.slug, 'index.html'), shellDoc('../', `${c.title} · Arasta`, `<nav class="crumbs" aria-label="Sayfa yolu"><ol><li><a href="../index.html">Tüm ekranlar</a></li><li><span aria-current="page">${esc(c.title)}</span></li></ol></nav>
<section class="hub-cluster card"><div class="row gap12">${ic(c.icon, { duo: true, s: 32 })}<div><h1 style="font:600 36px/44px var(--font)">${esc(c.title)}</h1><p class="muted">${esc(c.desc)}</p></div></div><div class="hub-screens">${c.screens.map((s) => `<a class="hub-screen" href="${s.id}/index.html"><b>${esc(s.id.includes('x') ? s.id.replace('x', ' × ') : s.id + ' px')}</b><span class="muted">${esc(s.label)}</span></a>`).join('')}</div></section>`));
  for (const s of c.screens) {
    Object.assign(ctx, { base: '../../' });
    write(path.join(OUT, c.slug, s.id, 'index.html'), shellDoc('../../', `${c.title} ${s.id} · Arasta`, `<nav class="crumbs" aria-label="Sayfa yolu"><ol><li><a href="../../index.html">Tüm ekranlar</a></li><li><a href="../index.html">${esc(c.title)}</a></li><li><span aria-current="page">${esc(s.id)}</span></li></ol></nav>
<section class="hub-cluster card"><h1 style="font:600 36px/44px var(--font)">${esc(s.label)}</h1><p class="muted">${s.w} × ${s.h} CSS px · ${esc(c.desc)}${s.note ? ' · ' + esc(s.note) : ''}</p><div class="hub-pages">${PAGES.map((p) => `<a class="hub-page" href="${p.slug}.html">${ic(p.icon, { duo: true, s: 28 })}<span>${esc(p.title)}</span></a>`).join('')}</div></section>`));
  }
}
// ---- assets ----
const A = path.join(OUT, 'assets'); fs.mkdirSync(A, { recursive: true });
fs.writeFileSync(path.join(A, 'arasta.css'), fs.readFileSync(path.join(W, 'src/tokens.css'), 'utf8') + '\n' + fs.readFileSync(path.join(W, 'src/components.css'), 'utf8') + '\n' + (fs.existsSync(path.join(W, 'src/pages.css')) ? fs.readFileSync(path.join(W, 'src/pages.css'), 'utf8') : '') + '\n' + fs.readdirSync(path.join(W, 'src/pages')).filter((f) => f.endsWith('.css')).sort().map((f) => `/* ${f} */\n` + fs.readFileSync(path.join(W, 'src/pages', f), 'utf8')).join('\n'));
fs.copyFileSync(path.join(W, 'src/app.js'), path.join(A, 'app.js'));
fs.writeFileSync(path.join(A, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2446D8"/><stop offset="1" stop-color="#7A5AF8"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><text x="16" y="23" font-family="Roboto,Arial" font-weight="700" font-size="20" fill="#fff" text-anchor="middle">a</text></svg>`);
const PH = path.join(W, 'node_modules/@phosphor-icons/core/assets'); const missing = [];
const syms = [...USED].sort().map((id) => { const duo = id.endsWith('-duo'); const n = duo ? id.slice(0, -4) : id; const f = path.join(PH, duo ? 'duotone' : 'regular', n + (duo ? '-duotone' : '') + '.svg'); if (!fs.existsSync(f)) { missing.push(id); return ''; }
  const inner = fs.readFileSync(f, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''); return `<symbol id="${id}" viewBox="0 0 256 256">${inner}</symbol>`; });
fs.writeFileSync(path.join(A, 'icons.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${syms.join('')}</svg>`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`built ${files} screen files · ${USED.size} icons${missing.length ? ' · MISSING icons: ' + missing.join(',') : ''}${errors.length ? '\nERRORS:\n' + errors.join('\n') : ''}`);
if (errors.length) process.exitCode = 1;
