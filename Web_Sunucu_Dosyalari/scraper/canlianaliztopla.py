import time
import json
import os
import sys

# Çalışma dizinini scraper klasörüne göre ayarla
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sources.live_matches import get_live_matches_data

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "canlianaliztopla_log.json")
ALARMS_LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_alarms_log.json")
CONTROLS_LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_controls_log.json")

print("Canlı gol izleme motoru (canlianaliztopla) başlatıldı...")

# Maç durum hafızası: {match_id: {"score_h": X, "score_a": Y, "history": [...]}}
match_states = {}

def load_json(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_json(filepath, data):
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Hata ({filepath} kaydedilirken): {e}")

while True:
    try:
        matches = get_live_matches_data()
        now = int(time.time())
        
        # ─── 1. ALARMLARI YÜKLE VE GÜNCELLE ──────────────────────────────────
        alarms = load_json(ALARMS_LOG_FILE)
        pending_alarms = [a for a in alarms if a["status"] == "pending"]
        curr_matches_map = {m["id"]: m for m in matches}
        
        for alarm in pending_alarms:
            mid = alarm["match_id"]
            trigger_min = alarm["trigger_minute"]
            trigger_time = alarm["trigger_timestamp"]
            trigger_sh, trigger_sa = map(int, alarm["score_at_trigger"].split("-"))
            trigger_ch, trigger_ca = map(int, alarm["corners_at_trigger"].split("-"))
            team = alarm["team"]
            
            if mid in curr_matches_map:
                m = curr_matches_map[mid]
                curr_min = m["minute"]
                curr_sh = m["score_h"]
                curr_sa = m["score_a"]
                curr_ch = m["stats"].get("corners_h", 0)
                curr_ca = m["stats"].get("corners_a", 0)
                
                # Herhangi bir gol kontrolü
                goals_h = curr_sh - trigger_sh
                goals_a = curr_sa - trigger_sa
                if (goals_h + goals_a) > 0:
                    alarm["outcome_any_goal"] = True
                    # Baskı kuran tarafın golü kontrolü
                    if (team == "home" and goals_h > 0) or (team == "away" and goals_a > 0):
                        alarm["outcome_pressing_goal"] = True
                        
                    # API Gecikme/Geriye dönük güncelleme kontrolü: ilk 60 saniyede gol olduysa bayrak ekle
                    if now - trigger_time <= 60:
                        alarm["api_lag_suspected"] = True
                
                # Herhangi bir korner kontrolü
                corners_h = curr_ch - trigger_ch
                corners_a = curr_ca - trigger_ca
                if (corners_h + corners_a) > 0:
                    alarm["outcome_any_corner"] = True
                    if (team == "home" and corners_h > 0) or (team == "away" and corners_a > 0):
                        alarm["outcome_pressing_corner"] = True
                
                # 15 dakika dolduysa çöz
                if curr_min >= trigger_min + 15:
                    alarm["status"] = "resolved"
                    alarm["resolved_minute"] = curr_min
                    alarm["resolved_time"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
                    # Null kalan değerleri sabitle
                    for key in ["outcome_any_goal", "outcome_pressing_goal", "outcome_any_corner", "outcome_pressing_corner"]:
                        if alarm[key] is None:
                            alarm[key] = False
                    print(f"🔔 Alarm çözüldü (Süre Doldu): {alarm['homeTeam']} vs {alarm['awayTeam']} (Min: {trigger_min}->{curr_min}) AnyGoal: {alarm['outcome_any_goal']}, PressGoal: {alarm['outcome_pressing_goal']}")
            else:
                # Maç bültenden çıktıysa (bitti) son duruma göre çöz
                alarm["status"] = "resolved"
                alarm["resolved_time"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
                for key in ["outcome_any_goal", "outcome_pressing_goal", "outcome_any_corner", "outcome_pressing_corner"]:
                    if alarm[key] is None:
                        alarm[key] = False
                print(f"🔔 Alarm çözüldü (Maç Çıktı): {alarm['homeTeam']} vs {alarm['awayTeam']} (Trigger Min: {trigger_min})")
                
        save_json(ALARMS_LOG_FILE, alarms)
        
        # ─── 2. KONTROLLERİ YÜKLE VE GÜNCELLE ────────────────────────────────
        controls = load_json(CONTROLS_LOG_FILE)
        pending_controls = [c for c in controls if c["status"] == "pending"]
        
        for ctrl in pending_controls:
            mid = ctrl["match_id"]
            trigger_min = ctrl["trigger_minute"]
            trigger_time = ctrl["trigger_timestamp"]
            trigger_sh, trigger_sa = map(int, ctrl["score_at_trigger"].split("-"))
            trigger_ch, trigger_ca = map(int, ctrl["corners_at_trigger"].split("-"))
            
            if mid in curr_matches_map:
                m = curr_matches_map[mid]
                curr_min = m["minute"]
                curr_sh = m["score_h"]
                curr_sa = m["score_a"]
                curr_ch = m["stats"].get("corners_h", 0)
                curr_ca = m["stats"].get("corners_a", 0)
                
                # Gol kontrolü
                goals_h = curr_sh - trigger_sh
                goals_a = curr_sa - trigger_sa
                if (goals_h + goals_a) > 0:
                    ctrl["outcome_any_goal"] = True
                    if now - trigger_time <= 60:
                        ctrl["api_lag_suspected"] = True
                        
                # Korner kontrolü
                corners_h = curr_ch - trigger_ch
                corners_a = curr_ca - trigger_ca
                if (corners_h + corners_a) > 0:
                    ctrl["outcome_any_corner"] = True
                    
                # 15 dakika dolduysa çöz
                if curr_min >= trigger_min + 15:
                    ctrl["status"] = "resolved"
                    ctrl["resolved_minute"] = curr_min
                    ctrl["resolved_time"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
                    if ctrl["outcome_any_goal"] is None:
                        ctrl["outcome_any_goal"] = False
                    if ctrl["outcome_any_corner"] is None:
                        ctrl["outcome_any_corner"] = False
                    print(f"📊 Kontrol çözüldü (Süre Doldu): {ctrl['homeTeam']} vs {ctrl['awayTeam']} (Min: {trigger_min}->{curr_min}) AnyGoal: {ctrl['outcome_any_goal']}")
            else:
                ctrl["status"] = "resolved"
                ctrl["resolved_time"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))
                if ctrl["outcome_any_goal"] is None:
                    ctrl["outcome_any_goal"] = False
                if ctrl["outcome_any_corner"] is None:
                    ctrl["outcome_any_corner"] = False
                print(f"📊 Kontrol çözüldü (Maç Çıktı): {ctrl['homeTeam']} vs {ctrl['awayTeam']} (Trigger Min: {trigger_min})")
                
        save_json(CONTROLS_LOG_FILE, controls)
        
        # ─── 3. YENİ ALARM & KONTROLLERİ TETİKLE ─────────────────────────────
        for m in matches:
            mid = m["id"]
            sh = m["score_h"]
            sa = m["score_a"]
            ch = m["stats"].get("corners_h", 0)
            ca = m["stats"].get("corners_a", 0)
            minute = m["minute"]
            score_diff = abs(sh - sa)
            
            # Gol kontrolü ve retrospective geçmiş günlüğü (eski canlianaliztopla mantığı)
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
                
            if goal_scored and state["history"]:
                log_entry = {
                    "goal_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
                    "match_id": mid,
                    "homeTeam": m["homeTeam"],
                    "awayTeam": m["awayTeam"],
                    "league": m["league"],
                    "minute": minute,
                    "new_score": f"{sh}-{sa}",
                    "scoring_team": scoring_team,
                    "pre_goal_state": state["history"][-1],
                    "pre_goal_history": state["history"]
                }
                
                logs = load_json(LOG_FILE)
                logs.append(log_entry)
                save_json(LOG_FILE, logs)
                    
            state["score_h"] = sh
            state["score_a"] = sa
            
            state["history"].append({
                "timestamp": now,
                "minute": minute,
                "pressure": m["pressure"],
                "status_color": m["status_color"],
                "stats": m["stats"]
            })
            state["history"] = state["history"][-20:]
            
            # Bağlamsal Koşullar: 15-85 dakika arası VE skor farkı < 2
            is_context_valid = (minute >= 15 and minute <= 85) and (score_diff < 2)
            if not is_context_valid:
                continue
                
            # Alarm Tetikleme Kontrolü
            colors = m["status_color"]
            alarm_triggered_this_poll = False
            
            for team_side in ["home", "away"]:
                if colors.get(team_side) == "green":
                    recent_trigger = False
                    for alarm in alarms:
                        if alarm["match_id"] == mid and alarm["team"] == team_side:
                            if alarm["status"] == "pending" or (minute < alarm["trigger_minute"] + 15):
                                recent_trigger = True
                                break
                    
                    if not recent_trigger:
                        new_alarm = {
                            "alarm_id": f"{mid}_{minute}_{team_side}",
                            "match_id": mid,
                            "homeTeam": m["homeTeam"],
                            "awayTeam": m["awayTeam"],
                            "league": m["league"],
                            "team": team_side,
                            "trigger_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
                            "trigger_timestamp": now,
                            "trigger_minute": minute,
                            "score_at_trigger": f"{sh}-{sa}",
                            "corners_at_trigger": f"{ch}-{ca}",
                            "status": "pending",
                            "outcome_any_goal": None,
                            "outcome_pressing_goal": None,
                            "outcome_any_corner": None,
                            "outcome_pressing_corner": None,
                            "api_lag_suspected": False
                        }
                        alarms.append(new_alarm)
                        alarm_triggered_this_poll = True
                        print(f"🚨 YENİ ALARM TETİKLENDİ: {m['homeTeam']} vs {m['awayTeam']} - Taraf: {team_side} (Min: {minute})")
            
            # Kontrol Grubu Tetikleme Kontrolü (Alarm Çalmayan Durumlar)
            if not alarm_triggered_this_poll:
                # Eşleşen bir yeşil alarm zaten yoksa ve aktif alarm veya kontrol penceresi bulunmuyorsa ekle
                recent_control = False
                for ctrl in controls:
                    if ctrl["match_id"] == mid:
                        if ctrl["status"] == "pending" or (minute < ctrl["trigger_minute"] + 15):
                            recent_control = True
                            break
                            
                for alarm in alarms:
                    if alarm["match_id"] == mid and alarm["status"] == "pending":
                        recent_control = True
                        break
                        
                if not recent_control:
                    new_ctrl = {
                        "control_id": f"{mid}_{minute}_ctrl",
                        "match_id": mid,
                        "homeTeam": m["homeTeam"],
                        "awayTeam": m["awayTeam"],
                        "league": m["league"],
                        "trigger_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
                        "trigger_timestamp": now,
                        "trigger_minute": minute,
                        "score_at_trigger": f"{sh}-{sa}",
                        "corners_at_trigger": f"{ch}-{ca}",
                        "status": "pending",
                        "outcome_any_goal": None,
                        "outcome_any_corner": None,
                        "api_lag_suspected": False
                    }
                    controls.append(new_ctrl)
                    print(f"📊 YENİ KONTROL PENCERESİ AÇILDI: {m['homeTeam']} vs {m['awayTeam']} (Min: {minute})")
                    
        save_json(ALARMS_LOG_FILE, alarms)
        save_json(CONTROLS_LOG_FILE, controls)
        
        # Temizle
        active_ids = {m["id"] for m in matches}
        for key in list(match_states.keys()):
            if key not in active_ids:
                del match_states[key]
                
    except Exception as e:
        print(f"İzleme döngüsünde hata: {e}")
        
    time.sleep(30)
