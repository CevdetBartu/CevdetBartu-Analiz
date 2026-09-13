import urllib.request
import ssl
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Test match: Morocco W vs Cameroon W (Ail4tIXI) or Copenhagen vs Debrecen (WE22s2T6)
mid = "Ail4tIXI"
url = f"https://m.flashscore.com/match/{mid}/"
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

print("Match Detail HTML length:", len(html))

# Inspect all links on match detail page
links = re.findall(r'<a href="([^"]*)"[^>]*>([^<]*)</a>', html)
print("\nLinks found on match detail page:")
for href, text in links:
    if "odd" in href or "odd" in text.lower() or "over" in text.lower() or "btts" in text.lower():
        print(f"  Href: {href} | Text: {text}")

# Check Flashscore mobile odds URLs structure (e.g. /match/ID/odds/ or /match/ID/?tab=odds)
print("\nTesting odds subpages:")
for sub in ["odds", "odds-comparison", "over-under", "both-teams-to-score"]:
    test_url = f"https://m.flashscore.com/match/{mid}/{sub}/"
    try:
        r = urllib.request.Request(test_url, headers=headers)
        with urllib.request.urlopen(r, context=ctx, timeout=3) as resp:
            content = resp.read().decode('utf-8')
            print(f"  Subpage {sub} returned status {resp.status}, length {len(content)}")
            # Find decimal odds
            odds_nums = re.findall(r'>(\d+\.\d{2})<', content)
            print(f"    Odds found in >X.XX< format: {odds_nums[:10]}")
    except Exception as e:
        print(f"  Subpage {sub} failed: {e}")
