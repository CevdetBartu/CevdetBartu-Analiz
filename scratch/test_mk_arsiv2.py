import requests; r = requests.get('https://arsiv.mackolik.com/Iddaa-Programi', headers={'User-Agent': 'Mozilla/5.0'}); print(r.text[:1000])
