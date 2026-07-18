from curl_cffi import requests
import datetime

tid = 670  # UEFA Europa League
base_date = datetime.date(2026, 7, 10)
for i in range(21):
    curr_date = base_date + datetime.timedelta(days=i)
    date_str = curr_date.strftime("%Y-%m-%d")
    url = f"https://api.sofascore.com/api/v1/unique-tournament/{tid}/scheduled-events/{date_str}"
    r = requests.get(url, impersonate="chrome")
    if r.status_code == 200:
        events = r.json().get("events", [])
        print(f"Date: {date_str} | Found {len(events)} Europa League matches!")
        for ev in events[:2]:
            print(f"  - {ev.get('homeTeam', {}).get('name')} vs {ev.get('awayTeam', {}).get('name')}")
