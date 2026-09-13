import paramiko
script = """
import os
import shutil

# Make a copy of historical_mackolik_importer.py
original = '/var/www/futbol_app/scraper/historical_mackolik_importer.py'
catchup = '/var/www/futbol_app/scraper/catchup_importer.py'
shutil.copy(original, catchup)

with open(catchup, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the end date to stop at 2026-08-27
code = code.replace('end_date_str = "2021-01-01"', 'end_date_str = "2026-08-26"')
code = code.replace('progress_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "historical_progress.txt")', 'progress_file = "/tmp/fake_progress.txt"')

with open(catchup, 'w', encoding='utf-8') as f:
    f.write(code)

"""
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

sftp = c.open_sftp()
with sftp.file('/tmp/make_catchup.py', 'w') as f:
    f.write(script)
sftp.close()

c.exec_command('python3 /tmp/make_catchup.py')
print("Created catchup_importer.py")

_, out, _ = c.exec_command('nohup /var/www/futbol_app/scraper/venv/bin/python /var/www/futbol_app/scraper/catchup_importer.py > /var/www/futbol_app/scraper/catchup.log 2>&1 &')
print("Started catchup_importer in background.")
