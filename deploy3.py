import paramiko
try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
    
    stdin, stdout, stderr = c.exec_command('cd /var/www/futbol_app/backend && git remote -v && git branch && git status')
    print(stdout.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
