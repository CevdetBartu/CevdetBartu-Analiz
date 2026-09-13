import os
import re

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Replace EVERYTHING inside the onClick handler of the analyze button
pattern = r"onClick=\{\(e\) => \{\s*e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*setSelectedMatch\(\{.*?\}\);\s*setModalOpen\(true\);\s*\}\}"

replacement = """onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const b = m.bulletin_props || {};
                                          setSelectedMatch({
                                            homeTeam: m.homeTeam,
                                            awayTeam: m.awayTeam,
                                            league: m.league,
                                            oddsHome: b.oran_1 || (m.pre_match_odds?.["1"] ? parseFloat(m.pre_match_odds["1"]) : null),
                                            oddsDraw: b.oran_x || (m.pre_match_odds?.["X"] ? parseFloat(m.pre_match_odds["X"]) : null),
                                            oddsAway: b.oran_2 || (m.pre_match_odds?.["2"] ? parseFloat(m.pre_match_odds["2"]) : null),
                                            altOdds: b.alt_orani,
                                            ustOdds: b.ust_orani,
                                            varOdds: b.kg_var,
                                            yokOdds: b.kg_yok,
                                            altOdds35: b.alt_orani_35,
                                            ustOdds35: b.ust_orani_35,
                                            iyAltOdds15: b.iy_alt_orani_15,
                                            iyUstOdds15: b.iy_ust_orani_15,
                                            iyAltOdds05: b.iy_alt_orani_05,
                                            iyUstOdds05: b.iy_ust_orani_05,
                                            oran_1_acilis: b.oran_1_acilis,
                                            oran_x_acilis: b.oran_x_acilis,
                                            oran_2_acilis: b.oran_2_acilis,
                                            alt_orani_acilis: b.alt_orani_acilis,
                                            ust_orani_acilis: b.ust_orani_acilis,
                                            kg_var_acilis: b.kg_var_acilis,
                                            kg_yok_acilis: b.kg_yok_acilis,
                                            alt_orani_35_acilis: b.alt_orani_35_acilis,
                                            ust_orani_35_acilis: b.ust_orani_35_acilis
                                          });
                                          setModalOpen(true);
                                        }}"""

if re.search(pattern, code, flags=re.DOTALL):
    code = re.sub(pattern, replacement, code, flags=re.DOTALL)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Foolproof replace SUCCESS!")
else:
    print("Pattern not found!")

