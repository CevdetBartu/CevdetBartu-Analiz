import urllib.request
import re

try:
    req = urllib.request.Request('https://www.mackolik.com', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    mp3s = re.findall(r'https?://[^\s"\'<>]+(?:mp3|ogg|wav)', html)
    print("Found:", mp3s)
except Exception as e:
    print(e)
