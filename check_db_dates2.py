import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sqlite3
import datetime

conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih LIKE '2026-09-12' OR tarih LIKE '12.09.2026' OR tarih LIKE '2026-09-13' OR tarih LIKE '13.09.2026' GROUP BY tarih")
print(c.fetchall())
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_db_dates2.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_db_dates2.py')
print(out.read().decode('utf-8'))
