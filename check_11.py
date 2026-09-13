import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sqlite3
conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih = '11.09.2026'")
print("11.09.2026 count:", c.fetchone())
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_11.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_11.py')
print(out.read().decode('utf-8'))
