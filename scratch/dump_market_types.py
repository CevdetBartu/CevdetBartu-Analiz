import sys
import os
import json

curr_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(curr_dir, ".."))
scraper_dir = os.path.join(parent_dir, "scripts", "scraper")
sys.path.append(scraper_dir)

from sessions import safe_get

events_data = safe_get("https://api.sofascore.com/api/v1/sport/football/events/live")
if events_data:
    events = events_data.get("events", [])
    found = 0
    for ev in events:
        eid = ev.get("id")
        home = ev.get("homeTeam", {}).get("name")
        away = ev.get("awayTeam", {}).get("name")
        odds_data = safe_get(f"https://api.sofascore.com/api/v1/event/{eid}/odds/providers")
        if odds_data and odds_data.get("providers"):
            found += 1
            print(f"\n============================================================")
            print(f"EVENT {eid}: {home} vs {away}")
            for p in odds_data.get("providers", []):
                p_name = p.get("provider", {}).get("name")
                for m in p.get("markets", []):
                    m_name = m.get("marketName")
                    m_group = m.get("marketGroup")
                    is_live = m.get("isLive")
                    choices = m.get("choices", [])
                    print(f"  Provider: {p_name} | Market: {m_name} | Group: {m_group} | isLive: {is_live}")
                    for c in choices:
                        frac = c.get("fractionalValue") or c.get("initialFractionalValue")
                        c_name = c.get("name")
                        c_cname = c.get("choiceName")
                        print(f"    - choiceName: '{c_cname}' | name: '{c_name}' | frac: {frac}")
            if found >= 3:
                break
