import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://1xbet.com/LiveFeed/Get1x2_VZip?sports=1&count=50&mode=4&country=1"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://1xbet.com/"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        res_bytes = response.read()
        print("Success! Response size:", len(res_bytes))
        data = json.loads(res_bytes.decode("utf-8"))
        print("Success! Data loaded from 1xbet Get1x2_VZip.")
        print("Keys in response:", data.keys())
        if "Value" in data:
            print("Number of matches returned:", len(data["Value"]))
            # Print first match sample
            if len(data["Value"]) > 0:
                print("First match sample:", json.dumps(data["Value"][0])[:500])
        success = True
except Exception as e:
    print("Failed to load directly from 1xbet VZip:", e)
    success = False

if not success:
    mirror_url = "https://melbet.com/LiveFeed/Get1x2_VZip?sports=1&count=50&mode=4&country=1"
    req = urllib.request.Request(mirror_url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            res_bytes = response.read()
            data = json.loads(res_bytes.decode("utf-8"))
            print("Success! Data loaded from Melbet mirror VZip.")
            print("Keys in response:", data.keys())
            if "Value" in data:
                print("Number of matches returned:", len(data["Value"]))
    except Exception as e:
        print("Failed to load from Melbet mirror VZip:", e)
