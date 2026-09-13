from curl_cffi import requests
r = requests.get('https://api.sofascore.com/api/v1/sport/football/categories', impersonate='chrome')
if r.status_code == 200:
    cats = r.json().get('categories', [])
    print(f"Got {len(cats)} categories")
    print(cats[:3])
else:
    print("Failed", r.status_code)
