import paramiko
import re

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
file_path = '/var/www/futbol_app/backend/dist/index.mjs'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# find the exact string
old_str = "similarityScore >= 90"
new_str = "similarityScore >= 94.7" # using 94.7 because 95 might hide 94.8 which user saw? user says '%95+'. I'll use 95.

if old_str in code:
    code = code.replace(old_str, "similarityScore >= 95")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Patched 90 to 95")
else:
    print("Could not find", old_str)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_dist.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_dist.py && pm2 restart api-server')
print("OUT:", out.read().decode('utf-8'))
client.close()
