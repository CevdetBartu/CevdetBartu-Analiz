import requests, json; data = requests.get('https://prod-public-api.livescore.com/v1/api/app/date/soccer/20260826/3').json(); print(json.dumps(data['Stages'][0]['Events'][0], indent=2))
