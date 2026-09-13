import sys
import os
import datetime

sys.path.insert(0, os.path.abspath("scripts/scraper"))
from sources.today_matches import run_today_scrape

target_date = datetime.date(2026, 7, 24)
print(f"Fetching bulletin for {target_date}...")
res = run_today_scrape(target_date)
print(f"Scrape result: {res}")
