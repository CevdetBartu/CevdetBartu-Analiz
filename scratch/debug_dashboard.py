import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "http://localhost:8080/api/matches/find-similar"

payload = json.dumps({
    "oddsHome": 2.15,
    "oddsDraw": 3.40,
    "oddsAway": 3.00,
    "homeTeam": "Atlanta United 2",
    "awayTeam": "New York Red Bulls II",
    "oddsType": "CLOSING"
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print(f"Total Matches returned for Atlanta United 2: {len(res)}")
        print("\nAll 20 matches in AI table for Atlanta United 2:")
        for idx, res_item in enumerate(res, 1):
            hm = res_item.get('match', {})
            score = res_item.get('similarityScore')
            print(f"{idx:2d}. [{hm.get('matchDate')}] {hm.get('homeTeam')} {hm.get('ftScore')} (HT: {hm.get('htScore')}) {hm.get('awayTeam')} | MS1: {hm.get('oddsHome')} MSX: {hm.get('oddsDraw')} MS2: {hm.get('oddsAway')} | Sim: {score}%")
except Exception as e:
    print("Debug error:", e)
