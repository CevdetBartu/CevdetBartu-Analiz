from curl_cffi import requests
import json
import time

s = requests.Session(impersonate='chrome')
s.headers.update({"Accept-Language": "en-US,en;q=0.9"})

r = s.get('https://api.sofascore.com/api/v1/sport/football/categories')
cats = r.json().get('categories', [])

all_uts = {}
print("Fetching all tournaments again...")
for idx, cat in enumerate(cats):
    cid = cat.get('id')
    cat_name = cat.get('name', '')
    time.sleep(0.5)
    try:
        r_ut = s.get(f'https://api.sofascore.com/api/v1/category/{cid}/unique-tournaments')
        if r_ut.status_code == 200:
            uts = r_ut.json().get('groups', [])[0].get('uniqueTournaments', [])
            for ut in uts:
                all_uts[f"{ut.get('name')} - {cat_name}"] = ut.get('id')
    except:
        pass

with open('all_sofascore_tournaments.json', 'w', encoding='utf-8') as f:
    json.dump(all_uts, f, ensure_ascii=False, indent=2)
    
print(f"Saved {len(all_uts)} tournaments!")
