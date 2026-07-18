from curl_cffi import requests

eid = 16343574
for m in range(1, 100):
    url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/{m}/all"
    r = requests.get(url, impersonate="chrome")
    if r.status_code == 200:
        data = r.json()
        markets = data.get("markets", [])
        if markets:
            mname = markets[0].get('marketName')
            choices = [c.get('name') for c in markets[0].get('choices', [])]
            print(f"Market ID: {m} | Name: {mname} | Choices: {choices}")
