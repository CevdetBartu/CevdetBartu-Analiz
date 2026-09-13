import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
file_path = '/var/www/futbol_app/backend/dist/index.mjs'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

import re
matches = re.findall(r'.{0,40}maxResults.{0,40}', code)
for m in matches:
    print(m)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/check_max.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/check_max.py')
print("OUT:", out.read().decode('utf-8'))
client.close()
