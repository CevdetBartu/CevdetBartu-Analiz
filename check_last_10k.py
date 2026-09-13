import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sqlite3

conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih FROM gecmis_maclar WHERE id > (SELECT MAX(id) - 10000 FROM gecmis_maclar)")
dates = c.fetchall()
d_set = set([d[0] for d in dates])
print("Recent insert dates (last 10k):", sorted(list(d_set)))
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_last_10k.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_last_10k.py')
print(out.read().decode('utf-8'))
