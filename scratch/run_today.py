import sys; sys.path.append('scripts/scraper'); from sources.today_matches import run_today_scrape; import datetime; print(run_today_scrape(datetime.date(2026, 8, 27)))
