const names = ['00 · Kapak & Rehber', '01 · Temeller', '02 · Bileşenler · Temel', '03 · Bileşenler · Navigasyon', '04 · Bileşenler · Ticaret', '05 · İkonlar & İllüstrasyonlar',
 '10 · Ana Sayfa', '11 · Kategoriler', '12 · Arama & Liste', '13 · Ürün Detayı', '14 · Ürün Karşılaştırma', '15 · Tedarikçi Arama', '16 · Tedarikçi Mağazası', '17 · Flash Fırsatlar',
 '18 · Teklif İste (AI RFQ)', '19 · Teklif Karşılaştırma', '20 · Sepet', '21 · Ödeme', '22 · Sipariş Onayı & Takip', '23 · Mesajlar', '24 · Alıcı Paneli', '25 · Giriş',
 '26 · Kurumsal Kayıt', '27 · Ticaret Güvencesi', '28 · Tedarikçi Olun', '29 · Yardım Merkezi', '30 · Hakkımızda', '31 · 404, Bakım & Boş Durumlar'];
const first = penpot.currentPage; first.name = names[0];
for (const n of names.slice(1)) { const p = penpot.createPage(); p.name = n; }
return penpotUtils.getPages().length;
