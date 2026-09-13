import sqlite3; c = sqlite3.connect('scripts/scraper/gecmis_maclar.db'); print(c.execute('PRAGMA table_info(maclar)').fetchall())
