import paramiko
import codecs

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

stdin, stdout, stderr = c.exec_command('cat /var/www/futbol_app/backend/src/lib/similarity.ts')
content = stdout.read().decode('utf-8')

with codecs.open('artifacts/api-server/src/lib/similarity.ts', 'w', 'utf-8') as f:
    f.write(content)

print(f"Recovered similarity.ts from VPS! Length: {len(content)}")
