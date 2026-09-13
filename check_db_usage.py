import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = client.exec_command('grep -r "@workspace/db" /var/www/futbol_app/backend')
print(out.read().decode('utf-8', errors='ignore'))
client.close()
