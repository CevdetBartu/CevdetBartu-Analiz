from curl_cffi import requests

url = "https://api.sofascore.com/api/v1/sport/football/events/live"
r = requests.get(url, impersonate="chrome")
print("Live Events Status:", r.status_code)
if r.status_code == 200:
    data = r.json()
    events = data.get("events", [])
    print("Live Events Count:", len(events))
    if events:
        print("First live event date:", events[0].get("startTimestamp"))
