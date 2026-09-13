const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = 'C:/Users/Okyanus/Downloads/ReplitExport-saraccevdetbart/Match-Data-Hub/scripts/scraper/gecmis_maclar.db';
const db = new Database(dbPath);

const targetLeagues = [
  "Süper Lig", "Şampiyonlar Ligi", "Serie A", "La Liga", "Premier Lig",
  "Bundesliga", "Ligue 1", "Avrupa Ligi", "Konferans Ligi", "1. Lig",
  "Eredivisie", "Primeira Liga", "Dünya Kupası", "Uluslar Ligi", "Türkiye Kupası",
  "Pro League", "Championship", "Serie B", "Segunda", "2. Bundesliga",
  "Yunanistan Super League", "Rusya Premier", "Brezilya Serie A", "Arjantin Liga Profesional", "Suudi Arabistan",
  "İskoçya Premiership", "2. Lig", "Avusturya Bundesliga", "İsviçre Super League", "Danimarka Superliga",
  "Eliteserien", "Allsvenskan", "Ukrayna Premier", "Hırvatistan HNL", "Ekstraklasa",
  "Çekya First", "Sırbistan SuperLiga", "Romanya Liga", "İsrail Premier", "Kıbrıs 1. Lig",
  "Azerbaycan", "Bulgaristan", "Macaristan", "Liga MX", "MLS",
  "J1 League", "K League 1", "Çin Süper Ligi", "Katar Stars", "Veikkausliiga"
];

const rows = db.prepare('SELECT DISTINCT lig FROM gecmis_maclar').all();

const matched = [];
const unmatched = [];

for (const target of targetLeagues) {
    const tLower = target.toLowerCase();
    const found = rows.filter(r => r.lig.toLowerCase().includes(tLower) || 
                                   (tLower === "premier lig" && r.lig.toLowerCase().includes("premier")) ||
                                   (tLower === "1. lig" && r.lig.toLowerCase().includes("1. lig")) ||
                                   (tLower === "2. lig" && r.lig.toLowerCase().includes("2. lig"))
                             );
    if (found.length > 0) {
        matched.push({ target, found: found.map(f => f.lig) });
    } else {
        unmatched.push(target);
    }
}

console.log("MATCHED:");
matched.forEach(m => {
    console.log(`- ${m.target}: ${m.found.join(', ')}`);
});

console.log("\nUNMATCHED (Need to find alternative names):");
unmatched.forEach(u => console.log(u));

db.close();
