const fs = require('fs');
let c = fs.readFileSync('src/lib/analyzeEngine.ts', 'utf8');

// Remove Deðerli Oran logic
c = c.replace(/if \(t1\) \{\s*if \(hasOdds1 && edgeHome > 0\) t1 \+= ' \(De.*?Yerli Oran\)';\s*else if \(hasOdds1\) t1 \+= ' \(De.*?Yersiz Oran\)';\s*tahminler\.push\(t1\);\s*\}/, `if (t1) tahminler.push(t1);`);
c = c.replace(/if \(t2\) \{\s*if \(hasOdds2 && edgeAway > 0\) t2 \+= ' \(De.*?Yerli Oran\)';\s*else if \(hasOdds2\) t2 \+= ' \(De.*?Yersiz Oran\)';\s*tahminler\.push\(t2\);\s*\}/, `if (t2) tahminler.push(t2);`);

// Fix the "2,5 ST" string
c = c.replace(/'MS \\\| 2,5 .*?ST'/g, `'MS | 2,5 ÜST'`);

// Remove model_roi, predictability, kalibrasyon_skoru from interface
c = c.replace(/\s*model_roi\?: number \| null;/, '');
c = c.replace(/\s*predictability\?: string \| null;/, '');
c = c.replace(/\s*kalibrasyon_skoru\?: number;/, '');
c = c.replace(/\s*guven_seviyesi\?: string \| null;/, '');
c = c.replace(/\s*guven_skoru\?: number \| null;/, '');

// Remove assignments in the analyze function return object
c = c.replace(/guven_seviyesi: guvenSeviyesi,/, '');
c = c.replace(/guven_skoru: guvenSkoru,/, '');
c = c.replace(/model_roi: modelRoi,/, '');
c = c.replace(/predictability: predictability/, '');
c = c.replace(/kalibrasyon_skoru,/, '');

// Remove trailing commas safely if needed (not strictly necessary but clean)
c = c.replace(/,\s*\}/g, '}');

fs.writeFileSync('src/lib/analyzeEngine.ts', c, 'utf8');
