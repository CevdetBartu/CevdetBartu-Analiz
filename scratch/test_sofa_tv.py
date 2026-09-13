import requests, json; r = requests.get('https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-08-27', headers={'User-Agent': 'Mozilla/5.0'}); print('tvNetworks' in r.text)
