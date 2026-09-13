import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('185.10.93.73', 22, 'root', 'vnmBXK1LnKBD!')

script = """
import Database from 'better-sqlite3';
const db = new Database('/var/www/scripts/scraper/gecmis_maclar.db');
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
console.log("Table created successfully");
"""

stdin, stdout, stderr = c.exec_command(f"""
cat << 'EOF' > /var/www/futbol_app/backend/create_users.js
{script}
EOF
cd /var/www/futbol_app/backend && node create_users.js
""")

print("OUT:", stdout.read().decode())
print("ERR:", stderr.read().decode())
