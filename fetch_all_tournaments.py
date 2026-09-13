from curl_cffi import requests
import json
import time
import re

def norm(text):
    if not text: return ""
    text = text.lower()
    replacements = {'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u', 'i̇':'i'}
    for k,v in replacements.items():
        text = text.replace(k, v)
    return re.sub(r'[^a-z0-9]', '', text)

with open('normalized_targets.json', 'r', encoding='utf-8') as f:
    target_list = set(json.load(f))

s = requests.Session(impersonate='chrome')
s.headers.update({"Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"})

print("Fetching categories...")
r = s.get('https://api.sofascore.com/api/v1/sport/football/categories')
cats = r.json().get('categories', [])

matched = {}
# For all categories, fetch unique tournaments
print(f"Total cats: {len(cats)}. Fetching unique tournaments...")
for idx, cat in enumerate(cats):
    cid = cat.get('id')
    cat_name = cat.get('name', '')
    
    # Random sleep to avoid ban
    time.sleep(1.0)
    
    try:
        r_ut = s.get(f'https://api.sofascore.com/api/v1/category/{cid}/unique-tournaments')
        if r_ut.status_code == 200:
            uts = r_ut.json().get('groups', [])[0].get('uniqueTournaments', [])
            for ut in uts:
                tid = ut.get('id')
                trn_name = ut.get('name', '')
                
                n_cat = norm(cat_name)
                n_trn = norm(trn_name)
                
                combo1 = n_trn + n_cat
                combo2 = n_trn
                
                if combo1 in target_list or combo2 in target_list:
                    display_name = f"{trn_name} - {cat_name}" if cat_name else trn_name
                    matched[display_name] = tid
                    
                    if combo1 in target_list: target_list.remove(combo1)
                    if combo2 in target_list: target_list.remove(combo2)
    except Exception as e:
        print("Err on cat", cid, e)
        
    if idx % 20 == 0:
        print(f"Progress: {idx}/{len(cats)}...")

with open('target_tournaments.json', 'w', encoding='utf-8') as f:
    json.dump(matched, f, ensure_ascii=False, indent=4)

print(f"Finished! Matched {len(matched)} target leagues.")
print(f"Missing (unmatched) count: {len(target_list)}")
