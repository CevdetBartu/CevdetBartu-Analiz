import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = "league: m.league,"
injection = "league: b.lig || m.league,"

if "b.lig || m.league" not in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("League mapped!")
else:
    print("Already mapped.")

