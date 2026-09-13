from curl_cffi import requests
r = requests.get('https://api.sofascore.com/api/v1/sport/football/events/live', impersonate='chrome')
evs = r.json().get('events', [])
if evs:
    ev = evs[0]
    print(ev.get('tournament', {}).get('name'))
    print(ev.get('tournament', {}).get('category', {}).get('name'))
