import paramiko
from scp import SCPClient
import sys

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'

print("Connecting...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(IP, 22, USER, PASS)

print("Uploading 210MB database (this will take a few minutes)...")
with SCPClient(ssh.get_transport()) as scp:
    scp.put('scripts/scraper/gecmis_maclar.db', remote_path='/var/www/futbol_app/gecmis_maclar.db')

print("Restarting services...")
ssh.exec_command("pm2 restart scraper-bot && pm2 restart api-server")
ssh.close()
print("Done!")
