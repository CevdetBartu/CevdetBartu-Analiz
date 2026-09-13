import os

fpath = "artifacts/api-server/src/lib/similarity.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

old_block = """  // Eğer hala yoksa en az %80 olanları alalım (kullanıcıya boş dönmemek için opsiyonel)
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 80.0);
  }"""

new_block = """  // Eğer hala yoksa en az %80 olanları alalım
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 80.0);
  }

  // Son sınır: %75
  if (results.length === 0) {
    results = combined.filter(m => m.similarityScore >= 75.0);
  }"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated to 75% limit successfully!")
else:
    print("Could not find the block. Checking alternative...")
    # Let's try regex if exact string mismatch

