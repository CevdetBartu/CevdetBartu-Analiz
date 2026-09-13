import urllib.request
import re

url = "https://www.birebin.com/iddaa-tahminleri"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")

urls = re.findall(r'https?://[^\s"\']+', html)
for u in urls:
    if "api" in u.lower() or "json" in u.lower():
        print(u)
