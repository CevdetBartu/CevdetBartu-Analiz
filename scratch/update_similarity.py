import os
import re

fpath = "artifacts/api-server/src/lib/similarity.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Replace the selection logic at the end of findSimilarMatches
old_logic_start = code.find("const targetSize = 50;")
old_logic_end = code.find("return selectedMatches.slice(0, maxResults);", old_logic_start)

if old_logic_start != -1 and old_logic_end != -1:
    new_logic = """
  // Tüm maçları birleştir ve skora göre sırala
  const combined = [...tier1, ...tier2, ...tier3];
  combined.sort((a, b) => b.similarityScore - a.similarityScore);

  let selectedMatches: SimilarMatchResult[] = [];
  
  // %100 benzerlik
  let results = combined.filter(m => m.similarityScore >= 99.5);
  
  // %95
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 95.0);
  }
  
  // %90
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 90.0);
  }
  
  // %85
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 85.0);
  }

  // Eğer hala yoksa en az %80 olanları alalım (kullanıcıya boş dönmemek için opsiyonel)
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 80.0);
  }

  // İlle 50 maç olmak zorunda değil, ne kadar bulduysa onu alacak.
  // Sadece çok fazla maç varsa arayüzü kasmamak için makul bir max değere (örn 50 veya maxResults) sınırla.
  const maxResults = query.maxResults ?? 50;
  
  selectedMatches = results.slice(0, maxResults);
  
  """
    new_code = code[:old_logic_start] + new_logic + code[old_logic_end:]
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(new_code)
    print("Updated successfully")
else:
    print("Could not find logic blocks")

