import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We query match details page of a completed/live match
url = "https://m.flashscore.com/match/Em8zAvto/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Success! Loaded Flashscore match details HTML. Size:", len(html))
        
        with open("flashscore_detail.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        # Search for stats terms
        lines = html.split("\n")
        print("Searching for stats lines in HTML:")
        for line in lines:
            if "%" in line or "possession" in line.lower() or "corner" in line.lower() or "shots" in line.lower() or "stat" in line.lower():
                print("  Line:", line[:150].strip())
                
except Exception as e:
    print("Failed to query match details:", e)
