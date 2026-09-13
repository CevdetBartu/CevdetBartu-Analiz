import urllib.request
import re
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://m.flashscore.com/match/Q3zDcxV6/?t=match-summary", headers={"User-Agent": "Mozilla/5.0"})
try:
    html = urllib.request.urlopen(req, context=ctx).read().decode("utf-8")
    import json
    env = re.search(r"window\.environment\s*=\s*(\{.*?\});", html, flags=re.DOTALL)
    if env:
        js = json.loads(env.group(1))
        # dump first 1000 chars of feed
        feed = js.get("props", {}).get("feed", "")
        print("FEED_SUMMARY:", feed[:1000])
except Exception as e:
    print(e)

