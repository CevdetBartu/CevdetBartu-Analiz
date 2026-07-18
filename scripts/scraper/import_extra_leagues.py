import os
import sys
import logging
from curl_cffi import requests
import csv
import io
from datetime import datetime

# Add the scraper folder to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_conn, upsert_match
from sources.football_data_uk import _parse_date, _safe_float

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# CSV League Code -> (DB League Name, Min Year)
EXTRA_LEAGUES = {
    "SWE":  ("İsveç Allsvenskan", 2020),
    "SWE2": ("İsveç Superettan", 2020),
    "NOR":  ("Norveç Eliteserien", 2020),
    "NOR2": ("Norveç 1. Lig", 2020),
    "USA":  ("ABD MLS", 2020),
    "ISL":  ("İzlanda Besta deild karla", 2020),
    "DNK":  ("Danimarka Superligaen", 2020),
    "DNK2": ("Danimarka 1. Division", 2020),
    "FIN":  ("Finlandiya Veikkausliiga", 2020),
    "FIN2": ("Finlandiya Ykkösliiga", 2020),
    "BRA":  ("Brezilya Serie A", 2020),
    "BRA2": ("Brezilya Serie B", 2020),
    "MEX":  ("Meksika Liga MX Apertura", 2020), # Dinamik olarak güncellenecek
    "MEX2": ("Meksika Liga de Expansion Apertura", 2020), # Dinamik olarak güncellenecek
    "ARG":  ("Arjantin Primera Division", 2020),
    "ARG2": ("Arjantin Primera Nacional", 2020),
    "POL":  ("Polonya Ekstraklasa", 2020),
    "POL2": ("Polonya I Liga", 2020),
    "AUT":  ("Avusturya Bundesliga", 2020),
    "AUT2": ("Avusturya 2. Liga", 2020),
    "JPN":  ("Japonya J1 League", 2020),
    "JPN2": ("Japonya J2 League", 2020),
    "KOR":  ("Güney Kore K League 1", 2020),
    "CHE":  ("İsviçre Super League", 2020),
    "COL":  ("Kolombiya Primera A Apertura", 2020), # Dinamik olarak güncellenecek
    "CHL":  ("Şili Liga de Primera", 2020),
    "CHN":  ("Çin Süper Ligi", 2020),
    "RUS":  ("Rusya Premier Ligi", 2020),
}

def import_extra_leagues():
    conn = get_conn()
    try:
        for code, (db_name, min_year) in EXTRA_LEAGUES.items():
            url = f"https://www.football-data.co.uk/new/{code}.csv"
            logger.info(f"İndiriliyor: {url} -> {db_name}")
            
            try:
                r = requests.get(url, impersonate="chrome")
                if r.status_code != 200:
                    logger.error(f"{code} indirilemedi, HTTP durum: {r.status_code}")
                    continue
            except Exception as e:
                logger.error(f"{code} indirilirken hata oluştu: {e}")
                continue
                
            reader = csv.DictReader(io.StringIO(r.text))
            
            # Kolon isimlerindeki Byte Order Mark (BOM) karakterini temizlemek için
            if reader.fieldnames:
                reader.fieldnames = [name.replace('\ufeff', '') for name in reader.fieldnames]
                
            success_count = 0
            row_count = 0
            
            for row in reader:
                raw_date = row.get("Date")
                if not raw_date:
                    continue
                
                # Tarih ayrıştır ve formatla
                parsed_date = _parse_date(raw_date)
                if not parsed_date:
                    continue
                
                # Minimum yıl filtresi uygulayalım
                try:
                    dt = datetime.strptime(parsed_date, "%d.%m.%Y")
                    if dt.year < min_year:
                        continue
                except ValueError:
                    continue

                # Dinamik lig ismi düzeltmeleri (Apertura / Clausura)
                current_db_name = db_name
                if code == "MEX":
                    current_db_name = "Meksika Liga MX Apertura" if dt.month >= 7 else "Meksika Liga MX Clausura"
                elif code == "MEX2":
                    current_db_name = "Meksika Liga de Expansion Apertura" if dt.month >= 7 else "Meksika Liga de Expansion Clausura"
                elif code == "COL":
                    current_db_name = "Kolombiya Primera A Apertura" if dt.month <= 6 else "Kolombiya Primera A Finalizacion"
                
                home_team = row.get("Home") or row.get("HomeTeam")
                away_team = row.get("Away") or row.get("AwayTeam")
                if not home_team or not away_team:
                    continue
                
                hg = row.get("HG") or row.get("FTHG")
                ag = row.get("AG") or row.get("FTAG")
                if hg is None or ag is None or hg == '' or ag == '':
                    continue # Sadece tamamlanmış maçlar
                
                mac_skoru = f"{hg}:{ag}"
                
                # Oranlar
                oran_1 = _safe_float(row.get("B365CH") or row.get("B365H") or row.get("PSCH"))
                oran_x = _safe_float(row.get("B365CD") or row.get("B365D") or row.get("PSCD"))
                oran_2 = _safe_float(row.get("B365CA") or row.get("B365A") or row.get("PSCA"))
                
                # Veritabanı kaydı oluştur
                db_row = {
                    "tarih":            parsed_date,
                    "saat":             row.get("Time") or "00:00",
                    "lig":              current_db_name,
                    "ev_sahibi":        home_team.strip(),
                    "deplasman":        away_team.strip(),
                    "devre_skoru":      None,
                    "mac_skoru":        mac_skoru,
                    "onceki_skorlar":   None,
                    "kart_ev":          None,
                    "kart_dep":         None,
                    "kirmizi_kart":     0,
                    "korner_ev":        None,
                    "korner_dep":       None,
                    "lig_sira_ev":      None,
                    "lig_sira_dep":     None,
                    "toplam_takim":     20,
                    "im_6":             None,
                    "oran_1":           oran_1,
                    "oran_x":           oran_x,
                    "oran_2":           oran_2,
                    "alt_orani":        None,
                    "ust_orani":        None,
                    "kg_var":           None,
                    "kg_yok":           None,
                    "ort_min":          None,
                    "ort_max":          None,
                    "kaynak":           "football-data.co.uk",
                    "kaynak_id":        None
                }
                
                row_count += 1
                if upsert_match(db_row, conn):
                    success_count += 1
            
            logger.info(f"{db_name} tamamlandı: {row_count} maç işlendi, {success_count} yeni/güncellenmiş kayıt eklendi.")
            
        conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    import_extra_leagues()
