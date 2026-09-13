with open("m_flashscore.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

# Regex to match the livescore row
# Format: <span>10:00</span>Western City Rangers - Newcastle Jets U23 <a href="/match/Em8zAvto/" class="fin">3-2</a><br />
pattern = r'<span>[^<]*</span>\s*([^<-]+?)\s*-\s*([^<]+?)\s*<a href="/match/([a-zA-Z0-9]+)/?"[^>]*>[^<]*</a>'

matches = re.findall(pattern, html)
print(f"Total parsed matches: {len(matches)}")
for home, away, mid in matches[:20]:
    print(f"Match ID: {mid} -> {home.strip()} vs {away.strip()}")
