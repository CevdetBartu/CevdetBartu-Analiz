import os
import sys
import logging
import time
import datetime
import sqlite3

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_conn, upsert_match
from sessions import safe_get
from sources.today_matches import (
    get_all_event_odds,
    parse_all_odds,
    _calc_avg_odds
)
from config import SOFASCORE_TOURNAMENTS as TOURNAMENTS, DB_PATH

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

_BASE = "https://api.sofascore.com/api/v1"

def sync_all_leagues_continuously():
    logger.info("🔄 Sürekli Veritabanı Senkronizasyon Motoru (Continuous Sync Daemon) başlatıldı.")
    logger.info(f"📋 Toplam {len(TOURNAMENTS)} lig (Şampiyonlar Ligi, Libertadores, Süper Lig vb. hepsi dahil) taranıyor...")

    conn = get_conn()

    while True:
        cycle_start = time.time()
        logger.info(f"\n================ YENİ TARAMA DÖNGÜSÜ BAŞLADI ({datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ================")
        total_cycle_new = 0

        for idx, (name, tid) in enumerate(TOURNAMENTS.items()):
            try:
                # 1. Sezonları al
                url_seasons = f"{_BASE}/unique-tournament/{tid}/seasons"
                data_seasons = safe_get(url_seasons)
                if not data_seasons or "seasons" not in data_seasons:
                    continue
                
                seasons = data_seasons["seasons"][:7] # Son 7 Sezon (2019-2026)

                for season in seasons:
                    sid = season.get("id")
                    sname = season.get("name")

                    # Sayfaları tara (Sayfa 0 - 15)
                    for page in range(15):
                        url_events = f"{_BASE}/unique-tournament/{tid}/season/{sid}/events/last/{page}"
                        events_data = safe_get(url_events)
                        if not events_data or "events" not in events_data:
                            break

                        events = events_data["events"]
                        if not events:
                            break

                        new_added = 0
                        for event in events:
                            if event.get("status", {}).get("type") != "finished":
                                continue
                            
                            eid = event.get("id")
                            home = event.get("homeTeam", {}).get("name", "").strip()
                            away = event.get("awayTeam", {}).get("name", "").strip()
                            
                            ts = event.get("startTimestamp", 0)
                            dt = datetime.datetime.utcfromtimestamp(ts) + datetime.timedelta(hours=3)
                            tarih = dt.strftime("%d.%m.%Y")
                            saat = dt.strftime("%H:%M")

                            # Veritabanında var mı kontrol et (Hızlı atlama)
                            c = conn.cursor()
                            c.execute("SELECT id FROM gecmis_maclar WHERE ev_sahibi = ? AND deplasman = ? AND tarih = ?", (home, away, tarih))
                            if c.fetchone():
                                continue

                            # Yoksa oranları çek ve ekle
                            markets_data = get_all_event_odds(eid)
                            if not markets_data:
                                continue

                            o1x2_closing, o1x2_opening, ou_closing, ou_opening, btts_closing, btts_opening = parse_all_odds(markets_data)
                            oran_1 = o1x2_closing.get("oran_1")
                            if not oran_1:
                                continue

                            ort_min, ort_max = _calc_avg_odds(oran_1, o1x2_closing.get("oran_x"), o1x2_closing.get("oran_2"))

                            ft_h = event.get("homeScore", {}).get("current")
                            ft_a = event.get("awayScore", {}).get("current")
                            mac_skoru = f"{ft_h}:{ft_a}" if ft_h is not None and ft_a is not None else "?:?"

                            ht_h = event.get("homeScore", {}).get("period1")
                            ht_a = event.get("awayScore", {}).get("period1")
                            devre_skoru = f"{ht_h}:{ht_a}" if ht_h is not None and ht_a is not None else None

                            record = {
                                "tarih": tarih, "saat": saat, "lig": name,
                                "ev_sahibi": home, "deplasman": away,
                                "devre_skoru": devre_skoru, "mac_skoru": mac_skoru,
                                "onceki_skorlar": None,
                                "kart_ev": None, "kart_dep": None, "kirmizi_kart": 0,
                                "korner_ev": None, "korner_dep": None,
                                "lig_sira_ev": None, "lig_sira_dep": None, "toplam_takim": 20,
                                "im_6": None,
                                "oran_1": oran_1, "oran_x": o1x2_closing.get("oran_x"), "oran_2": o1x2_closing.get("oran_2"),
                                "alt_orani": ou_closing.get("alt_orani"), "ust_orani": ou_closing.get("ust_orani"),
                                "kg_var": btts_closing.get("kg_var"), "kg_yok": btts_closing.get("kg_yok"),
                                "ort_min": ort_min, "ort_max": ort_max,
                                "oran_1_acilis": o1x2_opening.get("oran_1_acilis"),
                                "oran_x_acilis": o1x2_opening.get("oran_x_acilis"),
                                "oran_2_acilis": o1x2_opening.get("oran_2_acilis"),
                                "alt_orani_acilis": ou_opening.get("alt_orani_acilis"),
                                "ust_orani_acilis": ou_opening.get("ust_orani_acilis"),
                                "kg_var_acilis": btts_opening.get("kg_var_acilis"),
                                "kg_yok_acilis": btts_opening.get("kg_yok_acilis"),
                                "alt_orani_35": None, "ust_orani_35": None,
                                "alt_orani_35_acilis": None, "ust_orani_35_acilis": None,
                                "iy_alt_orani_15": None, "iy_ust_orani_15": None,
                                "iy_alt_orani_15_acilis": None, "iy_ust_orani_15_acilis": None,
                                "iy_alt_orani_05": None, "iy_ust_orani_05": None,
                                "iy_alt_orani_05_acilis": None, "iy_ust_orani_05_acilis": None,
                                "kaynak": "sofascore", "kaynak_id": eid
                            }

                            if upsert_match(record, conn):
                                new_added += 1
                                total_cycle_new += 1

                        if new_added > 0:
                            logger.info(f"✨ [{name} {sname} Sayfa {page+1}] {new_added} eksik maç veritabanına eklendi.")

                        time.sleep(0.1)

            except Exception as e:
                logger.error(f"Hata ({name}): {e}")

        logger.info(f"✅ Döngü tamamlandı. Bu döngüde toplam {total_cycle_new} eksik maç eklendi.")
        logger.info("😴 Bir sonraki tarama döngüsü için 10 dakika bekleniyor...")
        time.sleep(600)

if __name__ == "__main__":
    sync_all_leagues_continuously()
