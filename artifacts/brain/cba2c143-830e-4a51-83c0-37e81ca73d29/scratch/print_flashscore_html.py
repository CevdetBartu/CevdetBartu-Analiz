import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://t.flashscore.com/?s=1"
headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "en-US,en;q=0.9"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        
        # Save html to scratch folder to view it
        with open("flash_sample.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("Success! HTML saved to flash_sample.html.")
        
        # Search for any alphanumeric patterns of length 8 in IDs or classes or hrefs
        # Let's inspect some lines containing "id=" or "class="
        lines = html.split("\n")
        print(f"Total lines: {len(lines)}")
        
        # Let's search for lines containing soccer or matches
        for line in lines:
            if "id=\"g_" in line or "href=" in line:
                print("Found match line:", line[:200])
                break
                
except Exception as e:
    print("Failed:", e)
