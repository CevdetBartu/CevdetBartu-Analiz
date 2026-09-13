import paramiko
import json

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import sys
sys.path.append('/var/www/futbol_app/scraper')
from today_matches import get_today_matches
try:
    matches = get_today_matches()
    for m in matches:
        if 'Radomlje' in m['ev_sahibi'] or 'Maribor' in m['deplasman']:
            import json
            print(json.dumps(m))
            break
except Exception as e:
    print("Error:", e)
"""

sftp = c.open_sftp()
with sftp.file('/tmp/get_radomlje.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, err = c.exec_command('/var/www/futbol_app/scraper/venv/bin/python /tmp/get_radomlje.py')
print(out.read().decode('utf-8'))
print(err.read().decode('utf-8'))
