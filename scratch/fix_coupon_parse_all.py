import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: typeof s.match.oran_1 === "string" ? parseFloat(s.match.oran_1) : s.match.oran_1,
        oddsDraw: typeof s.match.oran_x === "string" ? parseFloat(s.match.oran_x) : s.match.oran_x,
        oddsAway: typeof s.match.oran_2 === "string" ? parseFloat(s.match.oran_2) : s.match.oran_2,
        similarityScore: s.similarityScore
      }));"""

injection = """      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: parseFloat(s.match.oddsHome),
        oddsDraw: parseFloat(s.match.oddsDraw),
        oddsAway: parseFloat(s.match.oddsAway),
        altOdds: s.match.altOdds != null ? parseFloat(s.match.altOdds) : null,
        ustOdds: s.match.ustOdds != null ? parseFloat(s.match.ustOdds) : null,
        varOdds: s.match.varOdds != null ? parseFloat(s.match.varOdds) : null,
        yokOdds: s.match.yokOdds != null ? parseFloat(s.match.yokOdds) : null,
        altOdds35: s.match.altOdds35 != null ? parseFloat(s.match.altOdds35) : null,
        ustOdds35: s.match.ustOdds35 != null ? parseFloat(s.match.ustOdds35) : null,
        iyAltOdds15: s.match.iyAltOdds15 != null ? parseFloat(s.match.iyAltOdds15) : null,
        iyUstOdds15: s.match.iyUstOdds15 != null ? parseFloat(s.match.iyUstOdds15) : null,
        iyAltOdds05: s.match.iyAltOdds05 != null ? parseFloat(s.match.iyAltOdds05) : null,
        iyUstOdds05: s.match.iyUstOdds05 != null ? parseFloat(s.match.iyUstOdds05) : null,
        avgOddsMin: s.match.avgOddsMin != null ? parseFloat(s.match.avgOddsMin) : null,
        avgOddsMax: s.match.avgOddsMax != null ? parseFloat(s.match.avgOddsMax) : null,
        similarityScore: s.similarityScore
      }));"""

code = code.replace(target, injection)
with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated coupon.ts ALL parsing fixed!")

