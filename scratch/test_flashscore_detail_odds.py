import urllib.request
import ssl
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "https://m.flashscore.com/match/WE22s2T6/" # FC Copenhagen vs Debrecen
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

print("HTML snippet around odds:")
matches_odds = re.findall(r'<div[^>]*class="[^\"]*odds[^\"]*"[^>]*>.*?</div>|<span[^>]*class="[^\"]*odds[^\"]*"[^>]*>.*?</span>|odds.*?\d+\.\d{2}', html, re.DOTALL | re.IGNORECASE)
print(matches_odds[:10])

# Search for any table or odds div structure
print("\nSearching for odds sections:")
sections = re.findall(r'([^<]{1,30}\d+\.\d{2}[^<]{1,30})', html)
for s in sections[:20]:
    if any(k in s.lower() for k in ['over', 'under', 'yes', 'no', '1', 'x', '2', 'btts', 'goals']):
        print("  Odds block:", s.strip())
