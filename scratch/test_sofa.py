from curl_cffi import requests; r = requests.get('https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-08-26', impersonate='chrome110'); print(r.status_code); print(r.text[:100])
