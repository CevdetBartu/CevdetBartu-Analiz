import urllib.request
import ssl
import re
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "https://m.flashscore.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "en-US,en;q=0.9"
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
    html = response.read().decode("utf-8")

# Parse matches from html
pattern = r'<span[^>]*>([^<]*)</span>\s*([^<-]+?)\s*-\s*([^<]+?)\s*<a href="/match/([a-zA-Z0-9]+)/?"[^>]*>([^<]*)</a>'
matches = re.findall(pattern, html)

print(f"Total Flashscore Mobile matches found: {len(matches)}")

for status_raw, home, away, mid, score_str in matches[:3]:
    print(f"\n--- Flashscore Match {mid}: {home.strip()} vs {away.strip()} ---")
    
    # Try fetching match detail page HTML on m.flashscore.com/match/{mid}/
    detail_url = f"https://m.flashscore.com/match/{mid}/"
    req_det = urllib.request.Request(detail_url, headers=headers)
    try:
        with urllib.request.urlopen(req_det, context=ctx, timeout=3) as resp_det:
            det_html = resp_det.read().decode('utf-8')
            print(f"Detail page html length: {len(det_html)}")
            
            # Search for odds or market links inside match detail page
            odds_links = re.findall(r'<a href="([^"]*odds[^"]*)"[^>]*>([^<]*)</a>', det_html)
            print(f"Odds links in detail page: {odds_links}")
            
            # Search for numbers resembling odds (e.g. 1.85, 1.95, 2.10)
            odds_found = re.findall(r'(\d+\.\d{2})', det_html)
            print(f"Sample decimal numbers (potential odds): {odds_found[:15]}")
    except Exception as e:
        print(f"Error fetching match detail page for {mid}: {e}")
