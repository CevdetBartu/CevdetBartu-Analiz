with open("flash_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
links = re.findall(r'href="([^"]+)"', html)

match_links = [l for l in links if "match" in l or "football" in l or "detail" in l]
print(f"Total match-related links: {len(match_links)}")
for l in match_links[:50]:
    print("  Match link:", l)

# Let's print any text lines that look like a match row
# usually in livesport mobile it looks like:
# class="row-g" or similar
lines = html.split("\n")
row_lines = [line for line in lines if "row" in line or "game" in line or "team" in line]
print(f"Total lines containing row/game/team: {len(row_lines)}")
for rl in row_lines[:30]:
    print("  Line:", rl[:150])
