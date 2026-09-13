
import { findSimilarMatches } from './src/lib/similarity';
import { queryScraperMatches } from './src/lib/scraperDb';

const query1 = {
  oddsHome: 2.1,
  oddsDraw: 3.2,
  oddsAway: 3.1,
  league: 'GREEK CUP QUALIFICATION'
};

const query2 = {
  oddsHome: 1.5,
  oddsDraw: 4.0,
  oddsAway: 5.0,
  league: 'GREEK CUP QUALIFICATION'
};

const matches1 = queryScraperMatches(query1.oddsHome, query1.oddsDraw, query1.oddsAway, 'CLOSING', query1.league);
const res1 = findSimilarMatches(query1, matches1);
console.log('Query 1 top match:', res1[0]?.match.id, res1[0]?.match.homeTeam, res1[0]?.match.awayTeam, res1[0]?.similarityScore);

const matches2 = queryScraperMatches(query2.oddsHome, query2.oddsDraw, query2.oddsAway, 'CLOSING', query2.league);
const res2 = findSimilarMatches(query2, matches2);
console.log('Query 2 top match:', res2[0]?.match.id, res2[0]?.match.homeTeam, res2[0]?.match.awayTeam, res2[0]?.similarityScore);


