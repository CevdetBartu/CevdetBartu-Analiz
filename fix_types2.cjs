const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', 'utf8');

c = c.replace(/const \{ taraf_oranlari: t, alt_ust: au \} = satir;/g, 'const t = satir.taraf_oranlari as any;\n                const au = satir.alt_ust as any;');

fs.writeFileSync('artifacts/football-app/src/components/AnalysisTable.tsx', c, 'utf8');
