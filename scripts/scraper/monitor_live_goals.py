import time
import json
import os
import sys

# Çalışma dizinini scraper klasörüne göre ayarla
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sources.live_matches import get_live_matches_data

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_goal_monitoring_log.json")

print("Canlı gol izleme motoru başlatıldı...")

# Maç durum hafızası: {match_id: {"score_h": X, "score_a": Y, "history": [...]}}
match_states = {}

while True:
    try:
        matches = get_live_matches_data()
        now = int(time.time())
        
        for m in matches:
            mid = m["id"]
            sh = m["score_h"]
            sa = m["score_a"]
            
            if mid not in match_states:
                match_states[mid] = {
                    "homeTeam": m["homeTeam"],
                    "awayTeam": m["awayTeam"],
                    "league": m["league"],
                    "score_h": sh,
                    "score_a": sa,
                    "history": []
                }
            
            state = match_states[mid]
            
            # Gol atıldı mı kontrol et
            goal_scored = False
            scoring_team = None
            
            if sh > state["score_h"]:
                goal_scored = True
                scoring_team = "home"
                print(f"GOL! {m['homeTeam']} gol attı. Yeni Skor: {sh}-{sa}")
            elif sa > state["score_a"]:
                goal_scored = True
                scoring_team = "away"
                print(f"GOL! {m['awayTeam']} gol attı. Yeni Skor: {sh}-{sa}")
                
            # Eğer gol atıldıysa ve geçmiş veri varsa, golden önceki son 10 dakikalık durum geçmişini günlük dosyasına yaz
            if goal_scored and state["history"]:
                log_entry = {
                    "goal_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
                    "match_id": mid,
                    "homeTeam": m["homeTeam"],
                    "awayTeam": m["awayTeam"],
                    "league": m["league"],
                    "minute": m["minute"],
                    "new_score": f"{sh}-{sa}",
                    "scoring_team": scoring_team,
                    "pre_goal_state": state["history"][-1], # Son anlık durum
                    "pre_goal_history": state["history"]    # Golden önceki son 10 dakikalık trend (20 adet 30sn'lik kayıt)
                }
                
                # Günlük dosyasına ekle
                logs = []
                if os.path.exists(LOG_FILE):
                    try:
                        with open(LOG_FILE, "r", encoding="utf-8") as f:
                            logs = json.load(f)
                    except Exception:
                        pass
                logs.append(log_entry)
                with open(LOG_FILE, "w", encoding="utf-8") as f:
                    json.dump(logs, f, indent=2, ensure_ascii=False)
                    
            # Durumu güncelle
            state["score_h"] = sh
            state["score_a"] = sa
            
            # Anlık verileri geçmişe ekle (Son 10 dakikalık geçmiş için 20 kayıt tutuyoruz)
            state["history"].append({
                "timestamp": now,
                "minute": m["minute"],
                "pressure": m["pressure"],
                "status_color": m["status_color"],
                "stats": m["stats"]
            })
            state["history"] = state["history"][-20:]
            
        # Tamamlanan veya canlı listesinden çıkan maçları temizle
        active_ids = {m["id"] for m in matches}
        for key in list(match_states.keys()):
            if key not in active_ids:
                del match_states[key]
                
    except Exception as e:
        print(f"İzleme döngüsünde hata: {e}")
        
    time.sleep(30) # Her 30 saniyede bir kontrol et
