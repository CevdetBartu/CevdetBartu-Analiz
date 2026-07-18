import sys
sys.stdout.reconfigure(encoding='utf-8')

from curl_cffi import requests
import json

url = "https://api.sofascore.com/api/v1/search/unique-tournaments?q=Europa&sportId=1"
r = requests.get(url, impersonate="chrome")
print("Status:", r.status_code)
if r.status_code == 200:
    results = r.json().get("results", [])
    print(f"Found {len(results)} results:")
    for res in results:
        # Check the fields in results
        print(json.dumps(res, indent=2))
