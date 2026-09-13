import sys; sys.path.append('scripts/scraper'); from sources.today_matches import fetch_today_events; print(len(fetch_today_events()))
