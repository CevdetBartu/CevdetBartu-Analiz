import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "http://localhost:8080/api/matches/find-similar"
payload = json.dumps({
    "data": {
        "oddsHome": 7.61,
        "oddsDraw": 4.40,
        "oddsAway": 1.45
    }
}).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"API Search with {{ data: ... }} wrapper successful! Total returned: {len(data)}")
        print("\nTop 5 similar historical matches from SQLite DB (PURE REAL SCRAPED ODDS):")
        for res in data[:5]:
            m = res.get('match', {})
            score = res.get('similarityScore', 0)
            print(f"  [{score}%] {m.get('matchDate')} | {m.get('homeTeam')} vs {m.get('awayTeam')} | 1X2: {m.get('oddsHome')}-{m.get('oddsDraw')}-{m.get('oddsAway')} | 2.5: {m.get('altOdds')}-{m.get('ustOdds')} | KG: {m.get('varOdds')}-{m.get('yokOdds')}")
except Exception as e:
    print("API similarity error:", e)
