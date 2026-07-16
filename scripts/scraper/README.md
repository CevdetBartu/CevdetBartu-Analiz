# Sykn1977 Futbol Analiz — Geçmiş Maç Veri Havuzu

## Mimari

```
scripts/scraper/
├── config.py          → Lig listesi, bekleme süreleri, port ayarları
├── db.py              → SQLite yönetimi (gecmis_maclar + scraper_state tabloları)
├── sessions.py        → Dönen User-Agent başlıkları, güvenli HTTP get
├── sources/
│   └── sofascore.py   → SofaScore public API wrapper (oranlar, kartlar, skorlar)
├── worker.py          → Arka plan iş parçacığı (tarih tarih tarar)
├── server.py          → Flask kontrol sunucusu (port 5051, yalnızca localhost)
└── run.py             → Başlangıç noktası
```

## Veritabanı

**Dosya:** `scripts/scraper/gecmis_maclar.db` (SQLite)

**Tablo:** `gecmis_maclar`

| Sütun | Tip | Açıklama |
|---|---|---|
| tarih | TEXT | "28.05.2025" |
| saat | TEXT | "21:00" |
| lig | TEXT | Lig adı |
| ev_sahibi | TEXT | Ev sahibi takım |
| deplasman | TEXT | Deplasman takım |
| devre_skoru | TEXT | "1:0" |
| mac_skoru | TEXT | "2:1" |
| onceki_skorlar | TEXT | Önceki karşılaşmalar |
| kart_ev | INTEGER | Ev sahibi sarı kart |
| kart_dep | INTEGER | Deplasman sarı kart |
| kirmizi_kart | INTEGER | Kırmızı kart |
| lig_sira_ev | INTEGER | Lig sıralaması (ev) |
| lig_sira_dep | INTEGER | Lig sıralaması (dep) |
| toplam_takim | INTEGER | Ligteki toplam takım |
| im_6 | TEXT | i/m 6+ sonucu |
| oran_1 | REAL | Ev kazanır oranı |
| oran_x | REAL | Beraberlik oranı |
| oran_2 | REAL | Deplasman kazanır oranı |
| alt_orani | REAL | 2.5 altı oranı |
| ust_orani | REAL | 2.5 üstü oranı |
| kg_var | REAL | KG Var oranı |
| kg_yok | REAL | KG Yok oranı |
| ort_min | REAL | Minimum ortalama oran |
| ort_max | REAL | Maksimum ortalama oran |

**İndeksler:** oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok, lig, tarih, kaynak_id

**UNIQUE:** (ev_sahibi, deplasman, tarih) — aynı maç iki kez eklenmez

## Çalıştırma

### 1. Scraper sunucusunu başlat

Replit'te **"Scraper Control Server"** workflow'unu başlatın,
veya terminalde:

```bash
python3 scripts/scraper/run.py
```

### 2. Veri çekimini başlat

**Yöntem A:** Tarayıcıda `/admin` sayfasına gidin → "Taramayı Başlat" butonuna tıklayın.

**Yöntem B:** API üzerinden:

```bash
# Durumu görüntüle
curl http://localhost:8080/api/admin/scraper/stats

# Başlat (12 aylık veri)
curl -X POST http://localhost:8080/api/admin/scraper/start \
  -H "Content-Type: application/json" \
  -d '{"months_back": 12}'

# Durdur
curl -X POST http://localhost:8080/api/admin/scraper/stop

# Baştan tara (tarihi sıfırla)
curl -X POST http://localhost:8080/api/admin/scraper/reset
```

## Takip Edilen Ligler

- Türkiye Süper Lig, 1. Lig, 2. Lig
- UEFA Şampiyonlar/Avrupa/Konferans Ligi
- İngiltere Premier Lig
- İspanya La Liga
- Almanya Bundesliga
- İtalya Serie A
- Fransa Ligue 1
- Hollanda Eredivisie
- Portekiz Primeira Liga
- Belçika Pro League
- İskoçya Premiership
- Yunanistan Super League
- Romanya Liga 1

## Güvenlik Önlemleri

- Her günlük istek sonrası **2.5–6 saniye** rastgele bekleme
- Her alt-istek (kart, oran) için **0.8–2 saniye** bekleme
- 10 farklı **User-Agent** arasından rastgele seçim
- HTTP 429 (rate limit) alınırsa **30–45 saniye** ek bekleme
- Her istek **3 kez** otomatik yeniden deneme
- Aynı maç tekrar eklenmez (UNIQUE constraint)
- Kaldığı yerden devam eder (scraper_state tablosu)

## Flask API (dahili, port 5051)

| Endpoint | Yöntem | Açıklama |
|---|---|---|
| `/healthz` | GET | Sunucu sağlık kontrolü |
| `/stats` | GET | DB istatistikleri + worker durumu |
| `/start` | POST | Taramayı başlat |
| `/stop` | POST | Taramayı durdur |
| `/reset` | POST | Son tarihi sıfırla |

## Express Proxy (port 8080)

| Endpoint | Yöntem |
|---|---|
| `/api/admin/scraper/stats` | GET |
| `/api/admin/scraper/start` | POST |
| `/api/admin/scraper/stop` | POST |
| `/api/admin/scraper/reset` | POST |
