with open("m_flashscore.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

# Find the context of one match ID
match_id = "Em8zAvto"
pos = html.find(match_id)
if pos != -1:
    print(f"Context around match {match_id}:")
    print(html[pos - 500:pos + 500])
else:
    print("Match ID not found in raw HTML search")
