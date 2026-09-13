import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# ESPN Soccer Scoreboard URL
url = "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))
        print("Success! Loaded ESPN Soccer Scoreboard.")
        events = data.get("events", [])
        print(f"Total live/scheduled events returned by ESPN: {len(events)}")
        
        # Look for a match that is live (status type state == "in") or any match
        for idx, event in enumerate(events[:5]):
            print(f"\n--- Match {idx+1}: {event.get('name')} ---")
            print(f"ID: {event.get('id')}")
            status = event.get("status", {}).get("type", {})
            print(f"Status: {status.get('detail')} (State: {status.get('state')})")
            
            # Check if there is details URL
            links = event.get("links", [])
            for link in links:
                if link.get("text") == "Summary":
                    print("Summary link:", link.get("href"))
                    
            # Let's inspectcompetitions
            competitions = event.get("competitions", [])
            for comp in competitions:
                competitors = comp.get("competitors", [])
                for team in competitors:
                    print(f"Team: {team.get('team', {}).get('displayName')} - Score: {team.get('score')}")
                    
except Exception as e:
    print("Failed to query ESPN:", e)
