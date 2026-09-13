
import Database from 'better-sqlite3';
const db = new Database('../../scripts/scraper/gecmis_maclar.db', { readonly: true });
const count = db.prepare('SELECT COUNT(*) as cnt FROM gecmis_maclar').get();
console.log('Total matches in DB:', count);

