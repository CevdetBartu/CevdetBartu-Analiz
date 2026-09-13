import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('grep -i -B 2 -A 2 "Okyanus" /var/www/futbol_app/backend/dist/index.mjs')
print(out.read().decode('ascii', errors='ignore'))
