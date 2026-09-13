import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

d = {
    'oddsHome': 1.16, 
    'oddsDraw': 5.10, 
    'oddsAway': 6.47, 
    'league': 'ABD MLS NEXT PRO', 
    'homeTeam': 'New York', 
    'awayTeam': 'Cincinnati'
}

req = urllib.request.Request(
    'https://185.10.93.73/api/matches/find-similar',
    data=json.dumps(d).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'kargatahmin.com'}
)

res = json.loads(urllib.request.urlopen(req, context=ctx).read())
print(f"Total matches: {len(res)}")

for i in range(10):
    m = res[i]
    match = m['match']
    print(f"[{i+1}] Score: {m['similarityScore']} | League: {match['league']} | Odds: {match.get('oddsHome')}-{match.get('oddsDraw')}-{match.get('oddsAway')}")
