import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('grep -A 5 "get_conn" /var/www/futbol_app/scraper/catchup_importer.py')
print("catchup get_conn:", out.read().decode('ascii', errors='ignore'))
_, out, _ = c.exec_command('grep -A 5 "get_conn" /var/www/futbol_app/scraper/db.py')
print("db get_conn:", out.read().decode('ascii', errors='ignore'))
