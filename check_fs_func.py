import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import sys
sys.path.append('/var/www/futbol_app/scraper')
from auto_nightly_importer import fetch_finished_matches
matches = fetch_finished_matches("-1")
print(len(matches))
print(matches[:5])
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_fs_func.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_fs_func.py')
print(out.read().decode('utf-8'))
