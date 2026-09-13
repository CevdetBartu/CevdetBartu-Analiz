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

# Add threading import and background task
bg_task = '''
import threading

def update_live_matches_loop():
    while True:
        try:
            data = get_live_matches_data()
            _live_matches_cache["data"] = data
            _live_matches_cache["timestamp"] = time.time()
        except Exception as e:
            logger.error(f"Live fetch error: {e}")
        time.sleep(30)

threading.Thread(target=update_live_matches_loop, daemon=True).start()
'''

# Replace the route logic
old_route = '''@app.get("/live-matches")
def live_matches():
    now = time.time()
    if _live_matches_cache["data"] is None or (now - _live_matches_cache["timestamp"] > 30):
        _live_matches_cache["data"] = get_live_matches_data()
        _live_matches_cache["timestamp"] = time.time()
    return jsonify(_live_matches_cache["data"])'''

new_route = '''@app.get("/live-matches")
def live_matches():
    return jsonify(_live_matches_cache["data"] or [])'''

code = code.replace(old_route, bg_task + '\\n' + new_route)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_server.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_server.py && pm2 restart scraper-bot')
print("OUT:", out.read().decode('utf-8'))
print("ERR:", err.read().decode('utf-8'))
client.close()
