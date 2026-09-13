import paramiko

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'
REMOTE_DIR = '/var/www/futbol_app'

def run_cmd(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    # print safely
    try:
        if out: print(f"STDOUT: {out.strip()[:200]}")
    except: pass
    try:
        if err: print(f"STDERR: {err.strip()[:200]}")
    except: pass

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(IP, 22, USER, PASS)

# Overwrite package.json to remove incompatible pnpm syntax, only need better-sqlite3
pkg = '{"name":"api-server","type":"module","dependencies":{"better-sqlite3":"^11.0.0"}}'
run_cmd(client, f"echo '{pkg}' > {REMOTE_DIR}/backend/package.json")

# Install
run_cmd(client, f"cd {REMOTE_DIR}/backend && npm install")

# Start PM2 backend
run_cmd(client, f"cd {REMOTE_DIR}/backend && pm2 stop api-server || true")
run_cmd(client, f"cd {REMOTE_DIR}/backend && pm2 start dist/index.mjs --name 'api-server'")
run_cmd(client, "pm2 save")

client.close()
