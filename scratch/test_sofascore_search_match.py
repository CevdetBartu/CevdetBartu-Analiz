import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

# 1. Search for Atletico GO on SofaScore
search_url = "https://api.sofascore.com/api/v1/search/all?q=Atletico%20GO"
try:
    req = urllib.request.Request(search_url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        results = data.get('results', [])
        print("SofaScore Search Results count:", len(results))
        for r in results[:5]:
            print("  Search item:", r.get('type'), r.get('entity', {}).get('name'), "ID:", r.get('entity', {}).get('id'))
except Exception as e:
    print("SofaScore Search error:", e)

# 2. Check Mackolik / Iddaa odds API or Flashscore feed
feed_url = "https://www.flashscore.com/x/feed/d_1_en_1"
try:
    headers_fs = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "X-FSOdds": "1"
    }
    req_fs = urllib.request.Request(feed_url, headers=headers_fs)
    with urllib.request.urlopen(req_fs, context=ctx, timeout=5) as resp:
        txt = resp.read().decode('utf-8', errors='ignore')
        print(f"\nFlashscore feed length: {len(txt)}")
        # Check if odds data is inside feed
        odds_in_feed = [line for line in txt.split('~') if "odds" in line.lower() or "over" in line.lower() or "btts" in line.lower()]
        print(f"Sample odds lines in feed: {odds_in_feed[:5]}")
except Exception as e:
    print("Flashscore feed error:", e)
