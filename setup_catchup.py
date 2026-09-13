import paramiko
script = """
import os
import sys
import datetime
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from historical_mackolik_importer import fetch_matches_for_date

# Date range: 2026-08-27 to 2026-09-12 (Today)
start_d = datetime.date(2026, 8, 27)
end_d = datetime.date(2026, 9, 12)

curr = start_d
while curr <= end_d:
    d_str = curr.strftime("%Y-%m-%d")
    print(f"Fetching {d_str}...")
    fetch_matches_for_date(d_str)
    curr += datetime.timedelta(days=1)
    time.sleep(2)
print("Catch-up complete!")
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

sftp = c.open_sftp()
with sftp.file('/var/www/futbol_app/scraper/catchup.py', 'w') as f:
    f.write(script)
sftp.close()

# Start the catchup script in a tmux or nohup, or just let it run synchronously if it's fast
_, out, _ = c.exec_command('nohup python3 /var/www/futbol_app/scraper/catchup.py > /var/www/futbol_app/scraper/catchup.log 2>&1 &')
print("Started catchup.py in background.")

# Now set up the cron job for auto_nightly_importer
cron_cmd = '(crontab -l 2>/dev/null; echo "0 4 * * * cd /var/www/futbol_app/scraper && /var/www/futbol_app/scraper/venv/bin/python auto_nightly_importer.py >> /var/www/futbol_app/scraper/nightly.log 2>&1") | crontab -'
c.exec_command(cron_cmd)
print("Cron job added.")
