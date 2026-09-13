import re
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = """      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: s.match.oran_1,
        oddsDraw: s.match.oran_x,
        oddsAway: s.match.oran_2,"""

injection = """      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: typeof s.match.oran_1 === "string" ? parseFloat(s.match.oran_1) : s.match.oran_1,
        oddsDraw: typeof s.match.oran_x === "string" ? parseFloat(s.match.oran_x) : s.match.oran_x,
        oddsAway: typeof s.match.oran_2 === "string" ? parseFloat(s.match.oran_2) : s.match.oran_2,"""

code = code.replace(target, injection)
with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated coupon.ts parses!")

