import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import urllib.request
import json
data = b'{"oddsHome": 2.50, "oddsDraw": 3.00, "oddsAway": 2.80, "league": "Premier League"}'
req = urllib.request.Request('http://localhost:8080/api/matches/find-similar', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read())
        print(f"Returned {len(res)} matches")
except Exception as e:
    print("Error:", e)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/test_api.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/test_api.py')
print("OUT:", out.read().decode('utf-8').strip())
client.close()
