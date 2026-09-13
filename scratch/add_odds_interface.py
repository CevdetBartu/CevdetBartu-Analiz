import os
import re

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

target = "    status_color: {\n      home: string;\n      away: string;\n    };"
injection = "    status_color: {\n      home: string;\n      away: string;\n    };\n    pre_match_odds?: {\n      \"1\": string;\n      \"X\": string;\n      \"2\": string;\n    };"

if target in code and "pre_match_odds?:" not in code:
    code = code.replace(target, injection)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)
    print("Interface updated!")
else:
    print("Already updated or target not found.")

