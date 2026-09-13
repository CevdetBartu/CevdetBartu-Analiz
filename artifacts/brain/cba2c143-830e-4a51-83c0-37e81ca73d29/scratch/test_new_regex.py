import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://m.flashscore.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        
        # Test new regex
        new_pattern = r'<span[^>]*>[^<]*</span>\s*([^<-]+?)\s*-\s*([^<]+?)\s*<a href="/match/([a-zA-Z0-9]+)/?"[^>]*>[^<]*</a>'
        matches = re.findall(new_pattern, html)
        print("Total matches parsed with NEW regex:", len(matches))
        
        # Look for Aberdeen
        found = False
        for home, away, mid in matches:
            if "aberdeen" in home.lower() or "queen" in home.lower():
                print(f"FOUND: ID: {mid} | Home: '{home.strip()}' | Away: '{away.strip()}'")
                found = True
        if not found:
            print("Aberdeen not found with new regex.")
            
except Exception as e:
    print("Error:", e)
