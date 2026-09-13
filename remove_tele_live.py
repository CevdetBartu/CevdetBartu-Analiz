with open('scripts/scraper/sources/live_matches.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Remove the try/except telegram_bot block
content = re.sub(r'\s*try:\s*from telegram_bot import broadcast_live_alarms\s*broadcast_live_alarms\(results\)\s*except Exception as e:\s*logger\.error\(f"Error broadcasting telegram alarms: \{e\}"\)', '', content)

with open('scripts/scraper/sources/live_matches.py', 'w', encoding='utf-8') as f:
    f.write(content)
