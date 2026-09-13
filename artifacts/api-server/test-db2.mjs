
import Database from 'better-sqlite3';
const db = new Database('../../scripts/scraper/gecmis_maclar.db', { readonly: true });
const count = db.prepare('SELECT COUNT(*) as cnt FROM gecmis_maclar WHERE oran_1 > 1.0').get();
console.log('Matches with oran_1:', count);

