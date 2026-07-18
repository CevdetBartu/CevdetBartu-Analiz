from curl_cffi import requests
from bs4 import BeautifulSoup

url = "https://www.sofascore.com/"
r = requests.get(url, impersonate="chrome")
soup = BeautifulSoup(r.text, 'html.parser')
chunks = []
for s in soup.find_all('script'):
    src = s.get('src')
    if src and '_next/static/chunks' in src:
        chunks.append(src)

keywords = ["scheduled-events", "scheduledEvents", "events/live", "sport/football"]
for c in chunks:
    chunk_url = f"https://www.sofascore.com{c}"
    r_chunk = requests.get(chunk_url, impersonate="chrome")
    if r_chunk.status_code == 200:
        found = [k for k in keywords if k in r_chunk.text]
        if found:
            print(f"Chunk {c} contains keywords: {found}")
            # print surrounding text of the first keyword found
            idx = r_chunk.text.find(found[0])
            print("Snippet:", r_chunk.text[max(0, idx-100):min(len(r_chunk.text), idx+100)])
