import requests; print(len(requests.get('https://vd.mackolik.com/livedata?date=01.01.2021').text)); print(len(requests.get('https://vd.mackolik.com/livedata?date=2021-01-01').text))
