// 23 · Mesajlar — mirrors designer/v2/pages-b.js BUILD.messages
import { ctx, ic, esc, badge, iconBtn, iconTile, link, isWide, isTV } from '../lib/html.mjs';
import { root, logoTile, tvHandoff } from './_b-kit.mjs';

const bubble = (text, mine, meta) => `<div class="pgb-msg${mine ? ' is-mine' : ''}"><div class="pgb-bub"><span class="sr-only">${mine ? 'Siz' : 'Ege Tekstil'}: </span><p>${esc(text)}</p><p class="pgb-bub-m">${esc(meta)}</p></div></div>`;

export default function messages() {
  if (isTV()) return { main: root('mesajlar', tvHandoff({ over: 'Mesajlar · 2 okunmamış', h1: 'Ege Tekstil: “Numuneler yarın kargoda.”', body: 'Yazışmaları telefonunuzda sürdürün; TV’de bildirimleri ve özetleri görürsünüz.', steps: ['QR kodu okutun', 'Sohbete kaldığınız yerden devam edin'], qr: 'Sohbeti telefonda aç', cta: 'Telefona gönder', ctaIcon: 'chat-circle-dots' })) };
  const showList = isWide() || ctx.fam === 'tablet';
  const list = showList ? `<nav class="pgb-card pgb-convs" aria-label="Konuşmalar"><div class="pgb-convs-q control">${ic('magnifying-glass', { cls: 'lead' })}<label class="sr-only" for="conv-q">Konuşmalarda ara</label><input id="conv-q" type="search" placeholder="Konuşmalarda ara"></div>
<ul>${[['Ege Tekstil A.Ş.', 'Numuneler yarın kargoda.', '09.41', 2, 1], ['Uşak Örme San.', 'Teklifimizi güncelledik.', 'Dün', 0], ['Bursa Kumaş', 'Renk kartını ekledim.', 'Pzt', 0]].map(([n, m, t, un, on]) => `<li><a class="pgb-conv${on ? ' is-on' : ''}" href="${link('mesajlar')}"${on ? ' aria-current="page"' : ''}>${logoTile(n.split(' ').map((w) => w[0]).join('').slice(0, 2))}<span class="pgb-conv-t"><b>${esc(n)}</b><span class="muted">${esc(m)}</span></span><span class="pgb-conv-m"><span class="muted">${esc(t)}</span>${un ? `<span class="badge badge-brand">${un}<span class="sr-only"> okunmamış</span></span>` : ''}</span></a></li>`).join('')}</ul></nav>` : '';
  const chat = `<section class="pgb-card pgb-chat" aria-labelledby="chat-h"><header class="pgb-chat-h">${logoTile('ET', 40)}<div class="pgb-chat-ht"><h2 id="chat-h">Ege Tekstil A.Ş.</h2><p class="ok">Çevrimiçi · genelde 4 saat içinde yanıtlar</p></div>${badge('Canlı çeviri: TR ⇄ EN', 'ai', 'translate')}</header>
<div class="pgb-log" role="log" aria-live="polite" aria-label="Ege Tekstil ile yazışma" tabindex="0">
${bubble('Merhaba, 5.000 m organik penye için ekru renkten numune gönderebilir misiniz?', true, '09.12 · Okundu')}
${bubble('Merhaba Ayşe Hanım, elbette. Ekru ve antrasit numuneler yarın kargoda. Takip numarasını paylaşacağım.', false, '09.41')}
<div class="pgb-msg"><a class="pgb-att" href="#" aria-label="Ek: Teklif_RFQ-0412.pdf, 248 KB, indir">${iconTile('file-text', 'blue', 'md')}<span class="pgb-att-t"><b>Teklif_RFQ-0412.pdf</b><span class="muted">₺121/m · 18 gün · 248 KB</span></span>${ic('download-simple')}</a></div>
</div>
<form class="pgb-comp" onsubmit="event.preventDefault()">${iconBtn('paperclip', 'Dosya ekle')}<label class="sr-only" for="msg-in">Mesaj yazın</label><input id="msg-in" class="pgb-comp-in" placeholder="Mesaj yazın…" autocomplete="off"><button type="submit" class="icon-btn icon-btn-tonal" aria-label="Gönder">${ic('paper-plane-right')}</button></form></section>`;
  return { main: root('mesajlar', `<section class="pgb-inbox${isWide() ? ' is-split' : ''}" aria-labelledby="pgb-h1"><div class="container"><h1 id="pgb-h1" class="sr-only">Mesajlar</h1>${list}${chat}</div></section>`) };
}
