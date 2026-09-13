import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We query match details page of France vs England
url = "https://m.flashscore.com/match/b9l0F3Bj/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Success! Loaded Flashscore major match details HTML. Size:", len(html))
        
        with open("flashscore_major_detail.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        # Print all links in this HTML
        import re
        links = re.findall(r'href="([^"]+)"', html)
        print("All links in major detail HTML:")
        for l in links:
            print("  Link:", l)
            
except Exception as e:
    print("Failed to query major match details:", e)
