# Arasta × Penpot MCP

**Canlı site:** https://karacaismail.github.io/arasta-penpot-mcp/

Bu depo, Penpot 2.18’in yalnızca **MCP (Model Context Protocol)** üzerinden yönetilerek bir kurumsal B2B pazar yeri tasarımını baştan sona üretmesinin kaydıdır: tasarım çıktıları, Penpot’un MCP ile yönetilmeye gösterdiği **uyum/direnç ölçümü** ve bu ölçümde bulunan darboğazlara karşı geliştirilen **MCP iyileştirmeleri**.

Hiçbir tasarım dışarıda hazırlanıp içe aktarılmadı: sayfalar, bileşenler, varyantlar, ikonlar (Phosphor path’leri), renk/tipografi kütüphanesi ve design token’lar Penpot’un içinde `execute_code` ile oluşturuldu.

## İçerik

| Klasör | Ne var |
|---|---|
| `docs/` | GitHub Pages sitesi: tasarım galerisi (22 sayfa × 20 cihaz), rapor, MCP geliştirmeleri |
| `report/` | `findings.md` (uyum/direnç bulguları), `metrics.json` (MCP çağrı metrikleri) |
| `designer/v2/` | Penpot’u MCP ile süren tasarım sistemi ve sayfa üreticileri (v2: semi-flat 2.0, Roboto, Phosphor) |
| `designer/v1/` | İlk (editoryal) sürümün üreticileri |
| `mcp-plus/server/` | Penpot MCP sunucusu 2.18 için opt-in yama (asenkron işler, kuyruk, gövde sınırı, oturum TTL, stats, batch) |
| `mcp-plus/client/` | Dayanıklı MCP istemci araç seti (`pp.mjs`: daemon, parçalı modül yükleme, akıllı bekleme, devam ettirilebilir iş yürütücü) |
| `infra/` | Penpot 2.18 docker-compose (gizli anahtar çıkarıldı) |

## Tasarım ilkeleri
Adaptive-first (her cihaz ailesi ayrı UI ve ayrı bileşenler) · 320px öncelikli (1280px @%400 zoom reflow) · min yazı 16px (1rem) · radius ≤ 12 · WCAG 2.2 AA · Hedef ekranlar: 320/360/390/430 telefon, 480/844/932 yatay telefon, 600/768/1024 tablet (dikey/yatay), 1280/1440/1728 laptop, 1920 desktop, 27" 5K, 4K TV (10-foot), 8K.

## Lisanslar
- `designer/`, `mcp-plus/client/`, `docs/`, `report/`: MIT (bkz. `LICENSE`).
- `mcp-plus/server/`: Penpot kaynak koduna dayanır, **MPL-2.0** (bkz. `mcp-plus/server/LICENSE-MPL-2.0`).
- İkonlar: Phosphor Icons (MIT). Font: Roboto (Apache 2.0).

*Arasta hayali bir markadır; tüm şirket, ürün ve kişi adları örnek içeriktir.*
