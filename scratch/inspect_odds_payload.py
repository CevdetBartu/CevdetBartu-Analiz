from curl_cffi import requests
import json

eid = 16343581
url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/1/all"
r = requests.get(url, impersonate="chrome")
print("Status:", r.status_code)
if r.status_code == 200:
    data = r.json()
    markets = data.get("markets", [])
    print(f"Total markets in odds/1/all: {len(markets)}")
    for i, m in enumerate(markets):
        mname = m.get("marketName")
        mgroup = m.get("marketGroup")
        choices = [c.get("name") for c in m.get("choices", [])]
        print(f"{i+1}. Group: {mgroup} | Name: {mname} | Choices: {choices}")
