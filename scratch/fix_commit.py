import os

fpath = os.path.join("scripts", "scraper", "historical_mackolik_importer.py")
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

new_code = code.replace("inserted += 1", "inserted += 1\n            conn.commit()")
with open(fpath, "w", encoding="utf-8") as f:
    f.write(new_code)

