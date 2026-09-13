import os
import re

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Replace the span containing score_ht_h
code = re.sub(
    r"<span style={{ fontSize: 11, color: '#64748b' }}>\s*[^<]+m\.score_ht_h[^<]+</span>",
    "{m.score_ht_h !== undefined && m.score_ht_h !== null ? (<span style={{ fontSize: 11, color: '#64748b' }}>İY: {m.score_ht_h} - {m.score_ht_a}</span>) : null}",
    code
)

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Regex replace applied!")

