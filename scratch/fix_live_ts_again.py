import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\live.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """    // Fuzzy match with bulletin to attach Mackolik odds
    try {
      const todayMatches = await getTodayMatchesFromDb();
      
      const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      if (Array.isArray(data) || data.Count !== undefined) {
        const matchesArr = Array.isArray(data) ? data : data.matches || [];
        matchesArr.forEach((liveM: any) => {
          const lHome = normalizeStr(liveM.homeTeam);
          const lAway = normalizeStr(liveM.awayTeam);
          
          const matched = todayMatches.find(tm => {"""

injection = """    // Fuzzy match with bulletin to attach Mackolik odds
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayMatchesRes = getTodayMatchesFromDb(todayStr);
      const todayMatches = todayMatchesRes.matches || [];
      
      const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      if (Array.isArray(data) || data.Count !== undefined) {
        const matchesArr = Array.isArray(data) ? data : data.matches || [];
        matchesArr.forEach((liveM: any) => {
          const lHome = normalizeStr(liveM.homeTeam);
          const lAway = normalizeStr(liveM.awayTeam);
          
          const matched = todayMatches.find(tm => {"""

if target in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("live.ts fixed!")
else:
    print("Target not found, trying regex...")
    code = re.sub(
        r"const todayMatches = await getTodayMatchesFromDb\(\);",
        "const todayStr = new Date().toISOString().slice(0, 10);\n      const todayMatchesRes = getTodayMatchesFromDb(todayStr);\n      const todayMatches = todayMatchesRes.matches || [];",
        code
    )
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("live.ts fixed via regex!")

