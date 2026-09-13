import urllib.request
import re
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request("https://m.flashscore.com/?s=2", headers={"User-Agent": "Mozilla/5.0"})
try:
    html = urllib.request.urlopen(req, context=ctx).read().decode("utf-8")
    leagues = html.split("<h4>")
    for l in leagues[1:3]:
        for match_chunk in re.split(r"<br />|<br/>", l):
            if "class=\"live\"" in match_chunk:
                print("CHUNK:", match_chunk)
except Exception as e:
    print(e)

