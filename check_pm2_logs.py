import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

stdin, stdout, stderr = c.exec_command('tail -n 200 /root/.pm2/logs/api-server-out.log')
print(stdout.read().decode('utf-8'))
