import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = "which sqlite3"
_, out, _ = c.exec_command(script)
print("SQLITE3 PATH:", out.read().decode('utf-8'))
