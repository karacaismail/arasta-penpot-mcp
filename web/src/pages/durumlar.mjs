// 31 · 404, Bakım & Boş Durumlar — mirrors designer/v2/pages-c.js BUILD.states
import { ctx, ic, esc, btn, badge, field, secHead, iconTile, emptyState, link, isSmall, isWide, isTV } from '../lib/html.mjs';
import { cols, cw, tvSplit, tvFocusBtn } from './_c-kit.mjs';

export default function states() {
  if (isTV()) {
    const left = `<p class="c-404" aria-hidden="true">404</p><h1 class="c-tvh">Bu içerik artık yayında değil.</h1><p class="c-tvbody">Etkinlik sona ermiş ya da ürün kaldırılmış olabilir.</p><div>${tvFocusBtn('Ana sayfaya dön', 'house', { href: link('ana-sayfa') })}</div>`;
    const right = `<div class="c-tvillu" aria-hidden="true">${ic('magnifying-glass', { duo: true, s: 180 })}</div>`;
    return { main: `<div class="pg-c pg-durumlar">${tvSplit(left, right)}</div>` };
  }
  const wide = isWide(); const w = cw(); const is = Math.min(Math.round((wide ? w * 0.3 : w * 0.6) * 0.4), 320);
  const top = `<section class="sec c-404sec" aria-labelledby="dr-h"><div class="container c-hero-grid${wide ? ' is-split is-half' : ''}"><div class="c-hero-copy">${badge('Hata 404', 'neutral', 'warning-circle')}
<h1 id="dr-h">Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.</h1><p class="lead">Flash etkinlikleri süreli yayınlanır; bağlantı eski bir etkinliğe ait olabilir.</p>
<form role="search" action="${link('arama')}" class="c-404search">${field('Ürün veya tedarikçi arayın', { type: 'search', value: 'organik penye', icon: 'magnifying-glass', auto: 'off' })}</form>
<div class="row wrap gap12">${btn('Ana sayfaya dön', 'primary', { icon: 'house', href: link('ana-sayfa') })}${btn('Yardım merkezi', 'secondary', { icon: 'question', href: link('yardim') })}</div></div>
<div class="c-illu${wide ? ' is-wide' : ''}" aria-hidden="true">${ic('magnifying-glass', { duo: true, s: is })}</div></div></section>`;
  const c = isSmall() ? 1 : ctx.fam === 'tablet' ? 2 : 3;
  const card = (k) => {
    const m = k === 'maint';
    return `<div class="c-state card" role="${m ? 'status' : 'alert'}">${iconTile(m ? 'wrench' : 'warning-circle', m ? 'saffron' : 'coral', 'lg')}<h3>${m ? 'Planlı bakım · 03.00–04.00' : 'Bağlantınız kesildi'}</h3><p class="muted">${m ? 'Siparişleriniz ve ödemeleriniz güvende. Bakım bitince otomatik yenilenir.' : 'Formdaki verileriniz bu cihazda saklandı; bağlantı gelince kaldığınız yerden devam edin.'}</p>${btn(m ? 'Durum sayfası' : 'Tekrar dene', 'secondary', { icon: m ? 'arrow-square-out' : 'arrow-right', attrs: m ? '' : ' onclick="location.reload()"' })}</div>`;
  };
  const cat = `<section class="sec surface" aria-labelledby="dr-c"><div class="container">${secHead('Sistem durumları', 'Boş, bakım ve bağlantı durumları').replace('<h2>', '<h2 id="dr-c">')}${cols(c, [emptyState(), card('maint'), card('offline')], { cls: 'c-states' })}</div></section>`;
  return { main: `<div class="pg-c pg-durumlar">${top}${cat}</div>` };
}
