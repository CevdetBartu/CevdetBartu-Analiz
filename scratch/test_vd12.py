import requests; m = requests.get('https://vd.mackolik.com/livedata?date=01/01/2021').json()['m']; print(len(m)); print(len([x for x in m if x[18]]))
