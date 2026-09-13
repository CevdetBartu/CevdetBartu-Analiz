import os
import re

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """                                          setSelectedMatch({
                                            homeTeam: m.homeTeam,
                                            awayTeam: m.awayTeam,
                                            league: m.league,
                                            odds: {
                                              home: m.pre_match_odds?.["1"] || "",
                                              draw: m.pre_match_odds?.["X"] || "",
                                              away: m.pre_match_odds?.["2"] || ""
                                            }
                                          });"""

injection = """                                          setSelectedMatch({
                                            homeTeam: m.homeTeam,
                                            awayTeam: m.awayTeam,
                                            league: m.league,
                                            oddsHome: m.pre_match_odds?.["1"] ? parseFloat(m.pre_match_odds["1"]) : null,
                                            oddsDraw: m.pre_match_odds?.["X"] ? parseFloat(m.pre_match_odds["X"]) : null,
                                            oddsAway: m.pre_match_odds?.["2"] ? parseFloat(m.pre_match_odds["2"]) : null
                                          });"""

if target in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Props fixed in LiveMatchesPage.tsx!")
else:
    print("Target not found.")

