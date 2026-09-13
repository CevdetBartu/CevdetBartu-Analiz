import os

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\Home.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Fix the /manuel link
code = code.replace("href=\"/manuel\"", "href=\"/\"")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Links fixed!")

