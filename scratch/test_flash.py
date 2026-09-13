import urllib.request; req = urllib.request.Request('https://m.flashscore.com.tr/?s=3', headers={'User-Agent': 'Mozilla/5.0'}); print(len(urllib.request.urlopen(req).read()))
