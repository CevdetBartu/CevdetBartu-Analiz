import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query livescores list from t.flashscore.com (live only)
url = "https://t.flashscore.com/?s=1"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "en-US,en;q=0.9"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Success! Loaded t.flashscore.com HTML. Size:", len(html))
        
        # Let's search for match links using regex
        # Format in mobile HTML: /match/[id]/
        matches = re.findall(r'href="/match/([a-zA-Z0-9]+)/"', html)
        print("Unique match IDs found:", len(set(matches)))
        print("First 15 match IDs:", list(set(matches))[:15])
        
except Exception as e:
    print("Failed to load t.flashscore.com:", e)
