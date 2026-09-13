import sqlite3
import json
conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')
leagues = [l[0] for l in conn.execute('SELECT DISTINCT lig FROM gecmis_maclar').fetchall()]
with open('leagues.json', 'w', encoding='utf-8') as f:
    json.dump(leagues, f, ensure_ascii=False, indent=2)
