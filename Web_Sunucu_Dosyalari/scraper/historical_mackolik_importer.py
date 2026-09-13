import requests
import sqlite3
import datetime
import time
import logging
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import get_conn, upsert_match

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def run_importer():
    # 01.01.2021 hedefine kadar GERİYE doğru gideceğiz
    end_date_str = "2021-01-01"
    end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
    
    # Bugünden 1 gün öncesinden başlıyoruz
    start_date = datetime.datetime.now().date() - datetime.timedelta(days=1)
    
    progress_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "historical_progress.txt")
    
    # Kaldığımız yeri oku
    current_date = start_date
    if os.path.exists(progress_file):
        with open(progress_file, "r") as f:
            saved_date = f.read().strip()
            if saved_date:
                try:
                    current_date = datetime.datetime.strptime(saved_date, "%Y-%m-%d").date()
                    logger.info(f"Progress dosyasından devam ediliyor: {current_date}")
                except:
                    pass

    conn = get_conn()
    
    while current_date >= end_date:
        date_param = current_date.strftime("%d/%m/%Y") # Mackolik format: dd/MM/yyyy
        date_db_format = current_date.strftime("%d.%m.%Y")
        
        logger.info(f"[{date_param}] için Mackolik arşivi çekiliyor...")
        
        try:
            url = f"https://vd.mackolik.com/livedata?date={date_param}"
            r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
            r.raise_for_status()
            data = r.json()
            matches = data.get("m", [])
            
            inserted = 0
            
            for x in matches:
                if len(x) < 37:
                    continue
                    
                # İddaa oran kontrolü (Sadece iddaa da yayınlananlar)
                oran_1 = x[18]
                if not oran_1 or oran_1 == "0.00" or str(oran_1).strip() == "0":
                    continue
                    
                kaynak_id = x[0]
                home = x[2].strip()
                away = x[4].strip()
                
                # Lig Adı
                lig_info = x[36]
                if isinstance(lig_info, list) and len(lig_info) >= 4:
                    ulke = str(lig_info[1]).strip()
                    lig_ismi = str(lig_info[3]).strip()
                    lig = f"{ulke} {lig_ismi}".strip()
                else:
                    lig = "Bilinmeyen Lig"
                    
                saat = str(x[16]) if x[16] else "00:00"
                
                # Skorlar
                devre_skoru = str(x[7]).replace("-", ":") if x[7] else None
                mac_skoru = "?:?"
                
                status = str(x[6])
                if status == "MS" or status == "Uzt" or status == "Pen":
                    ev_skor = x[12]
                    dep_skor = x[13]
                    if str(ev_skor).isdigit() and str(dep_skor).isdigit():
                        mac_skoru = f"{ev_skor}:{dep_skor}"
                    elif status == "MS" and x[7]:
                        # Bazen ev_skor ve dep_skor 0 kalıyor ama maç MS ise x[7] içinde maç sonucu yazabiliyor, veya 0:0 yazıyor. Mackolik json yapısına göre 12 ve 13 ft score.
                        # Eğer ev_skor yoksa ama MS ise "?:?" kalsın.
                        pass
                        
                # Oranlar
                def safe_float(v):
                    try:
                        return float(v)
                    except:
                        return None
                        
                o1 = safe_float(x[18])
                ox = safe_float(x[19])
                o2 = safe_float(x[20])
                alt = safe_float(x[21])
                ust = safe_float(x[22])
                
                record = {
                    "tarih": date_db_format,
                    "saat": saat,
                    "lig": lig,
                    "ev_sahibi": home,
                    "deplasman": away,
                    "devre_skoru": devre_skoru,
                    "mac_skoru": mac_skoru,
                    "onceki_skorlar": None,
                    "kart_ev": None, "kart_dep": None, "kirmizi_kart": None,
                    "korner_ev": None, "korner_dep": None,
                    "lig_sira_ev": None, "lig_sira_dep": None,
                    "toplam_takim": None, "im_6": None,
                    "oran_1": o1, "oran_x": ox, "oran_2": o2,
                    "alt_orani": alt, "ust_orani": ust,
                    "kg_var": None, "kg_yok": None,
                    "ort_min": None, "ort_max": None,
                    "oran_1_acilis": o1, "oran_x_acilis": ox, "oran_2_acilis": o2,
                    "alt_orani_acilis": alt, "ust_orani_acilis": ust,
                    "kg_var_acilis": None, "kg_yok_acilis": None,
                    "alt_orani_35": None, "ust_orani_35": None,
                    "alt_orani_35_acilis": None, "ust_orani_35_acilis": None,
                    "iy_alt_orani_15": None, "iy_ust_orani_15": None,
                    "iy_alt_orani_15_acilis": None, "iy_ust_orani_15_acilis": None,
                    "iy_alt_orani_05": None, "iy_ust_orani_05": None,
                    "iy_alt_orani_05_acilis": None, "iy_ust_orani_05_acilis": None,
                    "kaynak": "mackolik",
                    "kaynak_id": kaynak_id,
                    "sofascore_event_id": kaynak_id,
                    "kita": None, "lig_seviyesi": None,
                    "teknik_direktor_ev": None, "teknik_direktor_dep": None,
                    "hakem": None, "stadyum": None
                }
                
                if upsert_match(record, conn):
                    inserted += 1
                    
            conn.commit()
            logger.info(f"[{date_param}] Tamamlandı. {inserted} maç (İddaa) veritabanına eklendi/güncellendi.")
            
            # Başarılı olduğunda progress dosyasını 1 gün geriye al
            current_date -= datetime.timedelta(days=1)
            with open(progress_file, "w") as f:
                f.write(current_date.strftime("%Y-%m-%d"))
                
            # Rate limit - Her gün için 10 saniye bekle
            time.sleep(10)
            
        except Exception as e:
            logger.error(f"[{date_param}] Çekilirken hata oluştu: {e}. 30 saniye sonra tekrar denenecek...")
            time.sleep(30)
            
    conn.close()
    logger.info("TÜM GEÇMİŞ VERİ ÇEKİMİ (2021'e KADAR) TAMAMLANDI!")

if __name__ == "__main__":
    run_importer()

