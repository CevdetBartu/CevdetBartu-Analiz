import paramiko
from scp import SCPClient
import sys

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'
REMOTE_DIR = '/var/www/futbol_app'

def create_ssh_client(server, port, user, password):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    
    # Safely decode ignoring errors to prevent crash
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    
    if out:
        try:
            print(f"STDOUT: {out.strip()[:500]}...") # truncate to avoid large logs
        except Exception:
            pass
    if err:
        try:
            print(f"STDERR: {err.strip()[:500]}...")
        except Exception:
            pass
            
    return exit_status, out, err

try:
    print("Connecting to VPS...")
    ssh = create_ssh_client(IP, 22, USER, PASS)
    
    print("Installing system packages (Node.js, Python, Nginx)...")
    run_cmd(ssh, "apt update -y")
    run_cmd(ssh, "apt install -y nodejs npm python3 python3-venv python3-pip nginx")
    
    print("Installing PM2...")
    run_cmd(ssh, "npm install -g pm2")
    
    print("Setting up Backend...")
    run_cmd(ssh, f"cd {REMOTE_DIR}/backend && npm install --omit=dev")
    run_cmd(ssh, f"cd {REMOTE_DIR}/backend && pm2 stop api-server || true")
    run_cmd(ssh, f"cd {REMOTE_DIR}/backend && pm2 start dist/index.mjs --name 'api-server'")
    
    print("Setting up Scraper...")
    run_cmd(ssh, f"cd {REMOTE_DIR}/scraper && python3 -m venv venv")
    run_cmd(ssh, f"cd {REMOTE_DIR}/scraper && ./venv/bin/pip install -r requirements.txt")
    run_cmd(ssh, f"cd {REMOTE_DIR}/scraper && pm2 stop scraper-bot || true")
    run_cmd(ssh, f"cd {REMOTE_DIR}/scraper && pm2 start run.py --interpreter ./venv/bin/python3 --name 'scraper-bot'")
    
    print("Setting up Frontend & Nginx...")
    run_cmd(ssh, "rm -rf /var/www/html/*")
    run_cmd(ssh, f"cp -r {REMOTE_DIR}/frontend/* /var/www/html/")
    
    nginx_conf = '''server {
    listen 80;
    server_name kargatahmin.com www.kargatahmin.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}'''
    
    # write to remote nginx conf
    with ssh.open_sftp() as sftp:
        with sftp.file('/etc/nginx/sites-available/default', 'w') as f:
            f.write(nginx_conf)
            
    run_cmd(ssh, "systemctl restart nginx")
    run_cmd(ssh, "pm2 save")
    run_cmd(ssh, "pm2 startup")
    
    print("Deployment completed successfully!")
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
