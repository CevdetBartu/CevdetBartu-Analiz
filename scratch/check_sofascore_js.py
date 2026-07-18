from curl_cffi import requests
import re

url = "https://www.sofascore.com/"
r = requests.get(url, impersonate="chrome")
print("Homepage status:", r.status_code)
# Search for API URLs in scripts
matches = re.findall(r'api/v1/[a-zA-Z0-9_\-/]+', r.text)
print("Found API-like strings:")
for m in set(matches)[:30]:
    print("-", m)
