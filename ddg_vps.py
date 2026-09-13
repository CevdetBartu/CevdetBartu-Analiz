import paramiko

script = """
wget -qO- "https://html.duckduckgo.com/html/?q=mackolik+gol+sesi+mp3+indir" | grep -o 'href="https://[^"]*"' | cut -d'"' -f2 | head -n 15
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

_, out, err = c.exec_command(script)
print(out.read().decode())
print("ERR", err.read().decode())
