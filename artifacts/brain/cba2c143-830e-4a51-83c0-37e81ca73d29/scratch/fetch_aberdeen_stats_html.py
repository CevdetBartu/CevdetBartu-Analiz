import urllib.request
import re
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://m.flashscore.com/match/be5MtAMH/?t=stats"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        
        match = re.search(r'window\.environment\s*=\s*(.*?);?\n', html)
        if not match:
            print("Failed to find window.environment in html.")
            exit(1)
            
        env = json.loads(match.group(1))
        feed = env.get("props", {}).get("feed", "")
        
        parts = feed.split("~")
        
        # Test 1: Old way (all parts overwrite)
        old_stats = {}
        for part in parts:
            cleaned = re.sub(r'[^\x20-\x7E]+', '|', part)
            if not cleaned.startswith("|"): cleaned = "|" + cleaned
            if not cleaned.endswith("|"): cleaned = cleaned + "|"
            sg_match = re.search(r'\|SG\|([^|]+)\|', cleaned)
            sh_match = re.search(r'\|SH\|([^|]+)\|', cleaned)
            si_match = re.search(r'\|SI\|([^|]+)\|', cleaned)
            if sg_match and sh_match and si_match:
                name = sg_match.group(1).strip()
                h_val = sh_match.group(1).strip()
                a_val = si_match.group(1).strip()
                old_stats[name] = (h_val, a_val)
                
        # Test 2: New way (only MATCH section)
        new_stats = {}
        is_match_section = True
        for part in parts:
            cleaned = re.sub(r'[^\x20-\x7E]+', '|', part)
            if not cleaned.startswith("|"): cleaned = "|" + cleaned
            if not cleaned.endswith("|"): cleaned = cleaned + "|"
            
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
                new_stats[name] = (h_val, a_val)
                
        print("OLD WAY STATS (may overwrite with 2nd half):")
        for k, v in old_stats.items():
            print(f"  {k}: {v[0]} - {v[1]}")
            
        print("\nNEW WAY STATS (MATCH section only):")
        for k, v in new_stats.items():
            print(f"  {k}: {v[0]} - {v[1]}")
            
except Exception as e:
    print("Error:", e)
