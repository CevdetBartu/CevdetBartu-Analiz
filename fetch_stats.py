import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('curl -s http://127.0.0.1:5051/stats')
raw = out.read().decode('utf-8')
print(raw[:500])
