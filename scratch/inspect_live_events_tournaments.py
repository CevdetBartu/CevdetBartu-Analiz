from curl_cffi import requests

url = "https://api.sofascore.com/api/v1/sport/football/events/live"
r = requests.get(url, impersonate="chrome")
if r.status_code == 200:
    events = r.json().get("events", [])
    print("Live Events Count:", len(events))
    tournaments = {}
    for ev in events:
        t = ev.get("tournament", {})
        category = t.get("category", {}).get("name", "")
        tname = t.get("name", "")
        fullname = f"{category} - {tname}"
        tournaments[fullname] = tournaments.get(fullname, 0) + 1
    
    print("\nTournaments in Live Events:")
    for t, count in tournaments.items():
        print(f"- {t} ({count} matches)")
else:
    print("Failed to fetch live events:", r.status_code)
