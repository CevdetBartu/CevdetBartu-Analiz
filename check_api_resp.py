import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('curl -s -H "x-admin-token: crs-secret-admin-key-9988" http://localhost:8080/api/admin/scraper/stats')
print(out.read().decode('utf-8'))
