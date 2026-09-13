import sqlite3
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')
cursor = conn.cursor()

def parse_date_to_iso(d_str):
    if not d_str:
        return None
    d_str = d_str.strip()
    if '-' in d_str and len(d_str) >= 10:
        return d_str[:10]
    if '.' in d_str:
        parts = d_str.split('.')
        if len(parts) == 3:
            day, month, year = parts[0].zfill(2), parts[1].zfill(2), parts[2]
            if len(year) == 4:
                return f"{year}-{month}-{day}"
    return None

cursor.execute("SELECT id, tarih FROM gecmis_maclar WHERE tarih IS NOT NULL")
all_rows = cursor.fetchall()
total_cnt = len(all_rows)

cutoff_iso = "2021-08-15"
valid_rows = []
for rid, tstr in all_rows:
    iso = parse_date_to_iso(tstr)
    if iso and iso >= cutoff_iso:
        valid_rows.append(rid)

print(f"Total matches in DB: {total_cnt}")
print(f"Total matches on or after {cutoff_iso} (15.08.2021): {len(valid_rows)}")
