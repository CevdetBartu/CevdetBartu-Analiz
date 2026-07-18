import sqlite3

conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')
cur = conn.cursor()

# Total matches
cur.execute("SELECT COUNT(*) FROM gecmis_maclar")
total = cur.fetchone()[0]

# NULL kg_var
cur.execute("SELECT COUNT(*) FROM gecmis_maclar WHERE kg_var IS NULL")
null_kg = cur.fetchone()[0]

# NULL kg_var but has 1X2 and OU
cur.execute("SELECT COUNT(*) FROM gecmis_maclar WHERE kg_var IS NULL AND oran_1 IS NOT NULL AND ust_orani IS NOT NULL")
has_others = cur.fetchone()[0]

print(f"Total matches: {total}")
print(f"Matches with NULL kg_var: {null_kg}")
print(f"Matches with NULL kg_var but having 1X2 and OU odds: {has_others}")

conn.close()
