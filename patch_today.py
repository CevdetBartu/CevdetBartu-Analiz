import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
file_path = '/var/www/futbol_app/scraper/sources/today_matches.py'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

bad_line = 'import os; conn = sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "gecmis_maclar.db"), check_same_thread=False)'
good_line = 'import os; import sys; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); from config import DB_PATH; conn = sqlite3.connect(DB_PATH, check_same_thread=False)'

code = code.replace(bad_line, good_line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_today.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_today.py && pm2 restart scraper-bot')
print("OUT:", out.read().decode('utf-8'))
print("ERR:", err.read().decode('utf-8'))

client.close()
