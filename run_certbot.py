import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = c.exec_command('certbot --nginx -d kargatahmin.com -d www.kargatahmin.com --non-interactive --agree-tos -m admin@kargatahmin.com')
print(out.read().decode('ascii', errors='ignore'))
print(err.read().decode('ascii', errors='ignore'))
