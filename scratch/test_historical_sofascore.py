from curl_cffi import requests

dates = ["2026-07-16", "2025-07-16", "2024-07-16", "2024-05-15", "2026-05-15"]
for d in dates:
    url = f"https://api.sofascore.com/api/v1/sport/football/scheduled-events/{d}"
    r = requests.get(url, impersonate="chrome")
    print(f"Date: {d} | Status: {r.status_code} | Body: {r.text[:50]}")
