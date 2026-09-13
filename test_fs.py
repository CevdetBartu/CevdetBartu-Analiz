import requests, re
r = requests.get('https://m.flashscore.com/', headers={'User-Agent': 'Mozilla/5.0'})
print(r.status_code)
print(len(r.text))
ids = re.findall(r'id=.g_1_([^.]+).', r.text)
print(ids[:10])

