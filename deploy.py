import paramiko
import sys

try:
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
    
    # Check for frontend and backend dirs
    stdin, stdout, stderr = c.exec_command('find /var/www /root /home -maxdepth 3 -name "package.json" -type f 2>/dev/null')
    print("Found package.json files:")
    print(stdout.read().decode('utf-8'))
    
    stdin, stdout, stderr = c.exec_command('pm2 jlist')
    print("\nPM2 Apps:")
    import json
    apps = json.loads(stdout.read().decode('utf-8'))
    for app in apps:
        print(f"Name: {app['name']}, Path: {app['pm2_env']['pm_cwd']}")
        
except Exception as e:
    print(f"Error: {e}")
