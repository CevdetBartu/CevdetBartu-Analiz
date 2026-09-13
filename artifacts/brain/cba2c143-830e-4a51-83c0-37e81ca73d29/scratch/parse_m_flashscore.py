with open("m_flashscore.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

# In m.flashscore.com, leagues are inside div or h4 elements
# Matches are usually in elements containing links to match details
# Let's find all hrefs in the format: /match/[id]/
match_links = re.findall(r'href="/match/([a-zA-Z0-9]+)/?"', html)
print(f"Total match links found: {len(match_links)}")
print("Sample match links:", match_links[:10])

# Let's inspect some blocks in HTML around match links to see team names
# Usually format is:
# <a href="/match/XXXXX/">Home Team - Away Team</a>
# or similar
for link in list(set(match_links))[:10]:
    # find the text inside the anchor tag
    pattern = rf'href="/match/{link}/?"[^>]*>(.*?)</a>'
    matches = re.findall(pattern, html, re.DOTALL)
    if matches:
        print(f"Match ID: {link} -> Content: {matches[0].strip()}")
