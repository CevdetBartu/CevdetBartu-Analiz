import requests; r = requests.get('https://arsiv.mackolik.com/Iddaa-Programi/?date=26.08.2026', headers={'User-Agent': 'Mozilla/5.0'}); print('26.08.2026' in r.text)
