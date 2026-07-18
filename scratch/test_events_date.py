from curl_cffi import requests

dates = ["2026-07-16", "2026-05-15"]
for d in dates:
    url = f"https://api.sofascore.com/api/v1/sport/football/events/date/{d}"
    r = requests.get(url, impersonate="chrome")
    print(f"URL: {url} | Status: {r.status_code} | Body: {r.text[:100]}")
