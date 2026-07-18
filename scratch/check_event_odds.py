from curl_cffi import requests
import json

eid = 16343581
markets = [1, 5, 18, 29]
for m in markets:
    url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/{m}/all/1"
    r = requests.get(url, impersonate="chrome")
    print(f"Market ID: {m} | Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print("  Keys:", list(data.keys()))
        mkts = data.get("markets", [])
        print(f"  Markets count: {len(mkts)}")
        if mkts:
            print("  First market choices:", [c.get("name") for c in mkts[0].get("choices", [])])
            print("  First market data:", json.dumps(mkts[0], indent=2)[:300])
