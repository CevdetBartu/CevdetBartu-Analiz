import paramiko
import time

script = """
import os

file_path = '/var/www/futbol_app/backend/src/lib/similarity.ts'
if not os.path.exists(file_path):
    file_path = '/var/www/futbol_app/backend/dist/index.mjs'

print("Patching", file_path)

with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Fix gamma
if 'const gamma = 2.0;' in code:
    code = code.replace('const gamma = 2.0;', 'const gamma = 4.0;')
    print("Replaced gamma 2.0 -> 4.0")

# For the compiled index.mjs, it might just be 'const gamma = 2;' or similar.
# Let's use regex to replace gamma = 2 / 2.0
import re
code = re.sub(r'const gamma = 2(\.0)?;', 'const gamma = 4.0;', code)

# Fix the flat bonuses in compiled code
# The compiled code might have: similarityScore = Math.min(100, similarityScore + 7);
code = re.sub(r'similarityScore \+ 7(\.0)?\)', 'similarityScore + 1.0)', code)
code = re.sub(r'similarityScore \+ 8(\.0)?\)', 'similarityScore + 2.0)', code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch complete.")
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

sftp = c.open_sftp()
with sftp.file('/tmp/patch_sim2.py', 'w') as f:
    f.write(script)
sftp.close()

print("Running patch on VPS...")
_, out, err = c.exec_command('python3 /tmp/patch_sim2.py && pm2 restart api-server')
print("OUT:", out.read().decode())
print("ERR:", err.read().decode())
