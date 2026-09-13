import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

code = re.sub(
    r"setSelectedMatch\(\{\s*homeTeam:\s*m\.homeTeam,\s*awayTeam:\s*m\.awayTeam,\s*league:\s*m\.league,\s*odds:\s*\{\s*home:\s*m\.pre_match_odds\?\.\[\"1\"\] \|\| \"\",\s*draw:\s*m\.pre_match_odds\?\.\[\"X\"\] \|\| \"\",\s*away:\s*m\.pre_match_odds\?\.\[\"2\"\] \|\| \"\"\s*\}\s*\}\);",
    """setSelectedMatch({
                                          homeTeam: m.homeTeam,
                                          awayTeam: m.awayTeam,
                                          league: m.league,
                                          oddsHome: m.pre_match_odds?.["1"] ? parseFloat(m.pre_match_odds["1"]) : null,
                                          oddsDraw: m.pre_match_odds?.["X"] ? parseFloat(m.pre_match_odds["X"]) : null,
                                          oddsAway: m.pre_match_odds?.["2"] ? parseFloat(m.pre_match_odds["2"]) : null
                                        });""",
    code
)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Regex replace executed!")

