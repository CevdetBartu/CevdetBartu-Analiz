import requests; m = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021').json()['m']; print(set([x[18] for x in m]))
