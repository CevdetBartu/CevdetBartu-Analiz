import sqlite3; conn = sqlite3.connect('scripts/scraper/gecmis_maclar.db'); cur = conn.cursor(); cur.execute('SELECT COUNT(*) FROM gecmis_maclar WHERE tarih = \'26.08.2026\''); print(cur.fetchone())
