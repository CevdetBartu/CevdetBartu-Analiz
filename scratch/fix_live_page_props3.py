import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """                                          setSelectedMatch({
                                            ...(m.bulletin_props || {}),
                                            homeTeam: m.homeTeam,
                                            awayTeam: m.awayTeam,
                                            league: m.league,
                                            oddsHome: m.bulletin_props?.oddsHome || (m.pre_match_odds?.["1"] ? parseFloat(m.pre_match_odds["1"]) : null),
                                            oddsDraw: m.bulletin_props?.oddsDraw || (m.pre_match_odds?.["X"] ? parseFloat(m.pre_match_odds["X"]) : null),
                                            oddsAway: m.bulletin_props?.oddsAway || (m.pre_match_odds?.["2"] ? parseFloat(m.pre_match_odds["2"]) : null)
                                          });"""

injection = """                                          const b = m.bulletin_props || {};
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
                                          });"""

if target in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Props perfectly mapped!")
else:
    print("Target block not found, let me try a more flexible regex.")
    code = re.sub(
        r"setSelectedMatch\(\{.*?\.\.\.\(m\.bulletin_props \|\| \{\}\).*?oddsAway:[^\n]+\n\s*\}\);",
        injection,
        code,
        flags=re.DOTALL
    )
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Used regex fallback.")

