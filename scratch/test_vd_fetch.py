import requests, json; r = requests.get('https://vd.mackolik.com/livedata?date=26/08/2026'); open('scratch/test_vd.json', 'wb').write(r.content)
