import sqlite3

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

dates = ["20.07.2026", "21.07.2026", "22.07.2026", "23.07.2026", "24.07.2026"]

for d in dates:
    parts = d.split(".")
    d_iso = f"{parts[2]}-{parts[1]}-{parts[0]}"
    
    cursor.execute("""
        SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, devre_skoru
        FROM gecmis_maclar
        WHERE (tarih LIKE ? OR tarih LIKE ?)
          AND (mac_skoru IS NULL OR mac_skoru = '?:?' OR mac_skoru = '?' OR mac_skoru = '' OR mac_skoru = '-:-')
    """, (f"%{d}%", f"%{d_iso}%"))
    
    rows = cursor.fetchall()
    print(f"Date {d}: Found {len(rows)} matches with missing/unparsed scores.")
    for r in rows[:5]:
        print(f"   [ID: {r[0]}] {r[1]} {r[2]} | {r[3]} | {r[4]} vs {r[5]} | Score: {r[6]}")
    print("-" * 75)

conn.close()
