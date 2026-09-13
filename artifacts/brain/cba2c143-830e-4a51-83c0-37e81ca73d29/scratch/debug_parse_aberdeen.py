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
        
        # Let's search for "Aberdeen" in HTML and print its context (200 chars before and after)
        matches = [m.start() for m in re.finditer("Aberdeen", html, re.IGNORECASE)]
        print(f"Total occurrences of 'Aberdeen': {len(matches)}")
        for idx, pos in enumerate(matches):
            print(f"\nOccurrence {idx+1}:")
            print(html[max(0, pos-150):pos+150])
            
except Exception as e:
    print("Error:", e)
