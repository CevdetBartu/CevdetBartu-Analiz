const fs = require('fs');
let c = fs.readFileSync('src/routes/blog.ts', 'utf8');

c = c.replace(/real_edge_home:.*?,/g, '');
c = c.replace(/real_edge_draw:.*?,/g, '');
c = c.replace(/real_edge_away:.*?,/g, '');
c = c.replace(/real_edge_over25:.*?,/g, '');
c = c.replace(/real_edge_btts:.*?,/g, '');

fs.writeFileSync('src/routes/blog.ts', c, 'utf8');
