import sqlite3

conn = sqlite3.connect("scripts/scraper/gecmis_maclar.db")
c = conn.cursor()

print("--- Matches on 23.07.2026 ---")
c.execute("SELECT id, tarih, saat, ev_sahibi, deplasman, mac_skoru FROM gecmis_maclar WHERE tarih LIKE '%23.07%' LIMIT 10")
for row in c.fetchall():
    print(row)

print("\n--- Matches on 24.07.2026 ---")
c.execute("SELECT id, tarih, saat, ev_sahibi, deplasman, mac_skoru FROM gecmis_maclar WHERE tarih LIKE '%24.07%' LIMIT 10")
for row in c.fetchall():
    print(row)
