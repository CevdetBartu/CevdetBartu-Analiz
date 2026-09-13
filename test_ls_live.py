import requests, json; data = requests.get('https://prod-public-api.livescore.com/v1/api/app/live/soccer/3').json(); print(json.dumps(data, indent=2)[:500])
