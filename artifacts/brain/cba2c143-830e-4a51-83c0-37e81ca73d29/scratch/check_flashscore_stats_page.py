import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We query the stats page of France vs England
url = "https://m.flashscore.com/match/b9l0F3Bj/?t=stats"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Success! Loaded Flashscore match stats page HTML. Size:", len(html))
        
        with open("flashscore_stats.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        # Let's search for statistical rows!
        # Usually they are inside div or table elements
        # Let's look for text containing % or numbers or names like "Possession", "Shots", etc.
        lines = html.split("\n")
        print("Lines with statistics info:")
        for line in lines:
            if "possession" in line.lower() or "shots" in line.lower() or "corner" in line.lower() or "card" in line.lower() or "foul" in line.lower() or "save" in line.lower():
                print("  Line:", line[:150].strip())
                
except Exception as e:
    print("Failed to query match stats:", e)
