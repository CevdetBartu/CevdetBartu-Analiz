import requests, json; data = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021').json()['m'][0]; print(list(enumerate(data)))
