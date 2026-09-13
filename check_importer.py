import paramiko
script = """
cat /var/www/futbol_app/scraper/auto_nightly_importer.py | head -n 20
"""
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, _ = c.exec_command(script)
print(out.read().decode('ascii', errors='ignore'))
