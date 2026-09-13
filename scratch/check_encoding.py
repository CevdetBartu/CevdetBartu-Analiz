import sqlite3
import json

c = sqlite3.connect("scripts/scraper/gecmis_maclar.db")
leagues = [row[0] for row in c.execute("SELECT DISTINCT lig FROM gecmis_maclar").fetchall()]

bad_leagues = []
for l in leagues:
    # Let's check if it has Mojibake patterns
    if "Ã" in l or "Ä" in l or "Å" in l or "" in l:
        bad_leagues.append(l)

print(json.dumps(bad_leagues, ensure_ascii=False))

