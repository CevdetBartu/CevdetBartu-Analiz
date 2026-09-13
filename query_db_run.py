import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = c.exec_command('python3 /tmp/query_db.py')
print("OUT:", out.read().decode('ascii', errors='ignore'))
print("ERR:", err.read().decode('ascii', errors='ignore'))
