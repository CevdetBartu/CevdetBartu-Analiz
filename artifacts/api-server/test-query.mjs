
import { queryScraperMatches } from './dist/lib/scraperDb.mjs';

const res1 = queryScraperMatches(2.1, 3.2, 3.1, 'CLOSING', null);
console.log('Q1 matches:', res1.length);
if(res1.length > 0) console.log(res1[0].ev_sahibi, res1[0].oran_1);

const res2 = queryScraperMatches(1.5, 4.0, 5.0, 'CLOSING', null);
console.log('Q2 matches:', res2.length);
if(res2.length > 0) console.log(res2[0].ev_sahibi, res2[0].oran_1);

