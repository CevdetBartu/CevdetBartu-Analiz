import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "http://127.0.0.1:5173/api/today-matches"
try:
    with urllib.request.urlopen(url, context=ctx, timeout=5) as response:
        data = json.loads(response.read().decode("utf-8"))
        matches = data.get("matches", [])
        if matches:
            first = matches[0]
            print("First match raw odds fields from API:")
            for k in ["oran_1", "oran_x", "oran_2", "alt_orani", "ust_orani", "kg_var", "kg_yok"]:
                val = first.get(k)
                print(f"  {k}: {val} (type: {type(val)})")
except Exception as e:
    print("Error:", e)
