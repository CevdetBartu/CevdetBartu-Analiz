import sqlite3
import math
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Target query (Morocco W vs Cameroon W)
target_o1, target_ox, target_o2 = 2.10, 3.20, 3.10
target_has_25 = False
target_has_btts = False

cursor.execute("""
  SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, devre_skoru,
         oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok
  FROM gecmis_maclar
  WHERE oran_1 > 1.0 AND oran_x > 1.0 AND oran_2 > 1.0
""")

rows = cursor.fetchall()

results = []
for r in rows:
    o1, ox, o2 = r[8], r[9], r[10]
    alt, ust = r[11], r[12]
    var, yok = r[13], r[14]
    
    match_has_25 = (alt is not None and ust is not None and alt > 1.0 and ust > 1.0) if (alt and ust) else False
    match_has_btts = (var is not None and yok is not None and var > 1.0 and yok > 1.0) if (var and yok) else False

    # Logarithmic distance on 1X2
    dist_1x2 = math.sqrt(0.4 * (math.log(target_o1) - math.log(o1))**2 + 
                         0.2 * (math.log(target_ox) - math.log(ox))**2 + 
                         0.4 * (math.log(target_o2) - math.log(o2))**2)
    
    sim_score = math.exp(-4.0 * dist_1x2) * 100.0

    # Market Pattern Matching Bonus/Penalty
    pattern_match = (match_has_25 == target_has_25) and (match_has_btts == target_has_btts)
    
    if pattern_match:
        sim_score += 5.0 # Bonus for exact drawn markets pattern!
    else:
        sim_score -= 15.0 # Penalty for market profile mismatch

    sim_score = max(0.0, min(100.0, sim_score))

    results.append({
        "id": r[0], "date": r[1], "home": r[4], "away": r[5], "score": r[6],
        "o1": o1, "ox": ox, "o2": o2,
        "alt": alt, "ust": ust, "var": var, "yok": yok,
        "pattern_match": pattern_match,
        "simScore": round(sim_score, 1)
    })

results.sort(key=lambda x: x["simScore"], reverse=True)

print("Top 10 similar matches WITH Market Pattern Matching for Morocco W vs Cameroon W:")
for m in results[:10]:
    pm_str = "EXACT MATCH MARKETS" if m["pattern_match"] else "MISMATCH MARKETS"
    print(f"  [{m['simScore']}%] ({pm_str}) {m['date']} | {m['home']} vs {m['away']} | 1X2: {m['o1']}-{m['ox']}-{m['o2']} | 2.5: {m['alt']}-{m['ust']} | FT: {m['score']}")

conn.close()
