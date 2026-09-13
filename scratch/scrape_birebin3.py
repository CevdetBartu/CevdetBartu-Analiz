import urllib.request
from bs4 import BeautifulSoup

url = "https://www.birebin.com/iddaa-tahminleri"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")
soup = BeautifulSoup(html, "html.parser")
print(soup.body.text[:2000].replace("\n\n\n", ""))

