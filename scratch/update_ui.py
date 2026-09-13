import os
import re

# 1. Update analyzeEngine.ts
engine_path = "artifacts/api-server/src/lib/analyzeEngine.ts"
with open(engine_path, "r", encoding="utf-8") as f:
    engine_code = f.read()

# Add similarityScore to AnalyzeRefMatch
engine_code = engine_code.replace(
    "export interface AnalyzeRefMatch {",
    "export interface AnalyzeRefMatch {\n  similarityScore?: number;"
)

# Update tablo_satirlari creation for reference matches
engine_code = engine_code.replace(
    "analiz_yuzde: analiz_yuzde_str,",
    "analiz_yuzde: (m as any).similarityScore ? `%${(m as any).similarityScore}` : analiz_yuzde_str,"
)
# Revert the first one (for target match)
engine_code = engine_code.replace(
    "id: 'target',\n      is_target: true,\n      analiz_yuzde: (m as any).similarityScore ? `%${(m as any).similarityScore}` : analiz_yuzde_str,",
    "id: 'target',\n      is_target: true,\n      analiz_yuzde: analiz_yuzde_str,"
)

with open(engine_path, "w", encoding="utf-8") as f:
    f.write(engine_code)


# 2. Update AnalysisModal.tsx to pass similarityScore
modal_path = "artifacts/football-app/src/components/AnalysisModal.tsx"
with open(modal_path, "r", encoding="utf-8") as f:
    modal_code = f.read()

modal_code = modal_code.replace(
    "const m = res.match;\n              return {\n                ...m,",
    "const m = res.match;\n              return {\n                ...m,\n                similarityScore: res.similarityScore,"
)

with open(modal_path, "w", encoding="utf-8") as f:
    f.write(modal_code)


# 3. Update AnalysisTable.tsx to remove useless columns
table_path = "artifacts/football-app/src/components/AnalysisTable.tsx"
with open(table_path, "r", encoding="utf-8") as f:
    table_code = f.read()

# Remove headers
table_code = re.sub(r'<th className="th-prev">Önceki</th>', "", table_code)
table_code = re.sub(r'<th className="th-flag">🚩</th>', "", table_code)
table_code = re.sub(r'<th className="th-cards col-highlight">Card</th>', "", table_code)
table_code = re.sub(r'<th className="th-korner col-highlight">Korner</th>', "", table_code)
table_code = re.sub(r'<th className="th-im">i/m</th>', "", table_code)
# Remove columns
table_code = re.sub(r'{/\* Önceki \*/}\s*<td className="td-prev">.*?</td>', "", table_code, flags=re.DOTALL)
table_code = re.sub(r'{/\* Flag \*/}\s*<td className="td-flag">.*?</td>', "", table_code, flags=re.DOTALL)
table_code = re.sub(r'{/\* Cards \*/}\s*<td className="`td-cards.*?</td>', "", table_code, flags=re.DOTALL)
table_code = re.sub(r'{/\* Korner \*/}\s*<td className="td-korner.*?</td>', "", table_code, flags=re.DOTALL)
table_code = re.sub(r'{/\* i/m \*/}\s*<td className="`td-im.*?</td>', "", table_code, flags=re.DOTALL)

with open(table_path, "w", encoding="utf-8") as f:
    f.write(table_code)
print("Updated all files!")

