import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
    SELECT id, tarih, lig, ev_sahibi, deplasman, devre_skoru, mac_skoru 
    FROM gecmis_maclar 
    WHERE ev_sahibi LIKE '%Seekirchen%' OR deplasman LIKE '%Sturm Graz%'
""")
rows = cursor.fetchall()
print(f"Found {len(rows)} matching rows:")
for r in rows:
    print(f"   [ID: {r[0]}] {r[1]} | {r[2]} | {r[3]} vs {r[4]} | HT: '{r[5]}' | FT: '{r[6]}'")

conn.close()
