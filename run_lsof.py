import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')
_, out, err = client.exec_command('lsof | grep gecmis_maclar.db > /tmp/db_lsof.txt')
client.close()
