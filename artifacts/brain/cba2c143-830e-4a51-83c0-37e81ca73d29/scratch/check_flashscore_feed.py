import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://d.flashscore.com/x/feed/f_1_0_en_1"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.flashscore.com",
    "Referer": "https://www.flashscore.com/",
    "X-Fsys-Referer": "t"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        text = response.read().decode("utf-8")
        print("Success! Loaded Flashscore raw feed. Size:", len(text))
        print("First 1000 characters:")
        print(text[:1000])
except Exception as e:
    print("Failed to query Flashscore raw feed:", e)
