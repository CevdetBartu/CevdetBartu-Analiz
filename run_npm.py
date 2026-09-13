import paramiko
import sys

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(IP, 22, USER, PASS)

stdin, stdout, stderr = client.exec_command("cd /var/www/futbol_app/backend && npm install --verbose")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))
client.close()
