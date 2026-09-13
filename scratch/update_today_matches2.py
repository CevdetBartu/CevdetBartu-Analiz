import os
import re

fpath = "artifacts/football-app/src/pages/TodayMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Remove KG headers
code = re.sub(r"<th[^>]*>KG Var</th>\s*<th[^>]*>KG Yok</th>", "", code)

# Remove KG cells
code = re.sub(r"<td[^>]*><OddsCell value=\{m\.kg_var\}\s*/></td>\s*<td[^>]*>\{m\.kg_yok \!= null \?.*?</td>", "", code, flags=re.DOTALL)

# Change hasOdds logic
code = re.sub(r"const hasOdds = m\.oran_1 \!= null && m\.oran_x \!= null && m\.oran_2 \!= null;", "const hasOdds = true; // Her zaman analize izin ver", code)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

