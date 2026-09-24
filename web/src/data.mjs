// Content data (same as the Penpot v2 builders)
export const CATS = [['Tekstil & Hazır Giyim', 'textile', 'blue', '12.480 ürün · 1.320 tedarikçi'], ['Makine & Endüstri', 'machine', 'slate', '8.960 ürün · 910 tedarikçi'], ['Gıda & Tarım', 'food', 'green', '15.200 ürün · 2.140 tedarikçi'],
  ['Yapı & Seramik', 'build', 'saffron', '6.320 ürün · 540 tedarikçi'], ['Ambalaj & Baskı', 'pack', 'saffron', '4.870 ürün · 610 tedarikçi'], ['Elektrik & Aydınlatma', 'electric', 'violet', '7.410 ürün · 730 tedarikçi'],
  ['Mobilya & Ev', 'furniture', 'teal', '9.130 ürün · 1.020 tedarikçi'], ['Kimya & Plastik', 'chem', 'violet', '3.960 ürün · 380 tedarikçi'], ['Otomotiv Yan Sanayi', 'auto', 'slate', '5.540 ürün · 470 tedarikçi'], ['Kozmetik & Bakım', 'cosmetic', 'coral', '2.880 ürün · 350 tedarikçi']];
export const PRODS = [
  { n: 'Organik pamuk penye kumaş, 180 g/m²', s: 'Ege Tekstil · Denizli', p: '₺118 – ₺142,50', u: '/ metre', m: 'Min. 500 metre · 3 kademe', i: 'textile', b: 'Flash −%18', a: 'Uyum %92' },
  { n: 'Paslanmaz çelik endüstriyel mikser, 500 L', s: 'Anadolu Makina · Konya', p: '₺312.000', u: '/ adet', m: 'Min. 1 adet · 45 gün üretim', i: 'machine', a: 'Uyum %88' },
  { n: 'Erken hasat sızma zeytinyağı, 5 L teneke', s: 'Ayvalık Zeytincilik · Balıkesir', p: '₺1.090 – ₺1.240', u: '/ teneke', m: 'Min. 120 teneke · 2 kademe', i: 'food', b: 'Yeni hasat', a: 'Uyum %90' },
  { n: 'Porselen karo 60×120, mat yüzey', s: 'Bilecik Seramik · Bilecik', p: '₺412 – ₺489', u: '/ m²', m: 'Min. 300 m² · 3 kademe', i: 'build', a: 'Uyum %86' },
  { n: '5 katlı oluklu koli, özel baskılı', s: 'Gebze Ambalaj · Kocaeli', p: '₺12,90 – ₺18,40', u: '/ adet', m: 'Min. 2.000 adet · 4 kademe', i: 'pack', b: 'Flash −%12', a: 'Uyum %95' },
  { n: 'LED panel armatür 60×60, 40 W', s: 'Işık Elektrik · İstanbul', p: '₺470 – ₺585', u: '/ adet', m: 'Min. 200 adet · CE, TSE', i: 'electric', a: 'Uyum %84' },
  { n: 'Masif meşe yemek masası, 200 cm', s: 'İnegöl Mobilya · Bursa', p: '₺24.900 – ₺28.400', u: '/ adet', m: 'Min. 10 adet · OEM', i: 'furniture', a: 'Uyum %81' },
  { n: 'Gıda sınıfı PET granül, şişelik', s: 'Kocaeli Polimer · Kocaeli', p: '₺54 – ₺61', u: '/ kg', m: 'Min. 5 ton · FDA uyumlu', i: 'chem', b: 'Stokta', a: 'Uyum %87' },
  { n: 'Fren diski, ventilli, OEM uyumlu', s: 'Bursa Oto Parça · Bursa', p: '₺640 – ₺720', u: '/ adet', m: 'Min. 100 adet · IATF 16949', i: 'auto', a: 'Uyum %83' },
  { n: 'Isparta gül suyu, 1 L cam şişe', s: 'Isparta Gül · Isparta', p: '₺96 – ₺118', u: '/ şişe', m: 'Min. 500 şişe · Organik', i: 'cosmetic', a: 'Uyum %89' },
  { n: 'Tam deri evrak çantası, OEM', s: 'Kapalıçarşı Deri · İstanbul', p: '₺1.780 – ₺2.150', u: '/ adet', m: 'Min. 100 adet · Logo baskı', i: 'handbag', a: 'Uyum %85' },
  { n: 'Türk kahvesi, vakumlu 1 kg', s: 'Gaziantep Kavurma · Gaziantep', p: '₺520 – ₺590', u: '/ kg', m: 'Min. 200 kg · Private label', i: 'coffee', b: 'Çok satan', a: 'Uyum %91' },
  { n: 'Afyon beyaz mermer plaka, 2 cm', s: 'Afyon Mermer · Afyonkarahisar', p: '₺1.920', u: '/ m²', m: 'Min. 150 m² · Blok seçimi', i: 'build', a: 'Uyum %80' },
  { n: 'Gemi halatı, polyester 24 mm', s: 'Karadeniz Halat · Trabzon', p: '₺210 – ₺245', u: '/ metre', m: 'Min. 1.000 m · IMO', i: 'boat', a: 'Uyum %82' },
];
export const EVENTS = [['Ege’nin Pamuk Atölyeleri', 'Tekstil · 18 üretici', 'Bitmesine 23 sa 14 dk', 'textile'], ['Anadolu Makine Haftası', 'Makine · 14 üretici', 'Bitmesine 1 gün 6 sa', 'machine'], ['Karadeniz Hasadı', 'Gıda · 12 kooperatif', 'Bitmesine 2 gün 3 sa', 'food'],
  ['İnegöl Masif Mobilya', 'Mobilya · 7 üretici', 'Bitmesine 3 gün', 'furniture'], ['Ambalajda Sürdürülebilirlik', 'Ambalaj · 9 üretici', 'Bitmesine 4 gün', 'pack'], ['Seramik ve Karo Günleri', 'Yapı · 11 üretici', 'Bitmesine 5 gün', 'build']];
export const SUPPLIERS = [{ n: 'Ege Tekstil A.Ş.', i: 'ET' }, { n: 'Anadolu Makina', i: 'AM', meta: 'Konya · 21 yıl · Üretici', match: 'Uyum %88' }, { n: 'Ayvalık Zeytincilik', i: 'AZ', meta: 'Balıkesir · 9 yıl · Kooperatif', match: 'Uyum %90' }, { n: 'İnegöl Mobilya', i: 'İM', meta: 'Bursa · 15 yıl · Üretici', match: 'Uyum %81' }, { n: 'Gebze Ambalaj', i: 'GA', meta: 'Kocaeli · 8 yıl · Üretici', match: 'Uyum %95' }];
// columns per family for product grids (mirrors Penpot frames)
export const COLS = { phone: 2, phoneL: 3, tablet: 3, tabletL: 4, desktop: 5, wide: 6, ultra: 7, tv: 4 };
