with open("flash_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

import re
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)

for idx, s in enumerate(scripts):
    if len(s) > 100000: # Very long script
        print(f"Script {idx} length: {len(s)}")
        print("First 2000 chars of script:")
        print(s[:2000])
        print("\nLast 1000 chars of script:")
        print(s[-1000:])
