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
    "maxResults": 100,
    "oddsType": "CLOSING"
}

r = requests.post("http://127.0.0.1:8080/api/matches/find-similar", json=payload)
results = r.json()

print(f"Total returned: {len(results)}")
sofascore_count = sum(1 for res in results if res["match"].get("league") and res["match"].get("id") < 100000) # SQLite matches usually have smaller IDs than PG serial
sources = [res["match"].get("kaynak") for res in results]
print("Unique sources in results:", set(sources))

# Let's inspect the first 15 results
for idx, res in enumerate(results[:20]):
    m = res["match"]
    # Check if this match has altOdds35 or varOdds
    print(f"{idx+1}: {m['homeTeam']} - {m['awayTeam']} | ID: {m.get('id')} | League: {m['league']} | Score: {res['similarityScore']} | altOdds35: {m.get('altOdds35')} | varOdds: {m.get('varOdds')}")
