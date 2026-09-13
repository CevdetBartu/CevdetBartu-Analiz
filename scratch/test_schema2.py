import sqlite3; c = sqlite3.connect("scripts/scraper/gecmis_maclar.db"); print(c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())
