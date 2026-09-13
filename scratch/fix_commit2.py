import os

fpath = os.path.join("scripts", "scraper", "historical_mackolik_importer.py")
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("inserted += 1\n            conn.commit()", "inserted += 1")

code = code.replace("logger.info(f\"[{date_param}] Tamamlandı.", "conn.commit()\n            logger.info(f\"[{date_param}] Tamamlandı.")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

