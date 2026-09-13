import sys
import os

curr_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(curr_dir, ".."))
scraper_dir = os.path.join(parent_dir, "scripts", "scraper")
sys.path.append(scraper_dir)

from db import clean_zero_odds_leagues, get_stats

print("Running Zero-Odds League Purge...")
deleted = clean_zero_odds_leagues()
print(f"Purged {deleted} matches from zero-odds leagues!")

stats = get_stats()
print(f"Database Stats After Purge:")
print(f"  - Total Matches: {stats['total_mac']}")
print(f"  - Matches with Odds: {stats['oranli_mac']}")
print(f"  - Total Active Leagues: {len(stats['ligler'])}")
