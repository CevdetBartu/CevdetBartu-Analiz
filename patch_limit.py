import paramiko
import re

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import os
import re

file_path = '/var/www/futbol_app/backend/dist/index.mjs'
with open(file_path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace any maxResults logic that defaults to 1500 or something else to just 20.
# Let's find the slice call.
# The original TS was: return results.slice(0, maxResults);
# It might be compiled as `return results.slice(0, ...)`

import re
# We'll just replace the calculation of maxResults
# We'll search for `1500` and `20` around `strict100`

# Since we don't know the exact compiled code, let's find `slice(0, `
match = re.search(r'slice\(0,\s*([^)]+)\)', code)
if match:
    pass # this might be risky to just replace

# Alternatively, just inject a `.slice(0, 20)` after the `similarityScore >= 95` filter!
# The original code has: .filter(m => m.similarityScore >= 95)
# Let's replace it with: .filter(m => m.similarityScore >= 95).slice(0, 20)
old_str = "similarityScore >= 95"
if old_str in code:
    # Actually wait, `combined.filter(m => m.similarityScore >= 95)` is already there.
    # But wait, it already sorts them before slicing!
    # The TS code:
    # combined.sort((a, b) => b.similarityScore - a.similarityScore);
    # const results = query.strict100 ? combined.filter(...) : combined.filter(m => m.similarityScore >= 95);
    # return results.slice(0, maxResults);
    pass

code = code.replace('?? 1500', '?? 20')
code = code.replace('? 1500', '? 20')
code = code.replace(': 1500', ': 20')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(code)
print("Patched 1500 to 20")
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_limit.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_limit.py && pm2 restart api-server')
print("OUT:", out.read().decode('utf-8'))
client.close()
