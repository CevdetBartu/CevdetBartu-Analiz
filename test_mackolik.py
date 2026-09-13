import requests, json; data = requests.get('https://vd.mackolik.com/livedata?date=26%2F08%2F2026', headers={'User-Agent': 'Mozilla/5.0'}).json(); print(json.dumps(data, indent=2)[:500])
