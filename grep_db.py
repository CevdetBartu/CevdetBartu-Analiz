import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = client.exec_command("grep -rn 'gecmis_maclar.db' /var/www/futbol_app/scraper | grep -v 'Binary file'")
print("OUT:", out.read().decode('utf-8'))
client.close()
