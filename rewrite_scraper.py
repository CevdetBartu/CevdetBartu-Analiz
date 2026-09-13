import json
import re

def rewrite_scraper():
    with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'r', encoding='utf-8') as f:
        content = f.read()

    replacement = '''
def import_all_leagues_full_history():
    import json
    import os
    try:
        with open('target_tournaments.json', 'r', encoding='utf-8') as f:
            tournaments_dict = json.load(f)
    except:
        tournaments_dict = TOURNAMENTS
        
    print(f"[START] Toplam {len(tournaments_dict)} lig için tüm geçmiş sezonların ve tüm maçların veritabanına aktarımı başlatılıyor...")
    
    conn = get_conn()
    total_new_matches = 0
    
    tournaments_list = list(tournaments_dict.items())
'''
    
    # We replace from "def import_all_leagues_full_history():" up to "tournaments_list = list(TOURNAMENTS.items())"
    pattern = re.compile(r'def import_all_leagues_full_history\(\):.*?tournaments_list = list\(TOURNAMENTS\.items\(\)\)', re.DOTALL)
    new_content = pattern.sub(replacement.strip(), content)
    
    with open('scripts/scraper/import_all_1005_leagues_full_history.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Rewritten.")
rewrite_scraper()
