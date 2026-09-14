const fs = require('fs');
let c = fs.readFileSync('artifacts/football-app/src/components/seo/SeoHead.tsx', 'utf8');

c = c.replace(/schema\?: any;\r?\n}/, "schema?: any;\n  noindex?: boolean;\n}");
c = c.replace(/schema,\r?\n\}\) => \{/, "schema,\n  noindex,\n}) => {");
c = c.replace(/<title>\{title\}<\/title>/, "<title>{title}</title>\n      {noindex && <meta name=\"robots\" content=\"noindex, nofollow\" />}");

fs.writeFileSync('artifacts/football-app/src/components/seo/SeoHead.tsx', c, 'utf8');
