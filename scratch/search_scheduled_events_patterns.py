from curl_cffi import requests
import re

url = "https://www.sofascore.com/_next/static/chunks/pages/_app-b05c230fee7bb6f7.js"
r = requests.get(url, impersonate="chrome")
text = r.text

matches = re.findall(r'`[^`]*scheduled-events[^`]*`', text)
for m in set(matches):
    print("Pattern:", m)
