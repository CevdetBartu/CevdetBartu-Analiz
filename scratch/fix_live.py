import os

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Fix the strict hasOdds condition to always be true, or at least fallback gracefully.
# Instead of: const hasOdds = m.pre_match_odds && m.pre_match_odds["1"] && ...
code = code.replace(
    "const hasOdds = m.pre_match_odds && m.pre_match_odds[\"1\"] && m.pre_match_odds[\"X\"] && m.pre_match_odds[\"2\"];",
    "const hasOdds = true; // Always allow analysis"
)

# Hide the IY score if it is undefined (so it does not render IY: -)
code = code.replace(
    """<span style={{ fontSize: 11, color: '#64748b' }}>
                                        Y: {m.score_ht_h} - {m.score_ht_a}
                                      </span>""",
    """{m.score_ht_h !== undefined ? (
                                        <span style={{ fontSize: 11, color: '#64748b' }}>
                                          İY: {m.score_ht_h} - {m.score_ht_a}
                                        </span>
                                      ) : null}"""
)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("LiveMatchesPage updated!")

