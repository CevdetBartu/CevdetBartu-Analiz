import urllib.request
import re

url = "https://www.birebin.com/bundle/scripts?999997085"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
js = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")

paths = re.findall(r'["\'](/api/[^"\']+)["\']', js)
for p in set(paths):
    if "tahmin" in p.lower() or "kupon" in p.lower() or "yazar" in p.lower() or "social" in p.lower() or "tipster" in p.lower():
        print("FOUND API:", p)
