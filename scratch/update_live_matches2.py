import os
import re

fpath = "artifacts/football-app/src/pages/LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Remove KG cell
code = re.sub(r"<td[^>]*>\s*<div[^>]*>\s*<div[^>]*>\s*<span[^>]*>VAR</span>\s*<span[^>]*>\{m\.kg_var \?.*?</span>\s*</div>\s*<div[^>]*>\s*<span[^>]*>YOK</span>\s*<span[^>]*>\{m\.kg_yok \?.*?</span>\s*</div>\s*</div>\s*</td>", "", code, flags=re.DOTALL)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

