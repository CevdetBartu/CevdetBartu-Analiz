import os
fpath = "scripts/scraper/sources/today_matches.py"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("# r.encoding = 'windows-1254' # Removed, it is UTF-8 now", "r.encoding = 'utf-8' # Explicitly force UTF-8")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

