import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import sqlite3
conn = sqlite3.connect('/var/www/futbol_app/gecmis_maclar.db')
cur = conn.cursor()
cur.execute("SELECT tarih, COUNT(*) FROM gecmis_maclar WHERE tarih LIKE '%2026%' GROUP BY tarih ORDER BY tarih DESC LIMIT 10")
print(cur.fetchall())
conn.close()
"""

_, out, err = client.exec_command(f'python3 -c "{script}"')
print("OUT:", out.read().decode('utf-8'))
print("ERR:", err.read().decode('utf-8'))
client.close()
