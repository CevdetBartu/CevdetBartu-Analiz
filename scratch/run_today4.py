import sys; sys.path.append('scripts/scraper'); from sessions import safe_get; data = safe_get('https://api.sofascore.com/api/v1/sport/football/scheduled-events/2026-08-27'); print(str(data)[:500])
