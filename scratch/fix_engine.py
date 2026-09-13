import re
fpath = "artifacts/api-server/src/lib/analyzeEngine.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# The target row push starts with id: 'target'
code = re.sub(
    r"id: 'target',\s*is_target: true,\s*analiz_yuzde: \(m as any\)\.similarityScore \? `%[^`]+` : analiz_yuzde_str,",
    "id: 'target',\\n      is_target: true,\\n      analiz_yuzde: analiz_yuzde_str,",
    code
)
# Let's just use string replace just to be sure
code = code.replace("id: 'target',\n      is_target: true,\n      analiz_yuzde: (m as any).similarityScore ? `%${(m as any).similarityScore}` : analiz_yuzde_str,", "id: 'target',\n      is_target: true,\n      analiz_yuzde: analiz_yuzde_str,")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Fixed!")

