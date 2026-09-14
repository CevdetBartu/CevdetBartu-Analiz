const fs = require('fs');
let c = fs.readFileSync('src/lib/analyzeEngine.ts', 'utf8');

c = c.replace(/if \(homePct >= 85 && isHighSim\) t1 = .*?;\r?\n\s*else if \(homePct >= 75\) t1 = 'DA \| 1';/s, `if (homePct >= 75) t1 = 'DA | 1';`);
c = c.replace(/if \(awayPct >= 85 && isHighSim\) t2 = .*?;\r?\n\s*else if \(awayPct >= 75\) t2 = 'DA \| 2';/s, `if (awayPct >= 75) t2 = 'DA | 2';`);
c = c.replace(/if \(drawPct >= 50 && isHighSim\) tahminler\.push\(.*?\);\r?\n\s*else if \(drawPct >= 40\) tahminler\.push\('DA \| X'\);/s, `if (drawPct >= 40) tahminler.push('DA | X');`);
c = c.replace(/if \(bttsPct >= 85 && isHighSim\) tahminler\.push\(.*?\);\r?\n\s*else if \(bttsPct >= 75\) tahminler\.push\('MS \| KG VAR'\);\r?\n\s*else if \(bttsPct <= 15 && isHighSim\) tahminler\.push\(.*?\);\r?\n\s*else if \(bttsPct <= 25\) tahminler\.push\('MS \| KG YOK'\);/s, `if (bttsPct >= 75) tahminler.push('MS | KG VAR');\n      else if (bttsPct <= 25) tahminler.push('MS | KG YOK');`);
c = c.replace(/if \(over25Pct >= 85 && isHighSim\) tahminler\.push\(.*?\);\r?\n\s*else if \(over25Pct >= 75\) tahminler\.push\('MS \| 2,5 .*?ST'\);\r?\n\s*else if \(over25Pct <= 15 && isHighSim\) tahminler\.push\(.*?\);\r?\n\s*else if \(over25Pct <= 25\) tahminler\.push\('MS \| 2,5 ALT'\);/s, `if (over25Pct >= 75) tahminler.push('MS | 2,5 ÜST');\n      else if (over25Pct <= 25) tahminler.push('MS | 2,5 ALT');`);

fs.writeFileSync('src/lib/analyzeEngine.ts', c, 'utf8');
