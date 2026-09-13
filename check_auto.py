import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('grep -A 10 "if __name__" /var/www/futbol_app/scraper/auto_nightly_importer.py')
print(out.read().decode('ascii', errors='ignore'))
