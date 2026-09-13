import os
import re

fpath = "artifacts/football-app/src/pages/LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Fix hasOdds crash
code = code.replace(
    'const hasOdds = m.pre_match_odds["1"] && m.pre_match_odds["X"] && m.pre_match_odds["2"];',
    'const hasOdds = m.pre_match_odds && m.pre_match_odds["1"] && m.pre_match_odds["X"] && m.pre_match_odds["2"];'
)

# Fix AI button link crash when pre_match_odds is somehow undefined but hasOdds passed (just in case)
code = code.replace(
    'oddsHome=${m.pre_match_odds["1"]}&oddsDraw=${m.pre_match_odds["X"]}&oddsAway=${m.pre_match_odds["2"]}',
    'oddsHome=${m.pre_match_odds?.["1"]}&oddsDraw=${m.pre_match_odds?.["X"]}&oddsAway=${m.pre_match_odds?.["2"]}'
)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("hasOdds fixed!")

