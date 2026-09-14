import paramiko
try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
    
    stdin, stdout, stderr = c.exec_command('ls -la /var/www/futbol_app/frontend')
    print(stdout.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
