import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import sqlite3
try:
    conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
    cur = conn.cursor()
    cur.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih LIKE '%2026%' GROUP BY tarih ORDER BY tarih DESC LIMIT 10")
    print("MATCHES:", cur.fetchall())
    conn.close()
except Exception as e:
    print("ERROR:", e)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/check_db3.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/check_db3.py')
print("OUT:", out.read().decode('utf-8'))
client.close()
