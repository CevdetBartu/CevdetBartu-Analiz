from curl_cffi import requests
import re

url = "https://www.sofascore.com/_next/static/chunks/pages/_app-b05c230fee7bb6f7.js"
r = requests.get(url, impersonate="chrome")
text = r.text

# Find all occurrences of "scheduledEvents"
matches = [m.start() for m in re.finditer(r'scheduledEvents', text)]
for m in matches:
    print("--- Context ---")
    print(text[max(0, m-150):min(len(text), m+250)])
