import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command('cat /var/www/futbol_app/backend/dist/index.mjs | grep -o ".{0,100}AnalyzeMatchesBody.{0,100}"')
print(out.read().decode('utf-8'))
