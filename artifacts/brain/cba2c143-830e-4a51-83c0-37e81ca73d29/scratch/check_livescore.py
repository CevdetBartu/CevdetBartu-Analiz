import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Livescore.com public API for live matches
# 3 is the timezone offset for Turkey (+3)
url = "https://prod-public-api.livescore.com/v1/api/app/stage/soccer/live/3"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))
        print("Success! Loaded Livescore.com Live Matches.")
        print("Keys in response:", data.keys())
        stages = data.get("Stages", [])
        print(f"Total stages (leagues) returned: {len(stages)}")
        
        # Count total matches
        total_matches = 0
        for stage in stages:
            events = stage.get("Events", [])
            total_matches += len(events)
            
        print(f"Total live matches: {total_matches}")
        
        # Let's inspect the first event
        if stages and stages[0].get("Events"):
            first_event = stages[0]["Events"][0]
            print("\nFirst Event Sample:")
            print("  ID:", first_event.get("Eid"))
            print("  Home Team:", first_event.get("T1", [{}])[0].get("Nm"))
            print("  Away Team:", first_event.get("T2", [{}])[0].get("Nm"))
            print("  Score:", first_event.get("Tr1"), "-", first_event.get("Tr2"))
            
except Exception as e:
    print("Failed to query Livescore.com:", e)
