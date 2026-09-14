const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', 'utf8');

c = c.replace(/\(ozet as any\)\.effective_sample_size/g, 'ozet.effective_sample_size');
c = c.replace(/\(ozet\.ev_sahibi as any\)\.sapma/g, 'ozet.ev_sahibi.sapma');
c = c.replace(/\(ozet\.beraberlik as any\)\.sapma/g, 'ozet.beraberlik.sapma');
c = c.replace(/\(ozet\.deplasman as any\)\.sapma/g, 'ozet.deplasman.sapma');
c = c.replace(/\(ozet\.ust_25 as any\)\.sapma/g, 'ozet.ust_25.sapma');
c = c.replace(/\(ozet\.kg_var as any\)\.sapma/g, 'ozet.kg_var.sapma');
c = c.replace(/\(satir as any\)\.lig_isim/g, 'satir.lig_isim');
c = c.replace(/\(satir as any\)\.tarih_format/g, 'satir.tarih_format');
c = c.replace(/const t = satir\.taraf_oranlari as any;\r?\n                const au = satir\.alt_ust as any;/g, 'const { taraf_oranlari: t, alt_ust: au } = satir;');
c = c.replace(/trend=\{t\?\.ev_trend as any\}/g, 'trend={t?.ev_trend as any}');

fs.writeFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', c, 'utf8');
