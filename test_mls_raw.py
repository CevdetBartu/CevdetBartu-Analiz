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

# Only print matches from the screenshot to prove the point
targets = ["Charlottesville", "AFC Fylde", "Kjelsas", "Marathon"]

for m in res:
    match = m['match']
    home = match.get('homeTeam', '')
    if any(t in home for t in targets):
        b = m.get('scoreBreakdown', {})
        print(f"League: {match['league']} | {home}")
        print(f"  Raw Score:    {b.get('rawScore', 'N/A')}")
        print(f"  Bonus:        {b.get('contextBonus', 'N/A')}")
        print(f"  Final Score:  {m['similarityScore']}")
        print(f"  Odds:         {match.get('oddsHome')}-{match.get('oddsDraw')}-{match.get('oddsAway')}")
        print("-" * 30)
