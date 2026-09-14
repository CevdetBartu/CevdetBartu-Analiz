const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', 'utf8');

c = c.replace(/ozet\.effective_sample_size/g, '(ozet as any).effective_sample_size');
c = c.replace(/ozet\.ev_sahibi\.sapma/g, '(ozet.ev_sahibi as any).sapma');
c = c.replace(/ozet\.beraberlik\.sapma/g, '(ozet.beraberlik as any).sapma');
c = c.replace(/ozet\.deplasman\.sapma/g, '(ozet.deplasman as any).sapma');
c = c.replace(/ozet\.ust_25\.sapma/g, '(ozet.ust_25 as any).sapma');
c = c.replace(/ozet\.kg_var\.sapma/g, '(ozet.kg_var as any).sapma');
c = c.replace(/satir\.lig_isim/g, '(satir as any).lig_isim');
c = c.replace(/satir\.tarih_format/g, '(satir as any).tarih_format');

fs.writeFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', c, 'utf8');
