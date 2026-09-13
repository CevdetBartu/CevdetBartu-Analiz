import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
client.exec_command("sed -i 's|C:\\\\Users\\\\Okyanus\\\\Downloads\\\\ReplitExport-saraccevdetbart\\\\Match-Data-Hub\\\\artifacts\\\\api-server\\\\dist|/var/www/futbol_app/backend/dist|g' /var/www/futbol_app/backend/dist/index.mjs")
client.exec_command("sed -i 's|C:\\\\\\\\Users\\\\\\\\Okyanus\\\\\\\\Downloads\\\\\\\\ReplitExport-saraccevdetbart\\\\\\\\Match-Data-Hub\\\\\\\\artifacts\\\\\\\\api-server\\\\\\\\dist|/var/www/futbol_app/backend/dist|g' /var/www/futbol_app/backend/dist/index.mjs")
client.exec_command("pm2 restart api-server")
client.close()
