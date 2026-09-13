import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sqlite3
try:
    conn = sqlite3.connect('/var/www/scripts/scraper/gecmis_maclar.db', uri=True)
    print("YES /var/www/scripts/scraper/gecmis_maclar.db exists")
except Exception as e:
    print(e)
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_db_exist.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_db_exist.py')
print(out.read().decode('utf-8'))
