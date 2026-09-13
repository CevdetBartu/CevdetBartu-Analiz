import requests; r = requests.get('https://m.flashscore.com/', headers={'User-Agent': 'Mozilla/5.0'}); open('fs_m.html', 'w', encoding='utf-8').write(r.text)
