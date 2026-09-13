import sys, datetime; sys.path.append('scripts/scraper'); from sources.today_matches import fetch_mackolik_events; rows = fetch_mackolik_events(); print(len(rows)); print(rows[0] if rows else 'None')
