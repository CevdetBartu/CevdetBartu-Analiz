import { analyze } from './src/lib/analyzeEngine.js';
const res = analyze({ homeTeam: 'Galatasaray', awayTeam: 'Fenerbahce', oddsHome: 2.10, oddsDraw: 3.20, oddsAway: 3.00, league: 'Türkiye Süper Lig', date: '17.08.2026', kita: 'EUROPE' }, []);
console.log(JSON.stringify(res, null, 2));
