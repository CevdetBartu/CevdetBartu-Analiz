from curl_cffi import requests

patterns = [
    "/sport/football/scheduled-events/{date}",
    "/sport/football/events/date/{date}",
    "/sport/football/events/{date}",
    "/sport/football/matches/{date}",
    "/sport/football/scheduled-events/{date}/inverse",
    "/sport/football/events/date/{date}/inverse",
    "/sport/1/scheduled-events/{date}",
    "/sport/1/events/date/{date}",
    "/sport/1/events/{date}",
]

date = "2026-07-16"
for p in patterns:
    path = p.replace("{date}", date)
    url = f"https://api.sofascore.com/api/v1{path}"
    r = requests.get(url, impersonate="chrome")
    print(f"Path: {path} | Status: {r.status_code} | Body: {r.text[:50]}")
