import requests; m = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021').json()['m'][:2]; print(m[0][2], m[0][4], m[0][6:16]); print(m[1][2], m[1][4], m[1][6:16])
