import sys
sys.path.insert(0, 'scripts/scraper')
from sources.live_matches import get_live_matches_data
matches = get_live_matches_data()
print(f"Got {len(matches)} matches")
if matches:
    m = matches[0]
    print(f"First match: {m['home']} vs {m['away']} in {m['country']} - {m['league']}")
