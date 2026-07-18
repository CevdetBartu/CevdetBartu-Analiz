from curl_cffi import requests
from bs4 import BeautifulSoup

url = "https://www.sofascore.com/"
r = requests.get(url, impersonate="chrome")
soup = BeautifulSoup(r.text, 'html.parser')
for s in soup.find_all('script'):
    src = s.get('src')
    if src:
        if 'main' in src or 'runtime' in src or 'chunk' in src:
            print("Script Src:", src)
    else:
        text = s.string or ""
        if 'window.INITIAL_STATE' in text or 'api' in text or 'scheduled-events' in text:
            print("Script Content snippet:", text[:300])
