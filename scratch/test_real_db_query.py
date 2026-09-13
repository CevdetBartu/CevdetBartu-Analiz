import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

dates = ["20.07.2026", "21.07.2026", "22.07.2026", "23.07.2026", "24.07.2026", "25.07.2026"]

for d_dot in dates:
    parts = d_dot.split(".")
    d_iso = f"{parts[2]}-{parts[1]}-{parts[0]}"
    
    cursor.execute("""
        SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, devre_skoru,
               oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok
        FROM gecmis_maclar
        WHERE (tarih LIKE ? OR tarih LIKE ?) AND oran_1 > 1.0 AND oran_x > 1.0 AND oran_2 > 1.0
        ORDER BY saat ASC
        LIMIT 20
    """, (f"%{d_dot}%", f"%{d_iso}%"))
    
    rows = cursor.fetchall()
    print(f"Date {d_dot} ({d_iso}): Found {len(rows)} real games with odds in DB!")
    for r in rows[:3]:
        print(f"   [ID: {r['id']}] {r['tarih']} {r['saat']} | {r['lig']} | {r['ev_sahibi']} vs {r['deplasman']} | Score: {r['mac_skoru']}")
    print("=" * 75)

conn.close()
