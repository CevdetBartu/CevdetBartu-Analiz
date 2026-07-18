import sys
sys.stdout.reconfigure(encoding='utf-8')

from curl_cffi import requests

tournaments = {
    "7": "Champions League",
    "670": "Europa League",
    "17015": "Conference League",
}

date = "2026-07-16"
for tid, name in tournaments.items():
    url = f"https://api.sofascore.com/api/v1/unique-tournament/{tid}/scheduled-events/{date}"
    r = requests.get(url, impersonate="chrome")
    print(f"Tournament: {name} (ID: {tid}) | Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        events = data.get("events", [])
        print(f"  Found {len(events)} events!")
        for ev in events[:5]:
            home = ev.get('homeTeam', {}).get('name')
            away = ev.get('awayTeam', {}).get('name')
            print(f"    - {home} vs {away}")
