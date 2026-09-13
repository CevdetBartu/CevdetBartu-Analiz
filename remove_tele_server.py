with open('scripts/scraper/server.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'\s*try:\s*from telegram_bot import start_telegram_bot_background\s*start_telegram_bot_background\(\)\s*except Exception as e:\s*logger\.error\(f"Failed to start telegram bot thread: \{e\}"\)', '', content)

with open('scripts/scraper/server.py', 'w', encoding='utf-8') as f:
    f.write(content)
