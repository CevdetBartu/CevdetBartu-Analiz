const Database = require("better-sqlite3");
const path = require("path");

const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") 
  ? "/var/www/futbol_app/gecmis_maclar.db" 
  : path.resolve(__dirname, "../gecmis_maclar.db");

const email = process.argv[2];

if (!email) {
  console.error("Lütfen bir e-posta adresi girin. Kullanım: node make_admin.js <email>");
  process.exit(1);
}

const db = new Database(dbPath);

const info = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);

if (info.changes > 0) {
  console.log(Başarılı:  adlı kullanıcı 'admin' rolüne yükseltildi.);
} else {
  console.log(Hata:  adresine sahip bir kullanıcı bulunamadı.);
}
