import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
client.exec_command('echo "DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy" >> /var/www/futbol_app/backend/.env')
client.exec_command('pm2 restart api-server')
client.close()
