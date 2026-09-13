import urllib.request
import re
from bs4 import BeautifulSoup

url = "https://www.birebin.com/iddaa-tahminleri"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")

soup = BeautifulSoup(html, "html.parser")
print("TITLE:", soup.title.string if soup.title else "No Title")

# Find typical prediction containers or script tags
print("Looking for prediction elements...")
for div in soup.find_all("div", class_=re.compile("predict|tahmin|coupon", re.I)):
    print(div.get("class"))

print("Script tags with API urls:")
for s in soup.find_all("script"):
    if s.string and ("api" in s.string.lower() or "tahmin" in s.string.lower()):
        print(s.string[:200])

