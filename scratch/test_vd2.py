import requests; r = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021', headers={'User-Agent': 'Mozilla/5.0'}); print(r.status_code); print(len(r.text)); print(r.text[:500])
