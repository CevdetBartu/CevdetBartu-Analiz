import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

paths = ["artifacts/api-server/src", "scripts/scraper"]
for base in paths:
    for root, dirs, files in os.walk(base):
        for f in files:
            if f.endswith(".ts") or f.endswith(".js") or f.endswith(".py"):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8", errors="ignore") as file:
                    lines = file.readlines()
                    for idx, line in enumerate(lines):
                        if "similar" in line.lower() or "benzer" in line.lower() or "limit" in line.lower() or "top_" in line.lower():
                            if ("match" in line.lower() or "mac" in line.lower() or "score" in line.lower()) and len(line.strip()) < 150:
                                print(f"{p}:{idx+1}: {line.strip()}")
