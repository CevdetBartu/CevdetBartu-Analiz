const fs = require('fs');
let c = fs.readFileSync('artifacts/api-server/.env', 'utf8');

c = c.replace(/GEMINI_API_KEY.*?\n/g, '');
c += '\n# Gemini API keys removed for security. Inject via environment variables in production.\n';

fs.writeFileSync('artifacts/api-server/.env', c, 'utf8');
