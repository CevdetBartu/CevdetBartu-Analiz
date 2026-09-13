import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = c.exec_command('python3 /tmp/check_fs_func.py')
print("STDOUT:", out.read().decode('utf-8', errors='ignore'))
print("STDERR:", err.read().decode('utf-8', errors='ignore'))
