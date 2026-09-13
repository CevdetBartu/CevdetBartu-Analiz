import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
script = """
import urllib.request
import bs4

req = urllib.request.Request("https://m.flashscore.com.tr/?d=-1", headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8")
soup = bs4.BeautifulSoup(html, "html.parser")

matches = []
for a_tag in soup.find_all("a", class_="fin"):
    score = a_tag.text.strip()
    parent = a_tag.parent
    text_nodes = [n for n in parent.children if isinstance(n, str)]
    if text_nodes:
        match_str = "".join(text_nodes).strip()
        if " - " in match_str:
            teams = match_str.split(" - ", 1)
            matches.append((teams[0], teams[1], score))

print("Found matches:", len(matches))
for i in range(10):
    if i < len(matches):
        print(matches[i])
"""
sftp = c.open_sftp()
with sftp.file('/tmp/check_flashscore.py', 'w') as f:
    f.write(script)
sftp.close()

_, out, _ = c.exec_command('python3 /tmp/check_flashscore.py')
print(out.read().decode('utf-8'))
