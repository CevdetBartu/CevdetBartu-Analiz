import paramiko
script = """
import sqlite3
conn = sqlite3.connect('/var/www/futbol_app/scraper/gecmis_maclar.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(c.fetchall())
"""
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

sftp = c.open_sftp()
with sftp.file('/tmp/query_tables.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/query_tables.py')
print(out.read().decode('ascii', errors='ignore'))
