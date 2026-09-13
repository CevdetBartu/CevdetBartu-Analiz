import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = client.exec_command("curl -s http://localhost:8080/api/live-matches")
resp = out.read().decode('utf-8')
print("Length:", len(resp))
print("Start:", resp[:100])
client.close()
