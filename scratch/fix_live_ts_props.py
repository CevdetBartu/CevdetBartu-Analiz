import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\live.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """          const matched = todayMatches.find(tm => {
            const tHome = normalizeStr(tm.homeTeam);
            const tAway = normalizeStr(tm.awayTeam);"""

injection = """          const matched = todayMatches.find(tm => {
            const tHome = normalizeStr(tm.ev_sahibi || tm.homeTeam || "");
            const tAway = normalizeStr(tm.deplasman || tm.awayTeam || "");"""

if target in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("live.ts fixed!")
else:
    print("Target not found.")

