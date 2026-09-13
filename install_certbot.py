import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

print("Installing certbot...")
_, out, err = c.exec_command('apt-get update && apt-get install -y certbot python3-certbot-nginx')
print(out.read().decode('utf-8'))
print(err.read().decode('utf-8'))

print("Running certbot...")
_, out, err = c.exec_command('certbot --nginx -d kargatahmin.com -d www.kargatahmin.com --non-interactive --agree-tos -m admin@kargatahmin.com')
print(out.read().decode('utf-8'))
print(err.read().decode('utf-8'))
