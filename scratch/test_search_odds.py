import requests; r = requests.get('https://arsiv.mackolik.com/SearchWithOdds.aspx', headers={'User-Agent': 'Mozilla/5.0'}); print(r.status_code); print(len(r.text)); print(r.text[:200])
