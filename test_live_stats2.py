import requests; r = requests.get('https://m.flashscore.com/match/63Dqw6Ot/?t=stats', headers={'User-Agent': 'Mozilla/5.0'}); open('fs_stats.html', 'w', encoding='utf-8').write(r.text)
