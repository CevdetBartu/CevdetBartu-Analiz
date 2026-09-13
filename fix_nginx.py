import paramiko

IP = '185.10.93.73'
USER = 'root'
PASS = 'vnmBXK1LnKBD!'

nginx_conf = '''server {
    listen 80;
    server_name kargatahmin.com www.kargatahmin.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /sitemap.xml {
        proxy_pass http://localhost:8080;
    }

    location /robots.txt {
        proxy_pass http://localhost:8080;
    }
}'''

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(IP, 22, USER, PASS)

with client.open_sftp() as sftp:
    with sftp.file('/etc/nginx/sites-available/default', 'w') as f:
        f.write(nginx_conf)

client.exec_command("systemctl restart nginx")
client.close()
