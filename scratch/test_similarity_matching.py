import sqlite3
import math

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Target query (Morocco W vs Cameroon W)
target_o1, target_ox, target_o2 = 2.10, 3.20, 3.10
target_has_25 = False
target_has_btts = False

# Fetch all matches with odds
cursor.execute("""
  SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, devre_skoru,
         oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok
  FROM gecmis_maclar
  WHERE oran_1 > 1.0 AND oran_x > 1.0 AND oran_2 > 1.0
""")

rows = cursor.fetchall()
print(f"Total valid historical matches: {len(rows)}")

matches_exact_odds = []
for r in rows:
    o1, ox, o2 = r[8], r[9], r[10]
    alt, ust = r[11], r[12]
    var, yok = r[13], r[14]
    
    # Distance on 1X2 Taraf Oranlari
    dist = math.sqrt(0.4 * (math.log(target_o1) - math.log(o1))**2 + 
                     0.2 * (math.log(target_ox) - math.log(ox))**2 + 
                     0.4 * (math.log(target_o2) - math.log(o2))**2)
    score = math.exp(-4.0 * dist) * 100.0
    
    matches_exact_odds.append({
        "id": r[0], "date": r[1], "home": r[4], "away": r[5], "score": r[6], "ht": r[7],
        "o1": o1, "ox": ox, "o2": o2,
        "alt": alt, "ust": ust, "var": var, "yok": yok,
        "simScore": round(score, 1)
    })

matches_exact_odds.sort(key=lambda x: x["simScore"], reverse=True)

print("\nTop 10 similar matches for 2.10 - 3.20 - 3.10:")
for m in matches_exact_odds[:10]:
    print(f"  [{m['simScore']}%] {m['date']} {m['home']} vs {m['away']} | 1X2: {m['o1']}-{m['ox']}-{m['o2']} | 2.5: {m['alt']}-{m['ust']} | BTTS: {m['var']}-{m['yok']} | FT: {m['score']}")

conn.close()
