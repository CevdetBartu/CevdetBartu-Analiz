import re

with open("flash_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

print("HTML length:", len(html))

# Let's find some links
links = re.findall(r'href="([^"]+)"', html)
print(f"Total href links: {len(links)}")
for l in links[:30]:
    print("  Link:", l)

# Let's find any occurrences of ID attributes
ids = re.findall(r'id="([^"]+)"', html)
print(f"Total id attributes: {len(ids)}")
for i in ids[:30]:
    print("  ID:", i)

# Flashscore IDs are often in a JS variable called "game_zip" or in elements with id="g_1_..."
# Let's search for "g_1_" in the html
g_1_finds = re.findall(r'g_1_[a-zA-Z0-9]+', html)
print(f"Total g_1_ matches: {len(g_1_finds)}")
print("Sample g_1_ matches:", g_1_finds[:10])

# Let's search for script tags containing feed data
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")
for idx, s in enumerate(scripts):
    if "cjsData" in s or "game" in s or "feed" in s or "data" in s:
        print(f"Script {idx} length: {len(s)}")
        print("  Snippet:", s[:300])
