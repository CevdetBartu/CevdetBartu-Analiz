import urllib.request
import json
import urllib.parse
query = urllib.parse.quote("mackolik gol sesi mp3")
url = f"https://html.duckduckgo.com/html/?q={query}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        import re
        links = re.findall(r'href="([^"]+)"', html)
        print("Links found:")
        for l in links[:10]:
            print(l)
except Exception as e:
    print(e)
