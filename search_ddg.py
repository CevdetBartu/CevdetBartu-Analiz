import urllib.request
import re

req = urllib.request.Request('https://html.duckduckgo.com/html/?q=mackolik+gol+sesi+mp3+indir', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'href="(https?://[^"]+)"', html)
    for l in links[:10]:
        print(l)
except Exception as e:
    print(e)
