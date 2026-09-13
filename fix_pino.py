import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os

file_path = '/var/www/futbol_app/backend/dist/index.mjs'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Windows paths with VPS paths
win_path = r'C:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\artifacts\\api-server\\dist'
vps_path = r'/var/www/futbol_app/backend/dist'

code = code.replace(win_path, vps_path)
code = code.replace('C:/Users/Okyanus/Downloads/ReplitExport-saraccevdetbart/Match-Data-Hub/artifacts/api-server/dist', vps_path)

# Also fix thread-stream paths
code = code.replace('C:\\\\Users\\\\Okyanus\\\\Downloads\\\\ReplitExport-saraccevdetbart\\\\Match-Data-Hub\\\\artifacts\\\\api-server\\\\dist', vps_path)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Replaced Windows paths")
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/fix_pino.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/fix_pino.py && pm2 restart api-server')
print("OUT:", out.read().decode('utf-8'))
client.close()
