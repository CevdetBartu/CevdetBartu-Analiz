import { queryScraperMatches } from './src/lib/scraperDb.ts';
import { findSimilarMatches } from './src/lib/similarity.ts';
import { analyze } from './src/lib/analyzeEngine.ts';

const start = performance.now();
const refs = queryScraperMatches(2.1, 3.1, 2.5, 'CLOSING', 'Super Lig', 15000);
const qTime = performance.now();
const sim = findSimilarMatches({oddsHome: 2.1, oddsDraw: 3.1, oddsAway: 2.5, league: 'Super Lig', maxResults: 25}, refs);
const sTime = performance.now();
const a = analyze({date: '2026-09-15', time: '20:00', homeTeam: 'A', awayTeam: 'B', oddsHome: 2.1}, sim.map(x=>x.match));
const aTime = performance.now();

console.log('Query time:', (qTime - start).toFixed(2), 'ms');
console.log('Similarity time:', (sTime - qTime).toFixed(2), 'ms');
console.log('Analyze time:', (aTime - sTime).toFixed(2), 'ms');
console.log('Total time:', (aTime - start).toFixed(2), 'ms');
