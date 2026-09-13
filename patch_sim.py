import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
file_path = '/var/www/futbol_app/backend/src/lib/similarity.ts'
if not os.path.exists(file_path):
    file_path = '/var/www/futbol_app/api-server/src/lib/similarity.ts'
    
if not os.path.exists(file_path):
    # wait maybe it's built to dist?
    pass

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('combined.filter(m => m.similarityScore >= 90)', 'combined.filter(m => m.similarityScore >= 95)')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_sim.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_sim.py && cd /var/www/futbol_app/backend && npm run build && pm2 restart api-server')
print("OUT:", out.read().decode('utf-8'))
print("ERR:", err.read().decode('utf-8'))
client.close()
