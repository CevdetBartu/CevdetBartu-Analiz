import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

cmd = "cd /var/www/futbol_app/backend && pm2 stop api-server && pm2 delete api-server && pm2 start dist/index.mjs --name 'api-server' --node-args='--env-file=.env' || pm2 start dist/index.mjs --name 'api-server'"
client.exec_command(cmd)
# Alternatively, to be safe, just inject it into pm2 ecosystem or inject via bash
cmd2 = "cd /var/www/futbol_app/backend && export $(grep -v '^#' .env | xargs) && pm2 restart api-server --update-env"
client.exec_command(cmd2)
client.exec_command("pm2 save")
client.close()
