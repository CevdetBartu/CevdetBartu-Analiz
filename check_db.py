import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = "sqlite3 /var/www/futbol_app/scraper/gecmis_maclar.db 'SELECT tarih, lig, ev_sahibi, deplasman FROM maclar ORDER BY id DESC LIMIT 5;'"
_, out, _ = c.exec_command(script)
print(out.read().decode('utf-8'))
