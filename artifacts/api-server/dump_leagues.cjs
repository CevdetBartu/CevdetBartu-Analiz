const Database = require('better-sqlite3');
const db = new Database('C:/Users/Okyanus/Downloads/ReplitExport-saraccevdetbart/Match-Data-Hub/scripts/scraper/gecmis_maclar.db');

const rows = db.prepare('SELECT lig, COUNT(*) as c FROM gecmis_maclar GROUP BY lig ORDER BY c DESC').all();

console.log(rows.map(r => r.lig).join('\n'));

db.close();
