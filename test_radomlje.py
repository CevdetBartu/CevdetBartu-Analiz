import json
import urllib.request
import urllib.error

url = 'https://185.10.93.73/api/analyze'
data = {
    "targetMatch": {
        "homeTeam": "Radomlje",
        "awayTeam": "Maribor",
        "league": "Slovenya PrvaLiga",
        "oddsHome": 5.50,
        "oddsDraw": 4.20,
        "oddsAway": 1.45,
        "altOdds": 2.10,
        "ustOdds": 1.60,
        "varOdds": 1.75,
        "yokOdds": 1.85
    },
    "referenceMatches": []
}

find_url = 'https://185.10.93.73/api/matches/find-similar'
find_data = {
    "homeTeam": "Radomlje",
    "awayTeam": "Maribor",
    "league": "Slovenya PrvaLiga",
    "oddsHome": 5.50,
    "oddsDraw": 4.20,
    "oddsAway": 1.45,
    "altOdds": 2.10,
    "ustOdds": 1.60,
    "varOdds": 1.75,
    "yokOdds": 1.85,
    "maxResults": 150
}

import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req1 = urllib.request.Request(find_url, data=json.dumps(find_data).encode('utf-8'), headers={'Content-Type': 'application/json', 'Host': 'kargatahmin.com'})
try:
    resp1 = urllib.request.urlopen(req1, context=ctx)
    similar = json.loads(resp1.read().decode('utf-8'))
    print(f"Found {len(similar)} similar matches.")
    
    # similar is an array of { match: { ... }, similarityScore: ... }
    # but some endpoints return just the array of matches, let's check
    if len(similar) > 0 and 'match' in similar[0]:
        matches = [x["match"] for x in similar]
    else:
        matches = similar
    
    for m in matches:
        if "id" in m:
            m["id"] = str(m["id"])
        if "homeTeam" not in m: m["homeTeam"] = ""
        if "awayTeam" not in m: m["awayTeam"] = ""
        if "ftScore" not in m: m["ftScore"] = m.get("ms_skor", "")
            
    data["referenceMatches"] = matches
        
    req2 = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json', 'Host': 'kargatahmin.com'})
    resp2 = urllib.request.urlopen(req2, context=ctx)
    analysis = json.loads(resp2.read().decode('utf-8'))
    
    with open('radomlje_output.json', 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    print("Analysis saved to radomlje_output.json")
    
except urllib.error.URLError as e:
    print("Error:", e.read().decode('utf-8') if hasattr(e, 'read') else str(e))

