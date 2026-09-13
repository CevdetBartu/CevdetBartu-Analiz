import paramiko
import os
import shutil

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'

def deploy():
    print("Zipping frontend...")
    shutil.make_archive('dist', 'zip', 'artifacts/football-app/dist/public')
    
    print("Connecting...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(IP, 22, USER, PASS)
    sftp = c.open_sftp()
    
    print("Uploading frontend zip...")
    sftp.put('dist.zip', '/root/dist.zip')
    
    print("Unzipping frontend...")
    c.exec_command("rm -rf /var/www/html/*")
    c.exec_command("unzip -o /root/dist.zip -d /var/www/html/")
    
    print("Restarting nginx...")
    c.exec_command("systemctl restart nginx")
    
    sftp.close()
    c.close()
    print("Frontend deployed successfully!")

if __name__ == '__main__':
    deploy()
