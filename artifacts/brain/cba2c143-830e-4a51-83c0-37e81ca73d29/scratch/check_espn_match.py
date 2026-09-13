import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# ESPN match summary endpoint
url = "https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=401853942"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))
        print("Success! Loaded ESPN Soccer Match Summary.")
        
        # Let's inspect data keys
        print("Keys in summary:", data.keys())
        
        # Statistics are often found in "boxscore" key
        boxscore = data.get("boxscore", {})
        print("Boxscore keys:", boxscore.keys())
        
        # Let's print teams statistics
        teams_stats = boxscore.get("teams", [])
        for t in teams_stats:
            team_name = t.get("team", {}).get("displayName")
            print(f"\nStats for {team_name}:")
            statistics = t.get("statistics", [])
            for stat in statistics:
                print(f"  {stat.get('name')}: {stat.get('displayValue')} (Label: {stat.get('label')})")
                
except Exception as e:
    print("Failed to query ESPN match summary:", e)
