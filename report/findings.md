# Penpot 2.18 × MCP — uyum/direnç bulguları (canlı kayıt)

| # | Zaman | Alan | Sonuç | Ayrıntı |
|---|---|---|---|---|
| 1 | kurulum | Yerleşik MCP (2.18) | UYUM | compose'da `penpot-mcp` servisi + `/mcp/stream?userToken=` uç noktası; key UI'dan üretiliyor, çok kullanıcılı mod |
| 2 | kurulum | Eklenti bağlantısı | KISMİ | MCP yalnızca açık bir tasarım sekmesi + araç çubuğundaki MCP düğmesiyle çalışır; sekme kapanırsa bağlantı kopar (headless çalışma yok) |
| 3 | kurulum | Hesap / giriş | DİRENÇ (beklenen) | MCP kullanıcı oturumu gerektirir; hesap açma ve giriş insan adımı |
| 4 | s1 | Sayfa oluşturma/adlandırma | UYUM | `createPage()` + `name` sorunsuz, 13 sayfa |
| 5 | s1 | Dosya adını değiştirme | DİRENÇ | `penpot.currentFile.name` salt okunur (getter only) — MCP ile dosya adı değiştirilemiyor |
| 6 | t1 | Board+flex+text+path | UYUM | 15 şekil ≈ 364 ms; Google Fonts (Inter, Bodoni Moda) API'den uygulanabiliyor |
| 7 | t1 | Yükseklik okuma | KISMİ | Flex `auto` yükseklik oluşturma anında güncel değil (405 döndü, gerçek ≈ 510); asenkron yerleşim |
| 8 | t2 | Component/instance/override | UYUM | createComponent → başka sayfada instance() → flex fill (3×181px) → metin override: sorunsuz (~1 sn) |
| 9 | t2 | Aktif olmayan sayfada değişiklik | DİRENÇ | "Cannot modify a page that is not currently active" — her sayfa için önce `await penpot.openPage()` gerekiyor; UI sekmesi de o sayfaya geçiyor |
| 10 | t2 | Component adı | KISMİ | `name="TEST/Card"` atanınca otomatik path+name olarak bölünüyor (beklenen Penpot davranışı ama dokümante değil) |
| 11 | s3 | Flex hug + fill çocuk | DİRENÇ (motor hatası) | Çocuk önce `resize` edilip sonra `horizontalSizing=fill` yapılırsa hug ebeveyn 0.01 px yüksekliğe çöküyor; çocuğa yeniden `resize` gerekiyor. Geçici çözüm: önce sizing, sonra resize |
| 12 | s3 | 8 header component | UYUM | ≈8 sn, 8 ana bileşen; export_shape ile görsel doğrulama çalışıyor |
| 13 | s3 | `resize()` yan etkisi | DİRENÇ | `resize()` çağrısı layoutChild `horizontalSizing/verticalSizing` değerini sessizce `fix`e çeviriyor (kontrollü deney B/D). Dokümanda yalnızca Text.growType için belirtilmiş |
| 14 | s3 | Row-flex + yalnız fill çocuk | DİRENÇ (motor hatası) | Tüm çocukları `fill` genişlikli bir row-flex board `hug` yüksekliğini 0.01 hesaplıyor (çocuk 48px olsa bile). Geçici çözüm: sarmalayıcıyı column-flex yapmak |
| 15 | s4 | Varyant listeleme | DİRENÇ | `library.local.components` her varyant grubundan yalnızca 1 bileşen döndürüyor; diğerleri `comp.variants.variantComponents()` ile bulunuyor |
| 16 | s4 | `createVariantContainer` (2 özellik) | DİRENÇ (hata) | 6 bileşenle Tür×Durum oluşturulunca fazladan `Property 3 = Value 1` özelliği eklendi |
| 17 | fix-nav | Ana bileşen → instance yayılımı | UYUM | Ana bileşende yükseklik/dolgu değişikliği başka sayfadaki instance’a anında yansıdı |
| 18 | home | 120 sn zaman aşımı | DİRENÇ | `execute_code` 120 sn’de zaman aşımına uğruyor ama eklentideki kod iptal edilmeden çalışmaya devam ediyor; bu sürede heartbeat kesildiği için sonraki çağrılar ~2 dk "tab suspended" hatası alıyor |
| 19 | home | Ölçeklenme | DİRENÇ | Aynı karmaşıklıktaki frame’in yapım süresi sayfadaki şekil sayısıyla artıyor: 250 şekil 4 sn (boş sayfa) → 416 şekil 31 sn (≈4.500 şekilli sayfa). Tahmini neden: her değişiklikte UI katman paneli + canvas yeniden çizimi |
| 20 | home | UI katman paneli maliyeti | DİRENÇ (ölçüldü) | ≈7.000 şekilli sayfada 30 metin: katman paneli açık 5,4 sn → "Varlıklar" sekmesi açık 1,35 sn (×4) → viewport boş alanda 1,22 sn. Boş sayfada ≈0,3 sn. MCP işleri görünür UI ile aynı iş parçacığında çalışıyor |
| 21 | arrange | Toplu taşıma | DİRENÇ | 20 büyük frame’in x/y taşınması tamamlandı ama ardından gelen basit çağrı 120 sn zaman aşımı + ~2 dk "suspended" (UI yeniden çizimi) |
| 22 | v2 | İstek boyutu sınırı | DİRENÇ | Yerleşik MCP sunucusu (body-parser varsayılanı) 100 KB üzeri `execute_code` gövdesini `PayloadTooLargeError` ile reddediyor; kütüphane/ikon verisi parçalar hâlinde eklentinin `storage` alanına yüklenmeli |
| 23 | v2 | Board resize + scale kısıtı | DİRENÇ | İçinde path olan board `resize()` edildiğinde `constraints=scale` verilmiş çocuk path’ler doğru ölçeklenmiyor (bozuk çizim). Path’ler tek tek `resize` + konum hesabıyla ölçeklenmeli |
| 24 | v2 | Dosya değiştirme | DİRENÇ | Token başına tek eklenti bağlantısı: eski sekme/dosyadaki bağlantı canlıyken yeni dosyadaki "Connect here" sunucuda "Duplicate connection … rejecting new connection" ile reddediliyor ve çağrılar sessizce eski dosyaya gidiyor. Çözüm: `penpot-mcp` servisini yeniden başlatmak |
| 25 | v2 | Oturum yaşam döngüsü | KISMİ | İstemci her süreçte yeni MCP oturumu açıyor; sunucu kapanmayan oturumları biriktirdi (241). İstemci tarafında `terminateSession()` eklendi |
| 26 | v2 | `fonts.findByName` | DİRENÇ | `findByName("Roboto")` tam eşleşme değil, "Roboto Mono" döndürdü; tüm metinler mono çizildi. Çözüm: `penpot.fonts.all.find(f => f.name === ad)` |
| 27 | v2 | export_shape "page" | DİRENÇ | `shapeId: "page"` exporter’da 500 hatası veriyor (kök SVG 0.01 px, Playwright waitFor zaman aşımı); tek tek shape export ediliyor |
| 28 | v2 | İkon kütüphanesi ölçeği | UYUM (yavaşlayan) | 354 bileşen: 84’lük gruplar 1,8 → 4,0 → 6,4 → 13,9 sn; kütüphane büyüdükçe createComponent maliyeti artıyor |
| 29 | v2 | Değişken çağrı süreleri | DİRENÇ (belirsiz) | Aynı tür bileşen üretimi 3 sn’den 80 sn’ye çıktı; hemen ardından aynı işlemin profili <1 sn (build 0,5 s, createComponent 5 ms). Muhtemel neden: yeni WebGL render motorunun görünür alanı yeniden çizmesi / kalıcılık kuyruğu. v2 dosyası "WebGL rendering" modunda açılıyor |
| 30 | v2 | Boş metin | DİRENÇ | `text.characters = ""` → "Value not valid: :characters"; boş etiket için metni gizlemek gerekiyor |
| 31 | v2 | Gizli tarayıcı paneli | DİRENÇ (ortam) | Uygulama içi tarayıcı paneli gizliyken Penpot sekmesi askıya alınıyor: 10+ dk heartbeat yok, tüm çağrılar "suspended". Panele herhangi bir etkileşim (ekran görüntüsü/tık) sekmeyi anında uyandırdı. MCP’nin tarayıcı sekmesine bağımlılığı en büyük operasyonel risk |
| 32 | v2 | Katman paneli → Assets | UYUM (iyileştirme) | Sol paneli Assets’e almak ağır sayfalarda çağrı süresini belirgin düşürüyor |
