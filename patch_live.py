import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
file_path = '/var/www/futbol_app/scraper/sources/live_matches.py'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('ThreadPoolExecutor(max_workers=10)', 'ThreadPoolExecutor(max_workers=50)')
code = code.replace("timeout=8", "timeout=4").replace("timeout=5", "timeout=3")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_live.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_live.py && pm2 restart scraper-bot')
print("OUT:", out.read().decode('utf-8'))
client.close()
