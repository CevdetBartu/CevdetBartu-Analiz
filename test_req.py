import urllib.request, ssl, json, sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://kargatahmin.com/api/auth/register',
    data=json.dumps({'email': 'mytest@test.com', 'password': 'mypassword123', 'kvkk': True}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req, context=ctx)
    print("REG SUCCESS:", res.read().decode())
except Exception as e:
    print("REG ERROR:", e.read().decode() if hasattr(e, 'read') else str(e))

req2 = urllib.request.Request(
    'https://kargatahmin.com/api/auth/login',
    data=json.dumps({'email': 'mytest@test.com', 'password': 'mypassword123'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    res2 = urllib.request.urlopen(req2, context=ctx)
    print("LOG SUCCESS:", res2.read().decode()[:50] + "...")
except Exception as e:
    print("LOG ERROR:", e.read().decode() if hasattr(e, 'read') else str(e))
