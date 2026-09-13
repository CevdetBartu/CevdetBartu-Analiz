import sys; sys.path.append('scripts/scraper'); from sessions import _get; print(str(_get('/sport/football/scheduled-events/2026-08-27'))[:500])
