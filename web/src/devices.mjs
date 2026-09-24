// Screen clusters → screens. Each screen renders the device family's own UI at its exact size.
export const CLUSTERS = [
  { slug: 'mobil-dikey', title: 'Mobil · dikey', icon: 'device-mobile', desc: 'Alt sekme çubuklu telefon arayüzü', screens: [
    { id: '320', w: 320, h: 480, fam: 'phone', label: '320 px · iPhone 4 / SE (1. nesil)', note: '1280 px ekranın %400 zoom hâli (WCAG 1.4.10 reflow)' },
    { id: '360', w: 360, h: 740, fam: 'phone', label: '360 px · küçük Android' },
    { id: '375', w: 375, h: 667, fam: 'phone', label: '375 px · iPhone SE / mini' },
    { id: '390', w: 390, h: 844, fam: 'phone', label: '390 px · orta telefon' },
    { id: '430', w: 430, h: 932, fam: 'phone', label: '430 px · büyük telefon' } ] },
  { slug: 'mobil-yatay', title: 'Mobil · yatay', icon: 'device-mobile-camera', desc: 'Sol rail’li yatay telefon arayüzü', screens: [
    { id: '480x320', w: 480, h: 320, fam: 'phoneL', label: '480 × 320 · küçük telefon yatay' },
    { id: '667x375', w: 667, h: 375, fam: 'phoneL', label: '667 × 375 · iPhone SE yatay' },
    { id: '844x390', w: 844, h: 390, fam: 'phoneL', label: '844 × 390 · orta telefon yatay' },
    { id: '932x430', w: 932, h: 430, fam: 'phoneL', label: '932 × 430 · büyük telefon yatay' } ] },
  { slug: 'tablet-dikey', title: 'Tablet · dikey', icon: 'device-tablet', desc: 'Arama odaklı header, kategori sekmeleri', screens: [
    { id: '600', w: 600, h: 960, fam: 'tablet', label: '600 px · küçük tablet' },
    { id: '768', w: 768, h: 1024, fam: 'tablet', label: '768 px · iPad mini' },
    { id: '1024', w: 1024, h: 1366, fam: 'tablet', label: '1024 px · iPad Pro 12.9' } ] },
  { slug: 'tablet-yatay', title: 'Tablet · yatay', icon: 'device-tablet-camera', desc: 'Kompakt masaüstü header', screens: [
    { id: '960x600', w: 960, h: 600, fam: 'tabletL', label: '960 × 600 · küçük tablet yatay' },
    { id: '1024x768', w: 1024, h: 768, fam: 'tabletL', label: '1024 × 768 · iPad yatay' },
    { id: '1366x1024', w: 1366, h: 1024, fam: 'tabletL', label: '1366 × 1024 · iPad Pro yatay' } ] },
  { slug: 'laptop', title: 'Laptop', icon: 'laptop', desc: 'Tam masaüstü: yardımcı bar, mega menü, yan filtre', screens: [
    { id: '1280', w: 1280, h: 800, fam: 'desktop', label: '1280 px · küçük laptop' },
    { id: '1440', w: 1440, h: 900, fam: 'desktop', label: '1440 px · orta laptop' },
    { id: '1728', w: 1728, h: 1117, fam: 'desktop', label: '1728 px · MacBook Pro 16"' } ] },
  { slug: 'masaustu', title: 'Masaüstü & 5K', icon: 'desktop', desc: '1920 px ve 27" 5K (2560 CSS px @2x)', screens: [
    { id: '1920', w: 1920, h: 1080, fam: 'desktop', label: '1920 px · Full HD' },
    { id: '2560', w: 2560, h: 1440, fam: 'wide', label: '2560 px · 27" 5K (@2x)' } ] },
  { slug: 'buyuk-ekran', title: 'Büyük ekran · 8K', icon: 'monitor', desc: '3840 CSS px @2x (7680 × 4320)', screens: [
    { id: '3840', w: 3840, h: 2160, fam: 'ultra', label: '3840 px · 8K (@2x)' } ] },
  { slug: 'tv', title: 'TV · 10-foot', icon: 'television-simple', desc: 'Koyu arayüz, uzaktan kumanda (D-pad) ile odak gezinmesi', screens: [
    { id: '4k', w: 1920, h: 1080, fam: 'tv', label: '4K TV · 1920 × 1080 CSS px (@2x)' } ] },
];
export const SCREENS = CLUSTERS.flatMap((c) => c.screens.map((s) => ({ ...s, cluster: c })));
export const PAGES = [
  ['ana-sayfa', 'Ana Sayfa', 'house'], ['kategoriler', 'Kategoriler', 'squares-four'], ['arama', 'Arama & Liste', 'magnifying-glass'], ['urun', 'Ürün Detayı', 't-shirt'],
  ['karsilastir', 'Ürün Karşılaştırma', 'arrows-left-right'], ['tedarikciler', 'Tedarikçi Arama', 'factory'], ['magaza', 'Tedarikçi Mağazası', 'storefront'], ['flash', 'Flash Fırsatlar', 'lightning'],
  ['teklif-iste', 'Teklif İste (AI RFQ)', 'file-text'], ['teklifler', 'Teklif Karşılaştırma', 'scales'], ['sepet', 'Sepet', 'shopping-cart-simple'], ['odeme', 'Ödeme', 'credit-card'],
  ['siparis', 'Sipariş Onayı & Takip', 'truck'], ['mesajlar', 'Mesajlar', 'chat-circle-dots'], ['panel', 'Alıcı Paneli', 'chart-line-up'], ['giris', 'Giriş', 'key'],
  ['kayit', 'Kurumsal Kayıt', 'buildings'], ['guvence', 'Ticaret Güvencesi', 'shield-check'], ['tedarikci-ol', 'Tedarikçi Olun', 'handshake'], ['yardim', 'Yardım Merkezi', 'headset'],
  ['hakkimizda', 'Hakkımızda', 'medal'], ['durumlar', '404, Bakım & Boş Durumlar', 'warning-circle'],
].map(([slug, title, icon]) => ({ slug, title, icon }));
