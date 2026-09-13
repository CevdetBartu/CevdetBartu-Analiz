import requests; r = requests.get('https://vd.mackolik.com/iddaa-programi?date=27/08/2026', headers={'User-Agent': 'Mozilla/5.0'}); print(r.status_code, r.text[:200])
