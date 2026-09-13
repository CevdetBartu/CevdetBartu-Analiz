import re
import json

with open("flashscore_stats.html", "r", encoding="utf-8") as f:
    html = f.read()

# Extract window.environment JSON
match = re.search(r'window\.environment\s*=\s*(.*?);?\n', html)
env = json.loads(match.group(1))
feed = env.get("props", {}).get("feed", "")

print("Raw feed snippet:", feed[:300])

# Split feed by ~
parts = feed.split("~")

parsed_stats = {}

for part in parts:
    # Replace non-printable/control chars with |
    # We keep standard chars, numbers, spaces, %, (), ., -
    cleaned = re.sub(r'[^\x20-\x7E]+', '|', part)
    # Ensure it starts and ends with |
    if not cleaned.startswith("|"):
        cleaned = "|" + cleaned
    if not cleaned.endswith("|"):
        cleaned = cleaned + "|"
        
    # Search for SG (stat name), SH (home val), SI (away val)
    sg_match = re.search(r'\|SG\|([^|]+)\|', cleaned)
    sh_match = re.search(r'\|SH\|([^|]+)\|', cleaned)
    si_match = re.search(r'\|SI\|([^|]+)\|', cleaned)
    
    if sg_match and sh_match and si_match:
        name = sg_match.group(1).strip()
        home_val = sh_match.group(1).strip()
        away_val = si_match.group(1).strip()
        parsed_stats[name] = (home_val, away_val)

print("\nParsed Stats Map:")
for k, v in parsed_stats.items():
    print(f"  {k}: Home = {v[0]}, Away = {v[1]}")
