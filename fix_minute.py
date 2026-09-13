with open('scripts/scraper/sources/live_matches.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"minute": str(minute),', '"minute": minute,')

with open('scripts/scraper/sources/live_matches.py', 'w', encoding='utf-8') as f:
    f.write(content)
