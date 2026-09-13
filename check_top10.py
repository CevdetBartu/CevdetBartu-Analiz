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

for m in res[:10]:
    b = m.get('scoreBreakdown', {})
    print(f"League: {m['match']['league']}")
    print(f"  Raw: {b.get('rawScore')} | Bonus: {b.get('contextBonus')} | Final: {m['similarityScore']}")
