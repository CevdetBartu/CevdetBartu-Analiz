import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Query the Flask Scraper server directly
url = "http://127.0.0.1:5051/live-matches"

try:
    with urllib.request.urlopen(url, context=ctx, timeout=5) as response:
        data = json.loads(response.read().decode("utf-8"))
        print("Scraper returned matches:", len(data))
        if data:
            first_match = data[0]
            print("\nFirst Match details:")
            print("  Teams:", first_match.get("homeTeam"), "vs", first_match.get("awayTeam"))
            print("  Score:", first_match.get("score_h"), "-", first_match.get("score_a"))
            print("  Minute:", first_match.get("minute"))
            print("  Stats Map:", first_match.get("stats"))
            print("  Status Color:", first_match.get("status_color"))
            print("  Pressure info:", first_match.get("pressure"))
            
            # Let's count the colors of all matches
            colors = {}
            for m in data:
                sc = m.get("status_color", {})
                h_col = sc.get("home")
                a_col = sc.get("away")
                colors[h_col] = colors.get(h_col, 0) + 1
                colors[a_col] = colors.get(a_col, 0) + 1
            print("\nColor counts in current active matches:", colors)
except Exception as e:
    print("Failed to query Scraper server:", e)
