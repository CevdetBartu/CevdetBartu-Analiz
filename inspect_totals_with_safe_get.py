import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts", "scraper"))
from sessions import safe_get

events_data = safe_get("https://api.sofascore.com/api/v1/sport/football/events/live")
if events_data:
    events = events_data.get("events", [])
    print(f"Found {len(events)} live events.")
    for ev in events[:5]:
        eid = ev.get("id")
        home = ev.get("homeTeam", {}).get("name")
        away = ev.get("awayTeam", {}).get("name")
        print(f"\n--- Event ID {eid}: {home} vs {away} ---")
        
        odds_data = safe_get(f"https://api.sofascore.com/api/v1/event/{eid}/odds/providers")
        if odds_data:
            providers = odds_data.get("providers", [])
            print(f"Providers count: {len(providers)}")
            for p in providers:
                p_name = p.get("provider", {}).get("name")
                for m in p.get("markets", []):
                    m_name = m.get("marketName") or m.get("marketGroup")
                    is_live = m.get("isLive", False)
                    choices = m.get("choices", [])
                    if "over" in str(m_name).lower() or "total" in str(m_name).lower() or "goal" in str(m_name).lower():
                        print(f"  Provider: {p_name} | Market: {m_name} (isLive={is_live})")
                        for c in choices:
                            frac = c.get("fractionalValue") or c.get("initialFractionalValue")
                            print(f"    Choice: name='{c.get('name')}', choiceName='{c.get('choiceName')}', val='{frac}'")
