import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('ls -lh /var/www/futbol_app/*.db /var/www/futbol_app/scraper/*.db')
print(out.read().decode('ascii', errors='ignore'))
