import requests; r = requests.get('https://www.mackolik.com/canli-sonuclar/2021-01-01', headers={'User-Agent': 'Mozilla/5.0'}); print(r.status_code); print('data-match' in r.text)
