from curl_cffi import requests

for day in range(1, 21):
    date_str = f"2026-07-{day:02d}"
    url = f"https://api.sofascore.com/api/v1/sport/football/scheduled-events/{date_str}"
    r = requests.get(url, impersonate="chrome")
    print(f"Date: {date_str} | Status: {r.status_code}")
