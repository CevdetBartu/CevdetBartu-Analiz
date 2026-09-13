import urllib.request
from bs4 import BeautifulSoup

url = "https://www.birebin.com/iddaa-tahminleri"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")

soup = BeautifulSoup(html, "html.parser")
for s in soup.find_all("script"):
    src = s.get("src")
    if src:
        print("SCRIPT SRC:", src)
