import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
file_path = '/var/www/futbol_app/scraper/server.py'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

import re

# We will modify the live_matches route to block if cache is None
old_route = '''@app.get("/live-matches")
def live_matches():
    return jsonify(_live_matches_cache["data"] or [])'''

new_route = '''@app.get("/live-matches")
def live_matches():
    # If not ready yet, wait up to 30 seconds
    wait_time = 0
    while _live_matches_cache["data"] is None and wait_time < 30:
        time.sleep(1)
        wait_time += 1
    return jsonify(_live_matches_cache["data"] or [])'''

code = code.replace(old_route, new_route)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_server2.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_server2.py && pm2 restart scraper-bot')
print("OUT:", out.read().decode('utf-8'))
client.close()
