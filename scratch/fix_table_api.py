import os
import re

# 1. Update analyze.ts to map similarityScore
route_path = "artifacts/api-server/src/routes/analyze.ts"
with open(route_path, "r", encoding="utf-8") as f:
    route_code = f.read()

route_code = route_code.replace(
    "id:              m.id              ?? null,",
    "id:              m.id              ?? null,\n      similarityScore: (req.body.referenceMatches?.[idx] as any)?.similarityScore ?? null,"
)
with open(route_path, "w", encoding="utf-8") as f:
    f.write(route_code)

# 2. Fix AnalysisTable.tsx to remove td-cards and td-im properly
table_path = "artifacts/football-app/src/components/AnalysisTable.tsx"
with open(table_path, "r", encoding="utf-8") as f:
    table_code = f.read()

table_code = re.sub(r'{/\* Cards \*/}\s*<td className={`td-cards.*?</td>', "", table_code, flags=re.DOTALL)
table_code = re.sub(r'{/\* i/m \*/}\s*<td className={`td-im.*?</td>', "", table_code, flags=re.DOTALL)

with open(table_path, "w", encoding="utf-8") as f:
    f.write(table_code)

print("Fixed route and table!")

