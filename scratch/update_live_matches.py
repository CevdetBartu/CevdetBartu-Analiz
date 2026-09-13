import os
import re

fpath = "artifacts/football-app/src/pages/LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Remove KG VAR / YOK header
code = re.sub(r"<th[^>]*>KG VAR / YOK</th>", "", code)

# Remove KG cell
code = re.sub(r"<td style=\{\{\s*padding:\s*'12px 16px',\s*textAlign:\s*'center'\s*\}\}>\s*<div[^>]*>\s*<OddsCell value=\{m\.kg_var\}\s*/>\s*<OddsCell value=\{m\.kg_yok\}\s*/>\s*</div>\s*</td>", "", code, flags=re.DOTALL)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

