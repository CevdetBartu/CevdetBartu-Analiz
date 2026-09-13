import requests; open('scratch/canli.html', 'w', encoding='utf-8').write(requests.get('https://arsiv.mackolik.com/Canli-Sonuclar', headers={'User-Agent': 'Mozilla/5.0'}).text)
