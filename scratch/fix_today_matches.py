import os
fpath = "scripts/scraper/sources/today_matches.py"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("r.encoding = 'windows-1254'", "# r.encoding = 'windows-1254' # Removed, it is UTF-8 now")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

