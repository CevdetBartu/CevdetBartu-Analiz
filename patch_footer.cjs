const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/pages/Home.tsx', 'utf8');

const target = '&copy; 2026 KargaTahmin Analiz. Tüm Haklarý Saklýdýr.';
const replacement = target + ' | <a href="/gizlilik" style={{color:"inherit", textDecoration:"underline"}}>Gizlilik ve KVKK</a>';

c = c.replace(/&copy; 2026 CevdetBartu Futbol Analiz\. T..m Haklar. Sakl.d.r\./, replacement);
c = c.replace(/&copy; 2026 KargaTahmin Futbol Analiz\. T..m Haklar. Sakl.d.r\./, replacement);
c = c.replace(/&copy; 2026 KargaTahmin Analiz\. T..m Haklar. Sakl.d.r\./, replacement);
c = c.replace(/&copy; 202[0-9].*Sakl.d.r\./, replacement);

fs.writeFileSync('artifacts/football-app/src/pages/Home.tsx', c, 'utf8');
