import json
from curl_cffi import requests
import re

def norm(text):
    if not text: return ""
    text = text.lower()
    replacements = {'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u', 'i̇':'i'}
    for k,v in replacements.items():
        text = text.replace(k, v)
    return re.sub(r'[^a-z0-9]', '', text)

# Load target list
with open('normalized_targets.json', 'r', encoding='utf-8') as f:
    target_list = set(json.load(f))

r = requests.get('https://api.sofascore.com/api/v1/config/default-unique-tournaments/tr', impersonate='chrome')
if r.status_code != 200:
    print("Failed to fetch!")
    exit(1)

data = r.json()
unique_tournaments = data.get("uniqueTournaments", [])

matched_tournaments = {}

for ut in unique_tournaments:
    tid = ut.get("id")
    trn_name = ut.get("name", "")
    cat_name = ut.get("category", {}).get("name", "")
    
    n_cat = norm(cat_name)
    n_trn = norm(trn_name)
    
    combo1 = n_trn + n_cat
    combo2 = n_trn # Fallback for UEFA / Intl
    
    if combo1 in target_list or combo2 in target_list:
        display_name = f"{trn_name} - {cat_name}" if cat_name else trn_name
        # To match config.py format (no duplicates allowed by dict keys)
        matched_tournaments[display_name] = tid
        
        # Remove from target list so we can see what's missing
        if combo1 in target_list: target_list.remove(combo1)
        if combo2 in target_list: target_list.remove(combo2)

# Save the resulting dictionary to a new file so we can inject it into config.py
with open('matched_tournaments.json', 'w', encoding='utf-8') as f:
    json.dump(matched_tournaments, f, ensure_ascii=False, indent=4)

print(f"Matched {len(matched_tournaments)} leagues!")
print(f"Missing (unmatched) count: {len(target_list)}")
print(f"Missing samples: {list(target_list)[:10]}")
