import sqlite3

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM gecmis_maclar WHERE mac_skoru LIKE '%?%' OR devre_skoru LIKE '%?%'")
count = cursor.fetchone()[0]
print(f"Total rows in gecmis_maclar with '?' in mac_skoru or devre_skoru: {count}")

cursor.execute("""
    SELECT id, tarih, lig, ev_sahibi, deplasman, devre_skoru, mac_skoru 
    FROM gecmis_maclar 
    WHERE mac_skoru LIKE '%?%' OR devre_skoru LIKE '%?%'
    LIMIT 15
""")
rows = cursor.fetchall()
for r in rows:
    print(f"   [ID: {r[0]}] {r[1]} | {r[2]} | {r[3]} vs {r[4]} | HT: '{r[5]}' | FT: '{r[6]}'")

conn.close()
