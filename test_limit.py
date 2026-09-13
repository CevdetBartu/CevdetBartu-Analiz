import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import urllib.request
import urllib.error

data = b'{"targetMatch":{"homeTeam":"A","awayTeam":"B"},"referenceMatches":[' + b','.join([b'{"id":"1"}' for _ in range(30000)]) + b']}'
req = urllib.request.Request('http://localhost/api/analyze', data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.status)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/test_limit.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/test_limit.py')
print("OUT:", out.read().decode('utf-8'))
client.close()
