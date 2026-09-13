import json
import re

def norm(text):
    if not text: return ""
    text = text.lower()
    replacements = {'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u', 'i̇':'i'}
    for k,v in replacements.items():
        text = text.replace(k, v)
    return re.sub(r'[^a-z0-9]', '', text)

with open('target_leagues.json', 'r', encoding='utf-8') as f:
    raw_targets = json.load(f)

normalized_targets = []
for t in raw_targets:
    parts = t.split(' - ')
    if len(parts) == 2:
        tourn, cat = parts
        normalized_targets.append(norm(tourn) + norm(cat))
    else:
        normalized_targets.append(norm(t))
        
# Remove duplicates
normalized_targets = list(set(normalized_targets))

with open('normalized_targets.json', 'w', encoding='utf-8') as f:
    json.dump(normalized_targets, f)
print(f"Saved {len(normalized_targets)} unique normalized targets.")
