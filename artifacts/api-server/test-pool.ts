
import { findSimilarMatches, SimilarityQuery } from './src/lib/similarity';
import { queryScraperMatches } from './src/lib/scraperDb';

const query: SimilarityQuery = {
  oddsHome: 2.1,
  oddsDraw: 3.2,
  oddsAway: 3.1,
  league: 'GREEK CUP QUALIFICATION'
};

const scraperMatches = queryScraperMatches(
  query.oddsHome,
  query.oddsDraw,
  query.oddsAway,
  'CLOSING',
  query.league
);

console.log('scraperMatches length from DB:', scraperMatches.length);

const results = findSimilarMatches(query, scraperMatches);

console.log('results length:', results.length);
if (results.length > 0) {
  console.log('Top match similarity:', results[0].similarityScore);
  console.log('Top match league:', results[0].match.league);
}

