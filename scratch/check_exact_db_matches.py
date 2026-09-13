import sqlite3
import os

db_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\gecmis_maclar.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

dates_to_check = [
    ("2026-07-20", "20.07.2026"),
    ("2026-07-21", "21.07.2026"),
    ("2026-07-22", "22.07.2026"),
    ("2026-07-23", "23.07.2026"),
    ("2026-07-24", "24.07.2026"),
    ("2026-07-25", "25.07.2026")
]

for iso, dot in dates_to_check:
    cursor.execute("""
        SELECT COUNT(*), MIN(saat), MAX(saat) FROM gecmis_maclar 
        WHERE tarih LIKE ? OR tarih LIKE ?
    """, (f"%{iso}%", f"%{dot}%"))
    count, min_s, max_s = cursor.fetchone()
    print(f"Date {iso} ({dot}): {count} real matches in DB (Time range: {min_s} - {max_s})")
    
    # Print 5 sample real matches for this date
    cursor.execute("""
        SELECT id, tarih, saat, lig, ev_sahibi, deplasman, mac_skoru, oran_1, oran_x, oran_2
        FROM gecmis_maclar 
        WHERE tarih LIKE ? OR tarih LIKE ?
        LIMIT 5
    """, (f"%{iso}%", f"%{dot}%"))
    sample = cursor.fetchall()
    for row in sample:
        print(f"   [ID: {row[0]}] {row[1]} {row[2]} | {row[3]} | {row[4]} vs {row[5]} | Score: {row[6]} | Odds: {row[7]}/{row[8]}/{row[9]}")
    print("-" * 70)

conn.close()
