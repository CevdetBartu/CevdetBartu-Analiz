import json
import os

p = "scripts/scraper/telegram_daily_stats.json"
if os.path.exists(p):
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)

    data["tracked_ids"] = [x for x in data.get("tracked_ids", []) if not x.startswith("700")]
    data["hit_ids"] = [x for x in data.get("hit_ids", []) if not x.startswith("700")]
    data["miss_ids"] = [x for x in data.get("miss_ids", []) if not x.startswith("700")]
    data["hits"] = len(data["hit_ids"])
    data["misses"] = len(data["miss_ids"])
    data["total"] = len(data["tracked_ids"])

    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Cleaned 7001-7005 test IDs successfully.")
