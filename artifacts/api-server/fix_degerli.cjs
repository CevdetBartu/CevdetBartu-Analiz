const fs = require('fs');
let c = fs.readFileSync('src/lib/analyzeEngine.ts', 'utf8');

c = c.replace(/if \(t1\) \{\r?\n.*?tahminler\.push\(t1\);\r?\n\s*\}/s, 'if (t1) tahminler.push(t1);');
c = c.replace(/if \(t2\) \{\r?\n.*?tahminler\.push\(t2\);\r?\n\s*\}/s, 'if (t2) tahminler.push(t2);');

fs.writeFileSync('src/lib/analyzeEngine.ts', c, 'utf8');
