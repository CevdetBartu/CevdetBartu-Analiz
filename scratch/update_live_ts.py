import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\live.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Add imports
if "getTodayMatchesFromDb" not in code:
    code = code.replace("import { fileURLToPath } from \"node:url\";", "import { fileURLToPath } from \"node:url\";\nimport { getTodayMatchesFromDb } from \"../lib/todayMatches\";")

# Modify /live-matches route
target_route = """    const data = await response.json();
    res.json(data);"""

injection = """    const data = await response.json();
    
    // Fuzzy match with bulletin to attach Mackolik odds
    try {
      const todayMatches = await getTodayMatchesFromDb();
      
      const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      if (Array.isArray(data) || data.Count !== undefined) {
        const matchesArr = Array.isArray(data) ? data : data.matches || [];
        matchesArr.forEach((liveM: any) => {
          const lHome = normalizeStr(liveM.homeTeam);
          const lAway = normalizeStr(liveM.awayTeam);
          
          const matched = todayMatches.find(tm => {
            const tHome = normalizeStr(tm.homeTeam);
            const tAway = normalizeStr(tm.awayTeam);
            return (tHome.includes(lHome.substring(0, 5)) || lHome.includes(tHome.substring(0, 5))) &&
                   (tAway.includes(lAway.substring(0, 5)) || lAway.includes(tAway.substring(0, 5)));
          });
          
          if (matched) {
            liveM.bulletin_props = matched;
          }
        });
      }
    } catch (err) {
      logger.error({ err }, "Error merging bulletin odds to live matches");
    }

    res.json(data);"""

if "bulletin_props" not in code:
    code = code.replace(target_route, injection)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("live.ts updated!")

