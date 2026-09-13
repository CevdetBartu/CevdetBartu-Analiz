import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = client.exec_command("curl -s -X POST http://localhost:5051/today -H 'Content-Type: application/json' -d '{\"date\":\"2026-09-11\"}'")
print(out.read().decode('utf-8'))
client.close()
