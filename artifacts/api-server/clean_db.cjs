const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'C:/Users/Okyanus/Downloads/ReplitExport-saraccevdetbart/Match-Data-Hub/scripts/scraper/gecmis_maclar.db');
console.log('Connecting to database:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error("Database not found!");
  process.exit(1);
}

const db = new Database(dbPath);

const initialCount = db.prepare('SELECT COUNT(*) as c FROM gecmis_maclar').get().c;
console.log(`Initial rows: ${initialCount}`);

// 1. Get top 150 leagues
const topLeaguesRows = db.prepare('SELECT lig, COUNT(*) as count FROM gecmis_maclar GROUP BY lig ORDER BY count DESC LIMIT 150').all();

// Filter out amateur, women, youth, friendly, reserve leagues from top 150
const forbiddenKeywords = ['amateur', 'women', 'kadin', 'u19', 'u20', 'u21', 'u23', 'reserves', 'reserve', 'friendly', 'hazirlik', 'youth', 'genclik', 'regional', 'bolgesel', 'femeni', 'frauen', 'damallsvenskan', 'kakkonen', 'kupa', 'cup', 'beker'];
// Note: We might want to keep major cups like 'fa cup', 'copa del rey', 'dfb pokal', 'coppa italia', 'coupe de france'. 
// Actually, let's just filter explicit amateur/youth/women.
const strictForbidden = ['amateur', 'women', 'kadin', 'u19', 'u20', 'u21', 'u22', 'u23', 'reserves', 'reserve', 'friendly', 'hazirlik', 'youth', 'genclik', 'femeni', 'frauen', 'damallsvenskan', 'kakkonen', 'baller league'];

const approvedLeagues = [];
for (const row of topLeaguesRows) {
  const normLig = row.lig.toLowerCase();
  let isForbidden = false;
  for (const f of strictForbidden) {
    if (normLig.includes(f)) {
      isForbidden = true;
      break;
    }
  }
  
  if (!isForbidden) {
    approvedLeagues.push(row.lig);
  } else {
    console.log('Filtered out:', row.lig);
  }
}

console.log(`Approved leagues count: ${approvedLeagues.length}`);

// Additionally, always include minor leagues of Turkey just in case they weren't in top 150
const trLeagues = ['Türkiye 1. Lig', 'Türkiye 2. Lig', 'Türkiye 3. Lig', 'Türkiye Kupası'];
for (const tr of trLeagues) {
  if (!approvedLeagues.includes(tr)) approvedLeagues.push(tr);
}

console.log(`Final approved leagues count: ${approvedLeagues.length}`);

// Begin transaction
db.exec('BEGIN TRANSACTION');

try {
  // Delete where lig not in approvedLeagues
  const placeholders = approvedLeagues.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM gecmis_maclar WHERE lig NOT IN (${placeholders})`);
  const result = stmt.run(...approvedLeagues);
  
  console.log(`Deleted ${result.changes} rows.`);
  
  db.exec('COMMIT');
  console.log('Transaction committed.');
} catch (e) {
  db.exec('ROLLBACK');
  console.error('Error during deletion:', e);
}

const finalCount = db.prepare('SELECT COUNT(*) as c FROM gecmis_maclar').get().c;
console.log(`Final rows: ${finalCount}`);

console.log('Running VACUUM to reclaim space...');
db.exec('VACUUM');
console.log('VACUUM complete. Done.');

db.close();
