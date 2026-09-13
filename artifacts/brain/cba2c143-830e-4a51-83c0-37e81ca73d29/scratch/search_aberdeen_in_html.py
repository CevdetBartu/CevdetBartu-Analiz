with open("flash_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

# Case-insensitive search for Aberdeen
aberdeen_matches = re.findall(r'.{0,100}Aberdeen.{0,100}', html, re.IGNORECASE)
print(f"Total lines containing 'Aberdeen': {len(aberdeen_matches)}")
for idx, m in enumerate(aberdeen_matches[:10]):
    print(f"  Match {idx+1}: {m}")
    
# Case-insensitive search for Queen's Park
queens_matches = re.findall(r'.{0,100}Queen.{0,100}', html, re.IGNORECASE)
print(f"Total lines containing 'Queen': {len(queens_matches)}")
for idx, m in enumerate(queens_matches[:10]):
    print(f"  Match {idx+1}: {m}")
