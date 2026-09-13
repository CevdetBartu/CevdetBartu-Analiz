import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://m.flashscore.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "en-US,en;q=0.9"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Successfully loaded m.flashscore.com HTML.")
        
        # Regex to match the matches
        pattern = r'<span>[^<]*</span>\s*([^<-]+?)\s*-\s*([^<]+?)\s*<a href="/match/([a-zA-Z0-9]+)/?"[^>]*>[^<]*</a>'
        matches = re.findall(pattern, html)
        print(f"Total matches found in HTML: {len(matches)}")
        
        # Let's search for Aberdeen or Queen
        found = False
        for home, away, mid in matches:
            if "aberdeen" in home.lower() or "queen" in home.lower() or "aberdeen" in away.lower() or "queen" in away.lower():
                print(f"FOUND MATCH IN FEED: ID: {mid} | Home: '{home}' | Away: '{away}'")
                found = True
                
        if not found:
            print("Aberdeen or Queen's Park NOT found in the parsed matches.")
            # Let's inspect raw lines containing Aberdeen
            print("\nSearching raw HTML lines for 'Aberdeen':")
            lines = html.split("\n")
            for line in lines:
                if "Aberdeen" in line:
                    print("  Line:", line[:200])
                    
except Exception as e:
    print("Error:", e)
