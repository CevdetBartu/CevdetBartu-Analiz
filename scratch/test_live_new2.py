import requests; print(len(requests.get('https://www.mackolik.com/canli-sonuclar', headers={'User-Agent': 'Mozilla/5.0'}).text))
