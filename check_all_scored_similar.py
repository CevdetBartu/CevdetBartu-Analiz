import requests

payload = {
    "oddsHome": 6.50,
    "oddsDraw": 4.33,
    "oddsAway": 1.44,
    "altOdds": 2.70,
    "ustOdds": 1.44,
    "varOdds": 1.87,
    "yokOdds": 2.10,
    "altOdds35": 1.67,
    "ustOdds35": 2.10,
    "maxResults": 15,
    "oddsType": "CLOSING"
}

r = requests.post("http://127.0.0.1:8080/api/matches/find-similar", json=payload)
results = r.json()

print(f"Total returned: {len(results)}")
for idx, res in enumerate(results):
    m = res["match"]
    print(f"{idx+1}: {m['homeTeam']} - {m['awayTeam']} ({m['league']}, {m['matchDate']}) | Source: {m.get('kaynak')} | Score: {res['similarityScore']}")
