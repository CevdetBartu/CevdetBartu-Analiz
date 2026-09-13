import json
import os

p = "scripts/scraper/telegram_daily_stats.json"
if os.path.exists(p):
    with open(p, "r", encoding="utf-8") as f:
        print(json.dumps(json.load(f), indent=2, ensure_ascii=False))
else:
    print("file does not exist")
