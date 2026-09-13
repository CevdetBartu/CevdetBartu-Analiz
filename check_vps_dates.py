import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import requests
import bs4

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}
r = requests.get("https://arsiv.mackolik.com/Iddaa-Programi", headers=headers)
soup = bs4.BeautifulSoup(r.text, 'html.parser')
dates = set()
for r_tag in soup.find_all('tr'):
    cls = r_tag.get('class', [])
    if 'iddaa-oyna-title2' in cls:
        date_td = r_tag.find('td', {'rateSort': 'tarih_1'})
        if date_td:
            dates.add(date_td.text.strip())
print("Dates found:", dates)
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_dates.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_dates.py')
print(out.read().decode('utf-8'))
