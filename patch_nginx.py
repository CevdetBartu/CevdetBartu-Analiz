import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
file_path = '/etc/nginx/sites-available/default'
with open(file_path, 'r', encoding='utf-8') as f:
    config = f.read()

if 'client_max_body_size' not in config:
    config = config.replace('server_name kargatahmin.com www.kargatahmin.com;', 'server_name kargatahmin.com www.kargatahmin.com;\\n    client_max_body_size 50M;')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(config)
"""

with client.open_sftp() as sftp:
    with sftp.file('/tmp/patch_nginx.py', 'w') as f:
        f.write(script)

_, out, err = client.exec_command('python3 /tmp/patch_nginx.py && systemctl reload nginx')
print("OUT:", out.read().decode('utf-8'))
client.close()
