import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Find Similar Matches
d = {'oddsHome': 1.20, 'oddsDraw': 6.50, 'oddsAway': 15.00, 'league': 'Uganda Premier Lig', 'homeTeam': 'Kampala', 'awayTeam': 'Express'}
req = urllib.request.Request(
    'https://185.10.93.73/api/matches/find-similar',
    data=json.dumps(d).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'kargatahmin.com'}
)
res = json.loads(urllib.request.urlopen(req, context=ctx).read())
print(f"Found {len(res)} similar matches")

# 2. Analyze
matches = []
leagues = []
for x in res:
    m = x['match']
    m['id'] = str(m['id'])
    matches.append(m)
    leagues.append(m.get('league', 'MISSING'))

print("Sample leagues:", leagues[:5])

d2 = {'targetMatch': d, 'referenceMatches': matches}
req2 = urllib.request.Request(
    'https://185.10.93.73/api/analyze',
    data=json.dumps(d2).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'kargatahmin.com'}
)
try:
    res2 = json.loads(urllib.request.urlopen(req2, context=ctx).read())
    print(json.dumps(res2.get('analiz_ozet', {}), indent=2, ensure_ascii=False))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
