import json
import re

def generate_filter_code():
    with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'r', encoding='utf-8') as f:
        content = f.read()
        
    replacement = '''
def norm_string(text):
    if not text: return ""
    text = text.lower()
    replacements = {'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u', 'i̇':'i'}
    for k,v in replacements.items():
        text = text.replace(k, v)
    import re
    return re.sub(r'[^a-z0-9]', '', text)

def get_all_leagues():
    import json
    try:
        with open('normalized_targets.json', 'r', encoding='utf-8') as f:
            target_list = set(json.load(f))
    except:
        target_list = set()
        
    url = "https://api.sofascore.com/api/v1/config/default-unique-tournaments/tr"
    data = safe_get(url)
    leagues = []
    if data and "uniqueTournaments" in data:
        for ut in data["uniqueTournaments"]:
            cat_name = ut.get("category", {}).get("name", "")
            trn_name = ut.get("name", "")
            
            # Combine them to match our normalized target list
            n_cat = norm_string(cat_name)
            n_trn = norm_string(trn_name)
            
            combo1 = n_trn + n_cat
            combo2 = n_trn # For UEFA or international leagues that don't have country attached
            
            if combo1 in target_list or combo2 in target_list:
                leagues.append({
                    "id": ut["id"],
                    "name": trn_name,
                    "slug": ut.get("slug", ""),
                    "category": cat_name
                })
                
    return leagues
'''

    # Replace the existing get_all_leagues function
    import re
    # Find def get_all_leagues(): ... return leagues
    pattern = re.compile(r'def get_all_leagues\(\):.*?return leagues', re.DOTALL)
    new_content = pattern.sub(replacement.strip(), content)
    
    with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
        print("Updated scraper to filter leagues.")

generate_filter_code()
