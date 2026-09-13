import sys

file_path = "artifacts/api-server/src/lib/similarity.ts"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "let selectedMatches: SimilarMatchResult[] = [];" in line:
        skip = True
        new_lines.append("  // Sadece ama sadece %100 benzerlik gösteren maçları al\n")
        new_lines.append("  const results = combined.filter(m => Math.round(m.similarityScore) === 100);\n")
        new_lines.append("\n")
        new_lines.append("  // Maximum 20 adet olacak şekilde sınırla\n")
        new_lines.append("  const maxResults = Math.min(query.maxResults ?? 20, 20);\n")
        new_lines.append("  \n")
        new_lines.append("  return results.slice(0, maxResults);\n")
        new_lines.append("}\n")
        continue
    
    if skip and line.strip() == "}":
        skip = False
        continue
        
    if not skip:
        new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Patched successfully")
