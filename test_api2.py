import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import urllib.request
import json
data = b'{"oddsHome": 1.15, "oddsDraw": 8.20, "oddsAway": 14.60, "league": "Ispanya LaLiga"}'
req = urllib.request.Request('http://localhost:8080/api/matches/find-similar', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read())
        print(f"Returned {len(res)} matches")
        for r in res[:5]:
            print(r['similarityScore'])
except Exception as e:
    print("Error:", e)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/test_api2.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/test_api2.py')
print("OUT:", out.read().decode('utf-8').strip())
client.close()
