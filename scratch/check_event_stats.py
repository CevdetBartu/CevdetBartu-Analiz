from curl_cffi import requests

# Let's get live events first, find a finished or in-progress event
url_live = "https://api.sofascore.com/api/v1/sport/football/events/live"
r = requests.get(url_live, impersonate="chrome")
if r.status_code == 200:
    events = r.json().get("events", [])
    if events:
        eid = events[0]["id"]
        # Now fetch statistics
        url_stats = f"https://api.sofascore.com/api/v1/event/{eid}/statistics"
        r_stats = requests.get(url_stats, impersonate="chrome")
        print(f"Event ID: {eid}")
        print(f"Stats Status: {r_stats.status_code}")
        if r_stats.status_code == 200:
            print("Stats Content:", r_stats.text[:500])
