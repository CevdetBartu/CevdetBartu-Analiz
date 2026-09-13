import sqlite3

db_path = "scripts/scraper/gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("Dates with 2026:")
cur.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih LIKE '%2026%' GROUP BY tarih ORDER BY id DESC LIMIT 20")
for r in cur.fetchall():
    print(r)

print("\nDates with 24.07 or 2026-07-24:")
cur.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih LIKE '%07.2026%' OR tarih LIKE '2026-07%' GROUP BY tarih ORDER BY id DESC LIMIT 20")
for r in cur.fetchall():
    print(r)

conn.close()
