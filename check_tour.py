from curl_cffi import requests
r = requests.get('https://api.sofascore.com/api/v1/config/default-unique-tournaments/tr', impersonate='chrome')
data = r.json()
unique_tournaments = data.get("uniqueTournaments", [])
for ut in unique_tournaments[:10]:
    print(ut.get("name"), "-", ut.get("category", {}).get("name"))
