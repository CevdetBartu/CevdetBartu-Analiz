
const { findSimilarMatches } = require('./dist/lib/similarity.js');
const db = require('better-sqlite3')('../../scripts/scraper/gecmis_maclar.db');
const { queryScraperMatches } = require('./dist/lib/scraperDb.js');

const query = {
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

console.log('scraperMatches length:', scraperMatches.length);

const results = findSimilarMatches(query, scraperMatches);

console.log('results length:', results.length);
if (results.length > 0) {
  console.log('Top match similarity:', results[0].similarityScore);
  console.log('Top match league:', results[0].match.league);
}

