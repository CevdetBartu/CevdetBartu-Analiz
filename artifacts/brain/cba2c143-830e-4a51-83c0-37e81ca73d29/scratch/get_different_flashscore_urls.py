import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = {
    "global_mobi": "https://m.flashscore.com/",
    "tr_mobi": "https://m.flashscore.com.tr/",
    "uk_mobi": "https://m.flashscore.co.uk/",
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
}

for name, url in urls.items():
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            html = response.read().decode("utf-8")
            print(f"URL: {name} ({url}) -> Size: {len(html)}")
            if "aberdeen" in html.lower():
                print(f"  FOUND 'Aberdeen' on {name}!")
            else:
                print(f"  'Aberdeen' NOT found on {name}.")
    except Exception as e:
        print(f"Failed {name}: {e}")
