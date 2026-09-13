with open("flashscore_stats.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

# Find the window.environment line
match = re.search(r'window\.environment\s*=\s*(.*?);?\n', html)
if match:
    env_str = match.group(1)
    print("Found window.environment!")
    print("Length:", len(env_str))
    # Print the first 2000 chars of env_str
    print(env_str[:2000])
else:
    print("window.environment not found!")
