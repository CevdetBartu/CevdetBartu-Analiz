from curl_cffi import requests
import json

url = "https://api.sofascore.com/api/v1/sport/football/events/live"
r = requests.get(url, impersonate="chrome")
if r.status_code == 200:
    data = r.json()
    events = data.get("events", [])
    if events:
        print(json.dumps(events[0], indent=2))
else:
    print("Failed to fetch live events:", r.status_code)
