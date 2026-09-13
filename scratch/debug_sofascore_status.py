from curl_cffi import requests
import json

url = "https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-07-24"
resp = requests.get(
    url,
    impersonate="chrome",
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://www.sofascore.com/",
        "Origin": "https://www.sofascore.com",
        "Accept": "*/*",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    }
)
print("Status Code:", resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    events = data.get("events", [])
    print(f"Events count: {len(events)}")
    for e in events[:5]:
        print(e.get("tournament", {}).get("name"), "-", e.get("homeTeam", {}).get("name"), "vs", e.get("awayTeam", {}).get("name"))
else:
    print("Response text:", resp.text[:200])
