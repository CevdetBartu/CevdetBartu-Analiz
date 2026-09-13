import sqlite3

db_path = "scripts/scraper/gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar GROUP BY tarih ORDER BY tarih DESC LIMIT 15")
rows = cur.fetchall()

print("Recent dates in database:")
for r in rows:
    print(r)

conn.close()
