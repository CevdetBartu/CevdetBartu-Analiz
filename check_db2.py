import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = client.exec_command('sqlite3 /var/www/futbol_app/gecmis_maclar.db "SELECT tarih, COUNT(*) FROM gecmis_maclar GROUP BY tarih ORDER BY tarih DESC LIMIT 10;"')
print("OUT:", out.read().decode('utf-8'))
print("ERR:", err.read().decode('utf-8'))
client.close()
