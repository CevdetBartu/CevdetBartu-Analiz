import sys

file_path = 'artifacts/api-server/src/lib/scraperDb.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_sig = '''export function queryScraperMatches(
  oddsHome: number,
  oddsDraw: number,
  oddsAway: number,
  oddsType: "OPENING" | "CLOSING" = "CLOSING",
  targetLeague?: string | null
): HistoricalMatch[] {'''

new_sig = '''export function queryScraperMatches(
  oddsHome: number,
  oddsDraw: number,
  oddsAway: number,
  oddsType: "OPENING" | "CLOSING" = "CLOSING",
  targetLeague?: string | null,
  maxLimit: number = 15000
): HistoricalMatch[] {'''

content = content.replace(old_sig, new_sig)
content = content.replace('LIMIT 15000', 'LIMIT ${maxLimit}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Now patch couponWizard.ts
file_path2 = 'artifacts/api-server/src/routes/couponWizard.ts'
with open(file_path2, 'r', encoding='utf-8') as f:
    content2 = f.read()

old_call = '''        const candidates = queryScraperMatches(
          targetMatch.oran_1, 
          targetMatch.oran_x, 
          targetMatch.oran_2, 
          "CLOSING"
        );'''
new_call = '''        const candidates = queryScraperMatches(
          targetMatch.oran_1, 
          targetMatch.oran_x, 
          targetMatch.oran_2, 
          "CLOSING",
          null,
          1000 // Fast scan for wizard
        );'''
content2 = content2.replace(old_call, new_call)

with open(file_path2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Patched query limits successfully')
