with open("flashscore_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
links = re.findall(r'href="([^"]+)"', html)
print("All links in detail HTML:")
for l in links:
    print("  Link:", l)
