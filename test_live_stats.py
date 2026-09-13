import requests
import re
import json

match_id = '63Dqw6Ot'
stats_url = f"https://m.flashscore.com/match/{match_id}/?t=stats"
r = requests.get(stats_url, headers={'User-Agent': 'Mozilla/5.0'})
print(r.status_code)
env_match = re.search(r'window\.environment\s*=\s*(.*?);<\/script>', r.text)
if env_match:
    env_data = json.loads(env_match.group(1))
    feed = env_data.get("props", {}).get("feed", "")
    print(feed[:200])
else:
    print('No env matched!')
