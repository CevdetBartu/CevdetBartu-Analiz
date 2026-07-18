from curl_cffi import requests

eid = 16343581
for m in range(1, 40):
    url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/{m}/all"
    r = requests.get(url, impersonate="chrome")
    if r.status_code == 200:
        data = r.json()
        markets = data.get("markets", [])
        if markets:
            print(f"Market ID: {m} | Name: {markets[0].get('marketName')} | Choices: {[c.get('name') for c in markets[0].get('choices', [])]}")
