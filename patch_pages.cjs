const fs = require('fs');

function addSeo(path) {
    let c = fs.readFileSync(path, 'utf8');
    if (!c.includes('SeoHead')) {
        c = c.replace(/import React/, "import React from 'react';\nimport { SeoHead } from '../components/seo/SeoHead';\n");
    }
    c = c.replace(/<div className="app-container"/, "<div className=\"app-container\">\n      <SeoHead title=\"KargaTahmin Admin\" description=\"Gizli alan\" url=\"/\" noindex />");
    fs.writeFileSync(path, c, 'utf8');
}

addSeo('artifacts/football-app/src/pages/AdminPage.tsx');
addSeo('artifacts/football-app/src/pages/BlogHome.tsx');
