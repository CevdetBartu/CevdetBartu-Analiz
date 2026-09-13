import re
import json

with open("flashscore_stats.html", "r", encoding="utf-8") as f:
    html = f.read()

match = re.search(r'window\.environment\s*=\s*(.*?);?\n', html)
env = json.loads(match.group(1))
feed = env.get("props", {}).get("feed", "")

parts = feed.split("~")

parsed_stats = {}
is_match_section = True # Default to True for the first items if no section is specified yet

for part in parts:
    # Clean control characters
    cleaned = re.sub(r'[^\x20-\x7E]+', '|', part)
    if not cleaned.startswith("|"):
        cleaned = "|" + cleaned
    if not cleaned.endswith("|"):
        cleaned = cleaned + "|"
        
    # Check if this part defines a new section
    # e.g., |SE|Match| or |SE|1st Half|
    if "|SE|" in cleaned:
        if "match" in cleaned.lower():
            is_match_section = True
        else:
            is_match_section = False
            
    if not is_match_section:
        continue
        
    sg_match = re.search(r'\|SG\|([^|]+)\|', cleaned)
    sh_match = re.search(r'\|SH\|([^|]+)\|', cleaned)
    si_match = re.search(r'\|SI\|([^|]+)\|', cleaned)
    
    if sg_match and sh_match and si_match:
        name = sg_match.group(1).strip()
        h_val = sh_match.group(1).strip()
        a_val = si_match.group(1).strip()
        parsed_stats[name] = (h_val, a_val)

print("Parsed stats only for FULL MATCH section:")
for k, v in parsed_stats.items():
    print(f"  {k}: Home = {v[0]}, Away = {v[1]}")
