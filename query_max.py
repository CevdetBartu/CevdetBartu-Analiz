import paramiko
script = """
import sqlite3
import datetime

conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih FROM gecmis_maclar WHERE tarih LIKE '%.2026'")
dates = c.fetchall()

def parse_date(d_str):
    try:
        return datetime.datetime.strptime(d_str[0], '%d.%m.%Y')
    except:
        return datetime.datetime(2000, 1, 1)

max_d = max(dates, key=parse_date)
print("Max date:", max_d[0])

c.execute("SELECT COUNT(*) FROM gecmis_maclar WHERE tarih = ?", (max_d[0],))
print("Matches on max date:", c.fetchone()[0])

"""
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
sftp = c.open_sftp()
with sftp.file('/tmp/query_max.py', 'w') as f:
    f.write(script)
sftp.close()
_, out, _ = c.exec_command('python3 /tmp/query_max.py')
print(out.read().decode('ascii', errors='ignore'))
