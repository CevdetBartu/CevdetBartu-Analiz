import sys
import os

# Insert absolute path of scraper directory
sys.path.append("c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\scripts\\scraper")

from sources.live_matches import get_live_matches_data

print("Fetching live matches data from scraper...")
matches = get_live_matches_data()

print(f"Total live matches returned: {len(matches)}")

found = False
for m in matches:
    if "aberdeen" in m["homeTeam"].lower() or "aberdeen" in m["awayTeam"].lower():
        found = True
        print(f"\n--- Aberdeen match found in API output! ---")
        print("Home Team:", m["homeTeam"])
        print("Away Team:", m["awayTeam"])
        print("Score:", m["score_h"], "-", m["score_a"])
        print("Stats:")
        for k, v in m["stats"].items():
            print(f"  {k}: {v}")
            
if not found:
    print("Aberdeen match NOT found in active matches returned by API.")
