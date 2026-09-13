import urllib.request
import json
url = "https://api.github.com/search/code?q=gol+extension:mp3"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read())
        for item in res.get('items', [])[:5]:
            print(item['html_url'])
            print(item['url'])
except Exception as e:
    print(e)
