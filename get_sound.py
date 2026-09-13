import paramiko

script = """
curl -sL https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3 > /tmp/sound.mp3
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

c.exec_command(script)
_, out, _ = c.exec_command('ls -la /tmp/sound.mp3')
print(out.read().decode())
