import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sqlite3
conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar GROUP BY tarih ORDER BY tarih DESC LIMIT 30")
for row in c.fetchall():
    print(row)
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_all_dates.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_all_dates.py')
print(out.read().decode('utf-8'))
