const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/pages/Home.tsx', 'utf8');

c = c.replace(
  'KargaTahmin — Ýddaa oranlarý geçmiþ verilerle karþýlaþtýrýlarak sunulur, yatýrým tavsiyesi deðildir.', 
  'KargaTahmin — Ýddaa oranlarý geçmiþ verilerle karþýlaþtýrýlarak sunulur, yatýrým tavsiyesi deðildir.<br/><br/><a href=\"/gizlilik\" style={{color:\"#64748b\", textDecoration:\"underline\"}}>KVKK ve Gizlilik Politikasý</a>'
);

fs.writeFileSync('artifacts/football-app/src/pages/Home.tsx', c, 'utf8');
