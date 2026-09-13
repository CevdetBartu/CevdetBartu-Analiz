import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = c.exec_command('/var/www/futbol_app/scraper/venv/bin/python /tmp/check_fs_func.py > /tmp/fs_out.txt 2>&1')
out.read()
_, out, _ = c.exec_command('head -n 2 /tmp/fs_out.txt')
print(out.read().decode('ascii', errors='ignore'))
