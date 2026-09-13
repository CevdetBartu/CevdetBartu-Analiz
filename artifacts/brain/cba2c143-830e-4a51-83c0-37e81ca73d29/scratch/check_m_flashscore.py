import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# m.flashscore.com is the lightweight mobile version of Flashscore
url = "https://m.flashscore.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        html = response.read().decode("utf-8")
        print("Success! Loaded m.flashscore.com HTML. Size:", len(html))
        print("First 1000 characters:")
        print(html[:1000])
        
        # Save to scratch to view
        with open("m_flashscore.html", "w", encoding="utf-8") as f:
            f.write(html)
            
except Exception as e:
    print("Failed to query m.flashscore.com:", e)
