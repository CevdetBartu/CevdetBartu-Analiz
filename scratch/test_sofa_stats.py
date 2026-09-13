import requests, json; r = requests.get('https://api.sofascore.com/api/v1/event/11352376/statistics', headers={'User-Agent': 'Mozilla/5.0'}); print(r.text)
