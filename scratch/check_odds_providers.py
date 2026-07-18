from curl_cffi import requests
import json

eid = 16343581
url = f"https://api.sofascore.com/api/v1/event/{eid}/odds/providers"
r = requests.get(url, impersonate="chrome")
print("Status:", r.status_code)
if r.status_code == 200:
    print(json.dumps(r.json(), indent=2)[:1000])
