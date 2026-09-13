import sqlite3
import datetime
import urllib.request
import bs4
import time
import logging
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import get_conn

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def clean_team_name(name):
    tr_map = {"ı": "i", "ş": "s", "ğ": "g", "ü": "u", "ö": "o", "ç": "c", 
              "İ": "I", "Ş": "S", "Ğ": "G", "Ü": "U", "Ö": "O", "Ç": "C"}
    for k, v in tr_map.items():
        name = name.replace(k, v)
    return name.lower().strip()

def jaccard_similarity(s1, s2):
    set1 = set(s1.split())
    set2 = set(s2.split())
    if not set1 or not set2: return 0.0
    return len(set1.intersection(set2)) / len(set1.union(set2))

def fetch_finished_matches(d_param):
    req = urllib.request.Request(f"https://m.flashscore.com.tr/?d={d_param}", headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(req).read().decode("utf-8")
    soup = bs4.BeautifulSoup(html, "html.parser")
    
    matches = []
    for a_tag in soup.find_all("a", class_="fin"):
        score = a_tag.text.strip()
        if "Ert" in score or "ipt" in score.lower():
            continue
            
        parent = a_tag.parent
        text_nodes = [n for n in parent.children if isinstance(n, str)]
        if text_nodes:
            match_str = "".join(text_nodes).strip()
            if " - " in match_str:
                teams = match_str.split(" - ", 1)
                matches.append({
                    "home": clean_team_name(teams[0]),
                    "away": clean_team_name(teams[1]),
                    "score": score
                })
    return matches

def run_nightly_update():
    logger.info("Gece Maç Skorları Arşivleyicisi Başladı (Fallback to TR Mobile).")
    conn = get_conn()
    c = conn.cursor()
    
    now = datetime.datetime.now()
    yesterday_str = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    today_str = now.strftime("%Y-%m-%d")
    
    for day_param, t_str in [("-1", yesterday_str), ("0", today_str)]:
        try:
            matches = fetch_finished_matches(day_param)
            logger.info(f"{t_str} için {len(matches)} bitmiş maç skoru bulundu.")
            
            c.execute("SELECT id, ev_sahibi, deplasman FROM gecmis_maclar WHERE tarih = ?", (t_str,))
            db_matches = c.fetchall()
            
            updated = 0
            for row in db_matches:
                mid, db_home, db_away = row
                db_home_c = clean_team_name(db_home)
                db_away_c = clean_team_name(db_away)
                
                best_match = None
                best_sim = 0.0
                for m in matches:
                    sim_h = jaccard_similarity(db_home_c, m["home"])
                    sim_a = jaccard_similarity(db_away_c, m["away"])
                    avg_sim = (sim_h + sim_a) / 2
                    if avg_sim > best_sim and avg_sim > 0.4:
                        best_sim = avg_sim
                        best_match = m
                        
                if best_match:
                    score_str = best_match["score"]
                    if " " in score_str:
                        score_str = score_str.split(" ")[0]
                    score_str = score_str.replace("-", ":")
                    
                    c.execute("UPDATE gecmis_maclar SET mac_skoru = ? WHERE id = ?", (score_str, mid))
                    updated += 1
            
            conn.commit()
            logger.info(f"{t_str} tarihi için veritabanında {updated} maçın skoru güncellendi.")
        except Exception as e:
            logger.error(f"Hata: {e}")
            
    conn.close()
    logger.info("Gece güncellemesi tamamlandı.")

if __name__ == "__main__":
    run_nightly_update()

