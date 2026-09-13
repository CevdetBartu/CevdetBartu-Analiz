import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

_, out, _ = c.exec_command('cat /etc/nginx/sites-available/default')
print(out.read().decode('utf-8'))
