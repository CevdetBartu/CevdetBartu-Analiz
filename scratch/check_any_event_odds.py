from curl_cffi import requests

eid = 16517939
markets = [1, 5, 18, 29]
for m in markets:
    url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/{m}/all/1"
    r = requests.get(url, impersonate="chrome")
    print(f"Lustenau Event ID: {eid} | Market ID: {m} | Status: {r.status_code}")
