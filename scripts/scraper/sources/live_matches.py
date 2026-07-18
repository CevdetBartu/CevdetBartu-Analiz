import logging
import sys
import os
import time
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sessions import safe_get
from config import SOFASCORE_TOURNAMENTS

logger = logging.getLogger("scraper.live_matches")

SYSTEM_TOURNAMENT_IDS = set(SOFASCORE_TOURNAMENTS.values())

def frac_to_dec(frac_str):
    if not frac_str:
        return None
    try:
        if "/" in frac_str:
            p1, p2 = frac_str.split("/")
            return round(float(p1) / float(p2) + 1.0, 2)
        return round(float(frac_str) + 1.0, 2)
    except Exception:
        return None

def fetch_match_details(event):
    eid = event.get("id")
    home_name = event.get("homeTeam", {}).get("name")
    away_name = event.get("awayTeam", {}).get("name")
    
    # Calculate live minute
    status_time = event.get("statusTime", {})
    timestamp = status_time.get("timestamp")
    initial = status_time.get("initial", 0)
    
    current_timestamp = int(time.time())
    
    if timestamp:
        elapsed_seconds = current_timestamp - timestamp
        minute = int((elapsed_seconds + initial) / 60)
        max_seconds = status_time.get("max", 5400)
        max_minutes = int(max_seconds / 60)
        minute = min(minute, max_minutes)
        # Prevent minute being negative or 0
        minute = max(1, minute)
    else:
        minute = 45 # Default fallback
        
    # 1. Fetch statistics
    stats_url = f"https://api.sofascore.com/api/v1/event/{eid}/statistics"
    stats_data = safe_get(stats_url, is_sub=True) or {}
    
    # 2. Fetch odds
    odds_url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/1/all"
    odds_data = safe_get(odds_url, is_sub=True) or {}
    
    # Process Statistics
    stats_map = {
        "possession_h": 50, "possession_a": 50,
        "shots_target_h": 0, "shots_target_a": 0,
        "shots_off_h": 0, "shots_off_a": 0,
        "corners_h": 0, "corners_a": 0,
        "yellow_h": 0, "yellow_a": 0,
        "red_h": 0, "red_a": 0,
        "fouls_h": 0, "fouls_a": 0,
        "touches_in_box_h": 0, "touches_in_box_a": 0,
        "final_third_h": 0, "final_third_a": 0,
        "big_chances_h": 0, "big_chances_a": 0,
        "saves_h": 0, "saves_a": 0,
        "blocked_shots_h": 0, "blocked_shots_a": 0
    }
    
    # Try parsing period ALL stats
    for p in stats_data.get("statistics", []):
        if p.get("period") == "ALL":
            for g in p.get("groups", []):
                for item in g.get("statisticsItems", []):
                    key = item.get("key")
                    h_val = item.get("homeValue", 0)
                    a_val = item.get("awayValue", 0)
                    
                    if key == "ballPossession":
                        stats_map["possession_h"] = h_val
                        stats_map["possession_a"] = a_val
                    elif key == "shotsOnGoal":
                        stats_map["shots_target_h"] = h_val
                        stats_map["shots_target_a"] = a_val
                    elif key == "totalShotsOnGoal":
                        stats_map["shots_total_h"] = h_val
                        stats_map["shots_total_a"] = a_val
                    elif key == "cornerKicks":
                        stats_map["corners_h"] = h_val
                        stats_map["corners_a"] = a_val
                    elif key == "yellowCards":
                        stats_map["yellow_h"] = h_val
                        stats_map["yellow_a"] = a_val
                    elif key == "redCards":
                        stats_map["red_h"] = h_val
                        stats_map["red_a"] = a_val
                    elif key == "fouls":
                        stats_map["fouls_h"] = h_val
                        stats_map["fouls_a"] = a_val
                    elif key == "touchesInOppBox":
                        stats_map["touches_in_box_h"] = h_val
                        stats_map["touches_in_box_a"] = a_val
                    elif key == "finalThirdEntries":
                        stats_map["final_third_h"] = h_val
                        stats_map["final_third_a"] = a_val
                    elif key == "bigChanceCreated":
                        stats_map["big_chances_h"] = h_val
                        stats_map["big_chances_a"] = a_val
                    elif key == "goalkeeperSaves":
                        stats_map["saves_h"] = h_val
                        stats_map["saves_a"] = a_val
                    elif key == "blockedScoringAttempt":
                        stats_map["blocked_shots_h"] = h_val
                        stats_map["blocked_shots_a"] = a_val

    # Post process shots off target
    stats_map["shots_off_h"] = max(0, stats_map.get("shots_total_h", 0) - stats_map["shots_target_h"])
    stats_map["shots_off_a"] = max(0, stats_map.get("shots_total_a", 0) - stats_map["shots_target_a"])
    
    # Calculate Live Pressure Index (LPI)
    pressure_h = (stats_map["shots_target_h"] * 10) + (stats_map["shots_off_h"] * 5) + (stats_map["corners_h"] * 3)
    pressure_a = (stats_map["shots_target_a"] * 10) + (stats_map["shots_off_a"] * 5) + (stats_map["corners_a"] * 3)
    
    total_pressure = pressure_h + pressure_a
    if total_pressure > 0:
        rel_h = round((pressure_h / total_pressure) * 100)
        rel_a = 100 - rel_h
    else:
        rel_h, rel_a = 50, 50
        
    tempo = min(100, round((total_pressure / minute) * 35))
    
    # Calculate Team Game Index (TGI) activity per minute
    # tgi = (shots_on_target * 15) + (shots_off_target * 6) + (corners * 5) + (touches_in_box * 3) + (final_third_entries * 1.5)
    tgi_h = (stats_map["shots_target_h"] * 15) + (stats_map["shots_off_h"] * 6) + (stats_map["corners_h"] * 5) + (stats_map["touches_in_box_h"] * 3) + (stats_map["final_third_h"] * 1.5)
    tgi_a = (stats_map["shots_target_a"] * 15) + (stats_map["shots_off_a"] * 6) + (stats_map["corners_a"] * 5) + (stats_map["touches_in_box_a"] * 3) + (stats_map["final_third_a"] * 1.5)
    
    act_h = tgi_h / minute
    act_a = tgi_a / minute
    
    def get_color_status(act):
        if act >= 4.0:
            return "green"
        if act >= 2.5:
            return "blue"
        if act >= 1.2:
            return "yellow"
        return "grey"
        
    status_color_h = get_color_status(act_h)
    status_color_a = get_color_status(act_a)
    
    # Process Odds
    pre_match_odds = {"1": None, "X": None, "2": None}
    markets = odds_data.get("markets", [])
    
    # Priority 1: Market with isLive: false (pre-match odds)
    pre_market = None
    for m in markets:
        if m.get("marketGroup") == "1X2" and not m.get("isLive", True):
            pre_market = m
            break
            
    # Priority 2: Fallback to market with isLive: true (but use initialFractionalValue)
    if not pre_market:
        for m in markets:
            if m.get("marketGroup") == "1X2":
                pre_market = m
                break
                
    if pre_market:
        choices = pre_market.get("choices", [])
        is_live_market = pre_market.get("isLive", False)
        
        for choice in choices:
            name = choice.get("name")
            if name in pre_match_odds:
                frac = choice.get("initialFractionalValue") if is_live_market else (choice.get("fractionalValue") or choice.get("initialFractionalValue"))
                dec = frac_to_dec(frac)
                if dec:
                    pre_match_odds[name] = dec

    # Build final details object
    return {
        "id": eid,
        "homeTeam": home_name,
        "awayTeam": away_name,
        "league": event.get("tournament", {}).get("name", ""),
        "country": event.get("tournament", {}).get("category", {}).get("name", ""),
        "score_h": event.get("homeScore", {}).get("current", 0),
        "score_a": event.get("awayScore", {}).get("current", 0),
        "score_ht_h": event.get("homeScore", {}).get("period1", 0),
        "score_ht_a": event.get("awayScore", {}).get("period1", 0),
        "minute": minute,
        "status": event.get("status", {}).get("type", "inprogress"),
        "status_description": event.get("status", {}).get("description", ""),
        "stats": stats_map,
        "pressure": {
            "home": rel_h,
            "away": rel_a,
            "tempo": tempo
        },
        "status_color": {
            "home": status_color_h,
            "away": status_color_a
        },
        "pre_match_odds": pre_match_odds
    }

def get_live_matches_data():
    url = "https://api.sofascore.com/api/v1/sport/football/events/live"
    try:
        data = safe_get(url)
        if not data:
            return []
            
        events = data.get("events", [])
        if not events:
            return []
            
        # Sadece sistemimizdeki popüler liglere ait ve oynanmakta olan maçları filtrele
        live_events = [
            ev for ev in events 
            if ev.get("status", {}).get("type", "") == "inprogress"
            and ev.get("tournament", {}).get("uniqueTournament", {}).get("id") in SYSTEM_TOURNAMENT_IDS
        ]
        
        # Limit details queries
        live_events = live_events[:30]
        
        results = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_event = {
                executor.submit(fetch_match_details, ev): ev 
                for ev in live_events
            }
            for future in future_to_event:
                try:
                    res = future.result()
                    if res:
                        results.append(res)
                except Exception as e:
                    logger.error(f"Error fetching match details: {e}")
                    
        return results
    except Exception as e:
        logger.error(f"Error in get_live_matches_data: {e}")
        return []
