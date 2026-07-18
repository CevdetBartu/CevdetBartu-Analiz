import os
import sys
import logging
import time
import random
import datetime
from typing import Optional

# Add the scraper folder to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import get_conn, upsert_match
from sessions import safe_get
from sources.today_matches import (
    get_all_event_odds,
    parse_all_odds,
    get_event_corners,
    _calc_avg_odds
)
from sources.sofascore import get_event_incidents, parse_cards

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

_BASE = "https://api.sofascore.com/api/v1"

TOURNAMENTS = {
    "Sırbistan SuperLiga": 210,
    "Sırbistan Prva Liga": 721,
    "Bulgaristan Parva Liga": 247,
    "Bulgaristan Vtora Liga": 1135,
    "Romanya Liga 1": 152,
    "Romanya Liga 2": 562,
    "Litvanya A Lyga": 198,
    "Estonya Premium Liiga": 178,
    "Letonya Virsliga": 197,
    "Çekya 1. Ligi": 172,
    "Macaristan NB I": 816,
    "Slovakya Niké Liga": 211,
    "Slovenya PrvaLiga": 212,
    "Ukrayna Premier Ligi": 218,
    "Azerbaycan Premier Ligi": 709,
    "Kazakistan Premier Ligi": 682,
    "İsrail Premier Ligi": 266,
    "Kıbrıs Rum Kesimi 1. Ligi": 171,
    "Mısır Premier Ligi": 808,
    "Fas Botola Pro": 937,
    "İran Persian Gulf Pro League": 915,
    "İrlanda Premier Division": 192,
    "Kuzey İrlanda NIFL Premiership": 200,
    "Galler Cymru Premier": 254,
    "Güney Afrika Premier Division": 358,
    "Olimpiyat Oyunları": 436,
    "UEFA Nations League": 10783,
    "Dünya Kupası Elemeleri (UEFA)": 11,
    "Dünya Kupası Elemeleri (CONMEBOL)": 295,
    "Dünya Kupası Elemeleri (CAF)": 13,
    "Dünya Kupası Elemeleri (AFC)": 308,
    "Dünya Kupası Elemeleri (CONCACAF)": 14,
    "Singapur Premier League": 634,
    "Malezya Süper Ligi": 1000,
    "Katar Yıldızlar Ligi": 825,
    "BAE Pro Ligi": 971,
    "Tayland 1. Ligi": 1032
}

SEASONS_BACK = 3  # Last 3 seasons for compact and fast scraping

def import_sofascore_football():
    logger.info("SofaScore Futbol geçmiş veri aktarımı başlatılıyor...")
    conn = get_conn()
    
    try:
        for name, tid in TOURNAMENTS.items():
            logger.info(f"→ {name} ({tid}) taranıyor...")
            
            # 1. Sezonları getir
            url_seasons = f"{_BASE}/unique-tournament/{tid}/seasons"
            data_seasons = safe_get(url_seasons)
            if not data_seasons:
                logger.warning(f"Sezon bilgisi alınamadı: {name}")
                continue
                
            seasons = data_seasons.get("seasons", [])
            target_seasons = seasons[:SEASONS_BACK]
            
            for season in target_seasons:
                sid = season.get("id")
                sname = season.get("name")
                
                page = 0
                has_next = True
                
                while has_next:
                    current_task = f"{name} {sname} (Sayfa {page + 1})"
                    logger.info(f"Taranıyor: {current_task}")
                    
                    url_events = f"{_BASE}/unique-tournament/{tid}/season/{sid}/events/last/{page}"
                    events_data = safe_get(url_events)
                    if not events_data:
                        logger.warning(f"Etkinlikler alınamadı: {current_task}")
                        break
                        
                    events = events_data.get("events", [])
                    if not events:
                        break
                        
                    added = 0
                    skipped = 0
                    for event in events:
                        eid = event.get("id")
                        if not eid:
                            continue
                            
                        status_type = event.get("status", {}).get("type", "")
                        if status_type != "finished":
                            continue
                            
                        home = event.get("homeTeam", {}).get("name", "").strip()
                        away = event.get("awayTeam", {}).get("name", "").strip()
                        
                        ts = event.get("startTimestamp", 0)
                        dt = datetime.datetime.utcfromtimestamp(ts) + datetime.timedelta(hours=3)
                        tarih = dt.strftime("%d.%m.%Y")
                        saat = dt.strftime("%H:%M")
                        
                        # Oranları çek
                        try:
                            markets_data = get_all_event_odds(eid)
                            o1x2_closing, o1x2_opening, ou_closing, ou_opening, btts_closing, btts_opening = parse_all_odds(markets_data)
                        except Exception as e:
                            logger.warning(f"Oran çekme hatası (ID: {eid}): {e}")
                            continue
                            
                        oran_1 = o1x2_closing.get("oran_1")
                        oran_x = o1x2_closing.get("oran_x")
                        oran_2 = o1x2_closing.get("oran_2")
                        ort_min, ort_max = _calc_avg_odds(oran_1, oran_x, oran_2)
                        
                        # Skorlar
                        ft_h = event.get("homeScore", {}).get("current")
                        ft_a = event.get("awayScore", {}).get("current")
                        mac_skoru = f"{ft_h}:{ft_a}" if ft_h is not None and ft_a is not None else "?:?"
                        
                        ht_h = event.get("homeScore", {}).get("period1")
                        ht_a = event.get("awayScore", {}).get("period1")
                        devre_skoru = f"{ht_h}:{ht_a}" if ht_h is not None and ht_a is not None else None
                        
                        # Kartlar
                        kart_ev = None
                        kart_dep = None
                        kirmizi_kart = 0
                        try:
                            incidents = get_event_incidents(eid)
                            card_data = parse_cards(incidents)
                            kart_ev = card_data.get("kart_ev")
                            kart_dep = card_data.get("kart_dep")
                            kirmizi_kart = card_data.get("kirmizi_kart", 0)
                        except Exception:
                            pass
                            
                        # Kornerler
                        korner_ev, korner_dep = None, None
                        try:
                            korner_ev, korner_dep = get_event_corners(eid)
                        except Exception:
                            pass
                            
                        # i/m 6+
                        im_6 = None
                        if ft_h is not None and ft_a is not None:
                            toplam_gol = ft_h + ft_a
                            if toplam_gol > 6:
                                im_6 = "2/1" if ft_h < ft_a else ("1/1" if ft_h > ft_a else "x/x")
                                
                        row = {
                            "tarih":            tarih,
                            "saat":             saat,
                            "lig":              name,
                            "ev_sahibi":        home,
                            "deplasman":        away,
                            "devre_skoru":      devre_skoru,
                            "mac_skoru":        mac_skoru,
                            "onceki_skorlar":   None,
                            "kart_ev":          kart_ev,
                            "kart_dep":         kart_dep,
                            "kirmizi_kart":     kirmizi_kart,
                            "korner_ev":        korner_ev,
                            "korner_dep":       korner_dep,
                            "lig_sira_ev":      None,
                            "lig_sira_dep":     None,
                            "toplam_takim":     20,
                            "im_6":             im_6,
                            "oran_1":           oran_1,
                            "oran_x":           oran_x,
                            "oran_2":           oran_2,
                            "alt_orani":        ou_closing.get("alt_orani"),
                            "ust_orani":        ou_closing.get("ust_orani"),
                            "kg_var":           btts_closing.get("kg_var"),
                            "kg_yok":           btts_closing.get("kg_yok"),
                            "ort_min":          ort_min,
                            "ort_max":          ort_max,
                            "oran_1_acilis":    o1x2_opening.get("oran_1_acilis"),
                            "oran_x_acilis":    o1x2_opening.get("oran_x_acilis"),
                            "oran_2_acilis":    o1x2_opening.get("oran_2_acilis"),
                            "alt_orani_acilis": ou_opening.get("alt_orani_acilis"),
                            "ust_orani_acilis": ou_opening.get("ust_orani_acilis"),
                            "kg_var_acilis":    btts_opening.get("kg_var_acilis"),
                            "kg_yok_acilis":    btts_opening.get("kg_yok_acilis"),
                            "kaynak":           "sofascore",
                            "kaynak_id":        eid,
                        }
                        
                        if upsert_match(row, conn):
                            added += 1
                        else:
                            skipped += 1
                            
                    conn.commit()  # Sayfa sonunda commit yaparak veritabanı kilidini serbest bırak
                    logger.info(f"Sayfa tamamlandı: +{added} eklendi, {skipped} atlandı.")
                    
                    has_next = events_data.get("hasNextPage", False)
                    page += 1
                    time.sleep(random.uniform(0.5, 1.2))
                    
        logger.info("SofaScore Futbol geçmiş veri aktarımı başarıyla tamamlandı!")
    finally:
        conn.close()

if __name__ == "__main__":
    import_sofascore_football()
