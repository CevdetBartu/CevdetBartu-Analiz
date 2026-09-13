import requests; m = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021').json()['m'][:5]; print([x[7:10] for x in m])
