import os

fpath = "artifacts/api-server/src/lib/similarity.ts"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Change gamma from 4.0 to 2.5 to make it more tolerant of tiny decimal differences
code = code.replace("const gamma = 4.0;", "const gamma = 2.0; // Lowered from 4.0 to make strict matching more tolerant of 0.1 decimal differences")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Lowered Gamma successfully!")

