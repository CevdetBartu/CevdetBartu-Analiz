"""
Scraper konfigürasyonu — football-data.co.uk CSV kaynağı için lig kodları.
"""
import os

# football-data.co.uk lig kodları → lig adı
# Sezon CSV URL formatı: https://www.football-data.co.uk/mmz4281/{sezon}/{kod}.csv
LEAGUES: dict[str, str] = {
    "T1":  "Türkiye Süper Lig",
    "T2":  "Türkiye 1. Lig",
    "E0":  "İngiltere Premier Lig",
    "SP1": "İspanya La Liga",
    "D1":  "Almanya Bundesliga",
    "I1":  "İtalya Serie A",
    "F1":  "Fransa Ligue 1",
    "N1":  "Hollanda Eredivisie",
    "P1":  "Portekiz Primeira Liga",
    "B1":  "Belçika Pro League",
    "SC0": "İskoçya Premiership",
    "G1":  "Yunanistan Super League",
    "R1":  "Romanya Liga 1",
}

# Kaç sezon geriye gidilsin (mevcut sezon dahil)
SEASONS_BACK: int = 4  # ör. 2024/25, 2023/24, 2022/23, 2021/22

# Kaç aylık geçmiş veri çekilsin (worker başlangıç filtresi için)
MONTHS_BACK: int = 12

# İstekler arası bekleme (saniye) — CSV'ler tek istek, fazla agresif olma
DELAY_MIN: float = 1.5
DELAY_MAX: float = 3.5

# Alt-istek bekleme (artık kullanılmıyor ama uyumluluk için)
SUB_DELAY_MIN: float = 0.5
SUB_DELAY_MAX: float = 1.0

# Flask kontrol sunucusu portu (dahili, dışarıya açık değil)
FLASK_PORT: int = 5051

# SQLite veritabanı yolu (proje köküne göre)
_BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH: str = os.path.join(_BASE, "scripts", "scraper", "gecmis_maclar.db")

# İstek başına yeniden deneme sayısı
MAX_RETRIES: int = 3

# football-data.co.uk base URL
FDUK_BASE: str = "https://www.football-data.co.uk/mmz4281"
