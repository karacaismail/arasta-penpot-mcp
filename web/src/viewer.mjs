// Root viewer: vertical tabs (clusters → screens) on the left, live design on the right.
import { CLUSTERS, PAGES } from './devices.mjs';
import { ic, esc } from './lib/html.mjs';

export function viewer(ver) {
  const data = { clusters: CLUSTERS.map((c) => ({ slug: c.slug, title: c.title, screens: c.screens.map((s) => ({ id: s.id, w: s.w, h: s.h, label: s.label, fam: s.fam })) })), pages: PAGES.map((p) => ({ slug: p.slug, title: p.title })) };
  const size = (s) => (s.id.includes('x') ? s.id.replace('x', ' × ') : s.id === '4k' ? '4K TV' : s.id + ' px');
  const tabs = CLUSTERS.map((c) => `<div class="vw-group" role="group" aria-labelledby="g-${c.slug}"><p class="vw-gtitle" id="g-${c.slug}">${ic(c.icon, { s: 20 })}<span>${esc(c.title)}</span></p>
${c.screens.map((s) => `<button type="button" role="tab" class="vw-tab" id="t-${c.slug}-${s.id}" data-key="${c.slug}/${s.id}" aria-selected="false" aria-controls="vw-panel" tabindex="-1"><b>${esc(size(s))}</b><span>${esc(s.label.split(' · ').slice(1).join(' · ') || s.label)}</span></button>`).join('')}</div>`).join('');
  const opts = CLUSTERS.map((c) => `<optgroup label="${esc(c.title)}">${c.screens.map((s) => `<option value="${c.slug}/${s.id}">${esc(size(s))} · ${esc(s.label.split(' · ').slice(1).join(' · '))}</option>`).join('')}</optgroup>`).join('');
  return `<!doctype html><html lang="tr" data-fam="desktop"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Arasta · Ekran görüntüleyici</title><meta name="description" content="Arasta B2B pazar yeri: Penpot’ta MCP ile tasarlanıp koda çevrilmiş 22 sayfa, 22 ekran boyunda.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/arasta.css?v=${ver}"><link rel="icon" href="assets/favicon.svg">
<style>
body.vw{margin:0;background:var(--bg-canvas);height:100vh;height:100dvh;display:grid;grid-template-columns:300px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);overflow:hidden}
.vw-top{grid-column:1/-1;display:flex;align-items:center;gap:16px;padding:10px 16px;padding-top:max(10px,env(safe-area-inset-top));background:var(--bg-surface);border-bottom:1px solid var(--border-subtle);box-shadow:var(--e1);z-index:2}
.vw-top .logo .word{font-size:20px}.vw-top .muted{white-space:nowrap}.vw-links{margin-left:auto;display:flex;gap:8px}
.vw-side{overflow-y:auto;background:var(--bg-surface);border-right:1px solid var(--border-subtle);padding:12px 12px 32px;overscroll-behavior:contain}
.vw-group+.vw-group{margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle)}
.vw-gtitle{display:flex;align-items:center;gap:8px;padding:6px 10px;font:var(--t-over);letter-spacing:.6px;text-transform:uppercase;color:var(--text-tertiary)}
.vw-tab{display:grid;gap:2px;width:100%;text-align:left;padding:10px 12px;margin:2px 0;border:0;border-radius:var(--r-s);background:transparent;color:var(--text-primary);cursor:pointer;position:relative;min-height:44px}
.vw-tab b{font:600 16px/22px var(--font)}.vw-tab span{color:var(--text-tertiary)}
.vw-tab:hover{background:var(--bg-muted)}
.vw-tab[aria-selected=true]{background:var(--bg-brand-subtle);color:var(--text-brand)}.vw-tab[aria-selected=true] span{color:var(--text-brand)}
.vw-tab[aria-selected=true]::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:2px;background:var(--action-primary)}
.vw-main{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);min-width:0;min-height:0}.vw-bar>*{min-width:0}
.vw-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 20px;border-bottom:1px solid var(--border-subtle);background:var(--bg-subtle)}
.vw-bar h1{font:600 20px/28px var(--font)}.vw-bar .size{font-family:var(--mono);color:var(--text-tertiary)}
.vw-pages{display:flex;gap:6px;overflow-x:auto;scrollbar-width:thin;flex:1 1 100%;max-width:100%;padding-bottom:4px}
.vw-page{white-space:nowrap;min-height:40px;padding:0 12px;border-radius:var(--r-m);border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-primary);font:var(--t-label);cursor:pointer}
.vw-page[aria-pressed=true]{background:var(--bg-inverse);border-color:var(--bg-inverse);color:#fff}
.vw-stage{position:relative;overflow:auto;padding:24px;display:flex;justify-content:center;align-items:flex-start}
.vw-box{position:relative;flex:none;border-radius:var(--r-m);box-shadow:0 0 0 1px var(--border-subtle),var(--e5);overflow:hidden;background:var(--bg-canvas)}
.vw-frame{position:absolute;left:0;top:0;transform-origin:0 0}
.vw-frame iframe{display:block;border:0;background:var(--bg-canvas)}
.vw-scale{font-family:var(--mono);color:var(--text-tertiary)}
.vw-select{display:none}
@media (max-width:900px){body.vw{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr)}.vw-side{display:none}.vw-select{display:block;grid-column:1/-1;padding:8px 16px;background:var(--bg-surface);border-bottom:1px solid var(--border-subtle)}.vw-select select{width:100%;min-height:44px;border-radius:var(--r-s);border:1px solid var(--border-default);background:var(--bg-surface);padding:0 10px;font:var(--t-label)}.vw-links .btn span{display:none}.vw-top .muted{display:none}.vw-stage{padding:12px}}
</style></head><body class="vw">
<header class="vw-top"><a class="logo" href="#"><span class="mark" aria-hidden="true">a</span><span class="word">arasta</span></a><span class="muted">Penpot → MCP → Frontend · 22 sayfa × 22 ekran</span>
<nav class="vw-links" aria-label="Bağlantılar"><a class="btn btn-tertiary" href="rapor/index.html">${ic('chart-bar')}<span>Penpot × MCP raporu</span></a><a class="btn btn-secondary" href="https://github.com/karacaismail/arasta-penpot-mcp">${ic('github-logo')}<span>Kaynak kod</span></a></nav></header>
<div class="vw-select"><label class="sr-only" for="vw-sel">Ekran seçin</label><select id="vw-sel">${opts}</select></div>
<nav class="vw-side" aria-label="Ekranlar"><div role="tablist" aria-orientation="vertical" aria-label="Cihaz kümeleri ve ekranlar" id="vw-tabs">${tabs}</div></nav>
<section class="vw-main" id="vw-panel" role="tabpanel" aria-labelledby="vw-title">
<div class="vw-bar"><h1 id="vw-title">–</h1><span class="size" id="vw-size"></span><span class="vw-scale" id="vw-scale"></span><span class="grow"></span>
<button type="button" class="btn btn-secondary" id="vw-fit" aria-pressed="true">${ic('arrows-in')}<span>Sığdır</span></button><a class="btn btn-tertiary" id="vw-open" target="_blank" rel="noopener">${ic('arrow-square-out')}<span>Yeni sekmede aç</span></a>
<div class="vw-pages" role="group" aria-label="Sayfa">${PAGES.map((p) => `<button type="button" class="vw-page" data-page="${p.slug}" aria-pressed="false">${esc(p.title)}</button>`).join('')}</div></div>
<div class="vw-stage" id="vw-stage"><div class="vw-box" id="vw-box"><div class="vw-frame" id="vw-frame"><iframe id="vw-if" title="Tasarım önizlemesi" loading="eager"></iframe></div></div></div></section>
<script>
const D=${JSON.stringify(data)};
const tabs=[...document.querySelectorAll('.vw-tab')],pages=[...document.querySelectorAll('.vw-page')],ifr=document.getElementById('vw-if'),frame=document.getElementById('vw-frame'),stage=document.getElementById('vw-stage'),fitBtn=document.getElementById('vw-fit'),sel=document.getElementById('vw-sel');
let cur={key:'mobil-dikey/390',page:'ana-sayfa'},fit=true;
const find=(key)=>{const[c,s]=key.split('/');const cl=D.clusters.find(x=>x.slug===c);return cl&&{c:cl,s:cl.screens.find(x=>x.id===s)}};
function layout(){const f=find(cur.key);if(!f)return;const{w,h}=f.s;ifr.style.width=w+'px';ifr.style.height=h+'px';const aw=Math.max(200,stage.clientWidth-48),ah=Math.max(200,stage.clientHeight-48);const k=fit?Math.min(1,aw/w,ah/h):1;const box=document.getElementById('vw-box');box.style.width=Math.round(w*k)+'px';box.style.height=Math.round(h*k)+'px';frame.style.transform='scale('+k+')';document.getElementById('vw-scale').textContent='%'+Math.round(k*100);}
function show(push){const f=find(cur.key);if(!f){cur.key='mobil-dikey/390';return show(push)}const url=cur.key+'/'+cur.page+'.html';
 tabs.forEach(t=>{const on=t.dataset.key===cur.key;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;if(on)t.scrollIntoView({block:'nearest'})});
 pages.forEach(p=>p.setAttribute('aria-pressed',p.dataset.page===cur.page));sel.value=cur.key;
 const pt=D.pages.find(p=>p.slug===cur.page).title;document.getElementById('vw-title').textContent=f.c.title+' · '+(f.s.id.includes('x')?f.s.id.replace('x',' × '):f.s.id==='4k'?'4K TV':f.s.id+' px')+' — '+pt;
 document.getElementById('vw-size').textContent=f.s.w+'×'+f.s.h;document.getElementById('vw-open').href=url;
 if(ifr.dataset.src!==url){ifr.dataset.src=url;ifr.src=url+'?embed=1'}document.title=pt+' · '+f.c.title+' '+f.s.id+' · Arasta';
 const h='#'+cur.key+'/'+cur.page;if(location.hash!==h)history[push?'pushState':'replaceState'](null,'',h);layout();}
function fromHash(){const m=location.hash.slice(1).split('/');if(m.length>=2){cur.key=m[0]+'/'+m[1];if(m[2]&&D.pages.some(p=>p.slug===m[2]))cur.page=m[2];}}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>{cur.key=t.dataset.key;show(true)});t.addEventListener('keydown',e=>{let j=null;if(e.key==='ArrowDown')j=Math.min(tabs.length-1,i+1);if(e.key==='ArrowUp')j=Math.max(0,i-1);if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();tabs[j].focus();cur.key=tabs[j].dataset.key;show(true)}})});
pages.forEach(p=>p.addEventListener('click',()=>{cur.page=p.dataset.page;show(true)}));
sel.addEventListener('change',()=>{cur.key=sel.value;show(true)});
fitBtn.addEventListener('click',()=>{fit=!fit;fitBtn.setAttribute('aria-pressed',fit);fitBtn.querySelector('span').textContent=fit?'Sığdır':'%100';layout()});
ifr.addEventListener('load',()=>{try{const u=new URL(ifr.contentWindow.location.href);const m=u.pathname.match(/([^/]+)\\/([^/]+)\\/([^/]+)\\.html$/);if(m&&m[3]!==cur.page&&D.pages.some(p=>p.slug===m[3])){cur.page=m[3];ifr.dataset.src=cur.key+'/'+cur.page+'.html';show(false)}}catch(e){}});
addEventListener('resize',layout);addEventListener('popstate',()=>{fromHash();show(false)});
fromHash();show(false);
</script></body></html>`;
}
