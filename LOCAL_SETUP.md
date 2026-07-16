# CevdetBartu Futbol Analiz — Yerel Kurulum Kılavuzu

Bu doküman projeyi kendi bilgisayarınızda çalıştırmak için gereken tüm adımları açıklar.

---

## Gereksinimler

| Araç | Minimum Sürüm | Kontrol |
|------|---------------|---------|
| Node.js | 20+ | `node --version` |
| pnpm | 9+ | `pnpm --version` |
| Python | 3.10+ | `python3 --version` |
| SQLite | — | Node paketi olarak gelir |

> **pnpm kurulu değilse:** `npm install -g pnpm`

---

## 1. Bağımlılıkları Kur

### Node.js paketleri

```bash
pnpm install
```

### Python sanal ortamı (scraper için)

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r scripts/scraper/requirements.txt
```

---

## 2. Ortam Değişkenlerini Ayarla

### API sunucusu

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

`.env` içeriği (değiştirmeniz gerekenler işaretli):

```env
NODE_ENV=development
PORT=8080
LOG_LEVEL=info

# PostgreSQL — isteğe bağlı (yoksa atlanır, SQLite kullanılır)
# DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/futbol_db

# Oturum şifresi — herhangi bir uzun rastgele metin
SESSION_SECRET=yerel-gizli-anahtar-buraya
```

### Ön yüz (frontend)

```bash
cp artifacts/football-app/.env.example artifacts/football-app/.env
```

```env
PORT=5173
BASE_PATH=/
API_PORT=8080
```

---

## 3. Servisleri Başlat

Üç ayrı terminal penceresi açın:

### Terminal 1 — API Sunucusu

```bash
pnpm --filter @workspace/api-server run dev
```

→ `http://localhost:8080` adresinde çalışır

### Terminal 2 — Ön Yüz (React)

```bash
pnpm --filter @workspace/football-app run dev
```

→ `http://localhost:5173` adresinde çalışır  
→ `/api` istekleri otomatik olarak `localhost:8080`'e yönlendirilir

### Terminal 3 — Scraper (İsteğe Bağlı)

```bash
source .venv/bin/activate
python3 scripts/scraper/run.py
```

→ `http://127.0.0.1:5051` adresinde Flask olarak çalışır  
→ Admin panelinden de UI üzerinden başlatılabilir

---

## 4. Uygulamayı Aç

Tarayıcıda şu adresleri ziyaret edin:

| Sayfa | URL |
|-------|-----|
| Ana Sayfa (Analiz) | http://localhost:5173/ |
| Bugünün Maçları | http://localhost:5173/bugun |
| Admin Paneli | http://localhost:5173/admin |

---

## Proje Yapısı (Kısaca)

```
/
├── artifacts/
│   ├── api-server/         # Express + TypeScript arka uç (port 8080)
│   └── football-app/       # React + Vite ön yüz (port 5173)
├── scripts/
│   └── scraper/            # Python scraper (Flask, port 5051)
│       ├── run.py          # Başlangıç noktası
│       ├── server.py       # Flask API
│       ├── worker.py       # Veri çekme işçisi
│       └── gecmis_maclar.db  # SQLite veritabanı (geçmiş maçlar)
├── lib/
│   ├── api-client-react/   # Oto-üretilen API istemcisi
│   └── db/                 # Drizzle şeması (PostgreSQL — isteğe bağlı)
└── .venv/                  # Python sanal ortamı (git'e dahil değil)
```

---

## Sık Karşılaşılan Sorunlar

### `pnpm install` hatası veriyor
Workspace paketleri build gerektirebilir:
```bash
pnpm install
pnpm --filter @workspace/db run build 2>/dev/null || true
pnpm --filter @workspace/api-spec run build 2>/dev/null || true
```

### Frontend API'ye ulaşamıyor
`artifacts/football-app/.env` dosyasında `API_PORT=8080` olduğundan emin olun ve API sunucusunun çalıştığını kontrol edin.

### Scraper "çevrimdışı" görünüyor
Admin panelindeki **▶ Scraper'ı Başlat** butonuna basın ya da Terminal 3'teki komutu çalıştırın. API sunucusu scraper'ı otomatik olarak `.venv/bin/python3` ile başlatır.

### Python paketi bulunamıyor
Sanal ortamın aktif olduğundan emin olun:
```bash
source .venv/bin/activate
pip install -r scripts/scraper/requirements.txt
```

### Port zaten kullanımda
```bash
# Hangi süreç kullanıyor?
lsof -i :8080
lsof -i :5173
```
İlgili süreci kapatın veya `.env` dosyalarından portları değiştirin.
