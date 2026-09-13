import sqlite3
conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db')
conn.execute("ATTACH DATABASE 'gecmis_maclar_yedek_20260717_011051.db' AS backup")
conn.execute("INSERT OR IGNORE INTO gecmis_maclar SELECT * FROM backup.gecmis_maclar")
conn.commit()
conn.execute("ATTACH DATABASE 'gecmis_maclar_yedek_20260716_173509.db' AS backup2")
conn.execute("INSERT OR IGNORE INTO gecmis_maclar SELECT * FROM backup2.gecmis_maclar")
conn.commit()
print('Matches:', conn.execute('SELECT COUNT(*) FROM gecmis_maclar').fetchone()[0], 'Leagues:', conn.execute('SELECT COUNT(DISTINCT lig) FROM gecmis_maclar').fetchone()[0])
