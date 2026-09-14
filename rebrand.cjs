const fs = require('fs');

function replaceInFile(path, replacements) {
    if(!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    let changed = false;
    for (const [from, to] of replacements) {
        if (content.includes(from)) {
            content = content.replaceAll(from, to);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(path, content, 'utf8');
        console.log('Updated ' + path);
    }
}

// Backend Rebranding
const apiReplacements = [
    ['crsanalytics.com', 'kargatahmin.com'],
    ['crs_super_secret_token_2026', 'karga_super_secret_token_2026'],
    ['crs_jwt_super_secret_2026_fallback', 'karga_jwt_super_secret_2026_fallback'],
    ['crs-secret-admin-key-9988', 'karga-secret-admin-key-9988'],
];

replaceInFile('artifacts/api-server/src/app.ts', apiReplacements);
replaceInFile('artifacts/api-server/src/lib/auth.ts', apiReplacements);
replaceInFile('artifacts/api-server/src/lib/userAuthMiddleware.ts', apiReplacements);
replaceInFile('artifacts/api-server/src/routes/auth.ts', apiReplacements);
replaceInFile('artifacts/api-server/src/routes/index.ts', apiReplacements);
replaceInFile('artifacts/api-server/src/routes/userAuth.ts', apiReplacements);

// Frontend Rebranding
const appReplacements = [
    ['crs_favorites', 'karga_favorites'],
    ['CevdetBartu Futbol Analiz', 'KargaTahmin Analiz'],
    ['CevdetBartu', 'KargaTahmin']
];
replaceInFile('artifacts/football-app/src/pages/LiveMatchesPage.tsx', appReplacements);
replaceInFile('artifacts/football-app/index.html', appReplacements);
// (dist is ignored, will be rebuilt)

console.log('Rebranding string replacements complete.');
