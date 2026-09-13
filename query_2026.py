import paramiko
script = """
import sqlite3
conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT tarih, lig, ev_sahibi, deplasman FROM gecmis_maclar WHERE tarih LIKE '%2026%' ORDER BY tarih DESC LIMIT 10")
res = c.fetchall()
if res:
    for r in res: print(r)
else:
    print("NO MATCHES FOR 2026")
"""
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
sftp = c.open_sftp()
with sftp.file('/tmp/query_2026.py', 'w') as f:
    f.write(script)
sftp.close()
_, out, _ = c.exec_command('python3 /tmp/query_2026.py')
print(out.read().decode('ascii', errors='ignore'))
