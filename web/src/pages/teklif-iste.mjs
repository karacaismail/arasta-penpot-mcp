// 18 · Teklif İste (AI RFQ) — mirrors designer/v2/pages-b.js BUILD.rfq
import { ic, esc, btn, badge, field, check, timeline, iconTile, isTV } from '../lib/html.mjs';
import { root, narrow, pageHead, two, card, h2, steps, tvHandoff } from './_b-kit.mjs';

export default function rfq() {
  if (isTV()) return { main: root('teklif-iste', tvHandoff({ over: 'Teklif asistanı', h1: 'Talebinizi sesle anlatın, formu telefonda onaylayın.', body: 'Uzun formlar uzaktan kumandayla zahmetlidir. Konuşun; AI talebi oluştursun, siz telefonunuzda kontrol edin.', steps: ['Mikrofon tuşuna basıp ihtiyacınızı söyleyin', 'QR kodu okutup taslağı telefonda açın', 'Teklifler bu ekranda ve telefonunuzda'], qr: 'Taslağı telefonda aç', cta: 'Sesle anlat', ctaIcon: 'microphone', side: 'Kod 10 dakika geçerli; süre dolarsa yenileyebilirsiniz.' })) };

  const n = narrow();
  const ai = card(`<div class="row wrap gap8">${badge('Teklif asistanı', 'ai', 'robot')}<span class="pgb-ai-t">Serbest metinden formu doldurur</span></div>
${field('İhtiyacınızı anlatın', { kind: 'textarea', value: 'Denizli’den GOTS sertifikalı organik penye, 180 g/m², ekru ve antrasit, toplam 5.000 metre. İzmir’e 30 gün içinde teslim.' })}
<div class="row wrap gap8">${btn('Formu doldur', 'primary', { icon: 'sparkle' })}${btn('Teknik çizim yükle', 'secondary', { icon: 'upload-simple' })}</div>`, { cls: 'pgb-ai' });

  // error field first so its generated id can be referenced by the summary
  const priceField = field('Hedef birim fiyat', { value: '125 TL', opt: true, error: 'Sayı girin, örn. 125,00', inputmode: 'decimal' });
  const priceId = (priceField.match(/<input id="(f\d+)"/) || [])[1];
  const errSum = `<div class="pgb-errsum" id="rfq-err" role="alert" tabindex="-1" aria-labelledby="rfq-err-t">${ic('warning-circle', { s: 24 })}<div><p id="rfq-err-t"><b>1 alanı kontrol edin</b></p><ul><li><a href="#${priceId}">Hedef birim fiyat: sayı olmalı (örn. 125,00)</a></li></ul></div></div>`;

  const aiField = (label, v) => `<div class="pgb-aifield">${field(label, { value: v, req: true })}<p class="pgb-ai-t">${ic('sparkle', { s: 16 })}AI tarafından dolduruldu · kontrol edin</p></div>`;
  const pair = (a, b) => `<div class="pgb-pair${n ? '' : ' is-row'}">${a}${b}</div>`;
  const s1 = card(`<legend class="pgb-legend">Ürün</legend>${aiField('Ürün adı', 'Organik pamuk penye kumaş')}${field('Kategori', { kind: 'select', value: 'Tekstil › Örme kumaş › Penye', options: ['Tekstil › Örme kumaş › Penye', 'Tekstil › Örme kumaş › Ribana', 'Tekstil › Dokuma kumaş'], req: true, icon: 'squares-four' })}`, { tag: 'fieldset' });
  const s2 = card(`<legend class="pgb-legend">Miktar ve teslimat</legend>
${pair(field('Miktar', { value: '5.000', req: true, inputmode: 'numeric' }), field('Birim', { kind: 'select', value: 'metre', options: ['metre', 'kilogram', 'adet', 'top'] }))}
${priceField}
${pair(field('Teslim adresi', { kind: 'select', value: 'Karşıyaka, İzmir', options: ['Karşıyaka, İzmir', 'Çiğli OSB, İzmir'], icon: 'map-pin' }), field('Son teslim', { value: '15.11.2026', icon: 'calendar-blank', help: 'GG.AA.YYYY', inputmode: 'numeric' }))}
${check('Kayıtlı şirket adresimi kullan', true)}
<div class="pgb-drop" data-drop>${iconTile('upload-simple', 'blue', 'md')}<p><b>Sürükleyip bırakın veya dosya seçin</b></p><p class="muted">PDF, DWG, JPG · en fazla 50 MB · sürüklemek yerine düğmeyi de kullanabilirsiniz</p>
<input type="file" id="rfq-file" class="sr-only" accept=".pdf,.dwg,.jpg,.jpeg" multiple><label class="btn btn-secondary" for="rfq-file">${ic('paperclip')}<span>Dosya seç</span></label></div>`, { tag: 'fieldset' });

  const act = `<div class="pgb-formact${n ? ' is-stack' : ''}">${btn('Taslağı kaydet', 'secondary', { block: n })}${btn('Talebi gönder', 'primary', { icon: 'paper-plane-right', type: 'submit', block: n })}</div>`;
  const form = `<form class="pgb-col" aria-labelledby="pgb-h1" novalidate onsubmit="event.preventDefault();document.getElementById('rfq-err').focus()">${ai}${errSum}${steps([['success', 'Ürün', 'check'], ['brand', 'Miktar & teslimat', 'truck', 1], ['neutral', 'Onay', 'list-checks']], 'Talep adımları')}${s1}${s2}${act}</form>`;

  const how = card(`${h2('Sonrasında ne olur?')}${timeline([['done', 'Talep oluşturuldu', 'Şimdi'], ['now', 'AI 12 uygun üreticiyi seçer', '≈ 5 dk'], ['next', 'Teklifler karşılaştırmaya düşer', '≈ 24 sa']]).replace('#truck"', '#sparkle"')}`);
  const help = card(`${iconTile('headset', 'green', 'md')}<div><p><b>İhracat masası</b></p><p class="muted">Hafta içi 09–18 · 0850 000 00 00</p></div>`, { cls: 'pgb-help' });

  return {
    main: root('teklif-iste', pageHead(['Ana sayfa', 'Teklif İste'], 'Teklif talebi oluşturun', 'Ortalama 24 saatte 6 teklif · yalnızca doğrulanmış üreticiler')
      + two('Form ve yardım', form, how + help, { lw: 'min(960px, 64%)', mainTag: true, asideLabel: 'Süreç ve yardım' })),
  };
}
