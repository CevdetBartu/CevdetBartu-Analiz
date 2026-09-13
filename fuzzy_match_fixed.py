import json
import difflib

with open('all_sofascore_tournaments.json', 'r', encoding='utf-8') as f:
    all_uts = json.load(f)

with open('translated_targets.json', 'r', encoding='utf-8') as f:
    translated_list = json.load(f)

sofa_keys = list(all_uts.keys())
matched = {}

for target in translated_list:
    # 1. Exact match
    if target in all_uts:
        matched[target] = all_uts[target]
    else:
        # 2. Fuzzy match
        close = difflib.get_close_matches(target, sofa_keys, n=1, cutoff=0.7)
        if close:
            matched[target] = all_uts[close[0]]

with open('target_tournaments.json', 'w', encoding='utf-8') as f:
    json.dump(matched, f, ensure_ascii=False, indent=2)

print(f"Mapped {len(matched)} out of {len(translated_list)}")
