import paramiko
import os

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'

def deploy():
    print("Connecting...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(IP, 22, USER, PASS)
    sftp = c.open_sftp()
    
    print("Patching backend DB path...")
    with open('artifacts/api-server/dist/index.mjs', 'r', encoding='utf-8') as f:
        content = f.read()
    
    import re
    # Replace absolute windows paths injected by esbuild
    content = re.sub(r'const outputDir = "C:.*?";', 'const outputDir = __dirname;', content)
    
    # Replace anything that looks like path.resolve(__dirname, "..." + "gecmis_maclar.db")
    content = content.replace('"/../scripts/scraper/gecmis_maclar.db"', '"../../../scripts/scraper/gecmis_maclar.db"')
    content = content.replace('"/../../scripts/scraper/gecmis_maclar.db"', '"../../../scripts/scraper/gecmis_maclar.db"')
    
    with open('artifacts/api-server/dist/index_patched.mjs', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Uploading backend...")
    sftp.put('artifacts/api-server/dist/index_patched.mjs', '/var/www/futbol_app/backend/dist/index.mjs')
    
    # Restart backend
    print("Restarting backend...")
    c.exec_command("pm2 restart api-server")
    
    print("Uploading frontend zip...")
    import shutil
    shutil.make_archive('dist', 'zip', 'artifacts/football-app/dist/public')
    sftp.put('dist.zip', '/root/dist.zip')
    
    print("Unzipping frontend...")
    _, out, _ = c.exec_command("rm -rf /var/www/html/*")
    out.read()
    _, out, _ = c.exec_command("unzip -o /root/dist.zip -d /var/www/html/")
    out.read()
    
    print("Restarting nginx...")
    _, out, _ = c.exec_command("systemctl restart nginx")
    out.read()
    
    sftp.close()
    c.close()
    print("Done!")

if __name__ == '__main__':
    deploy()
