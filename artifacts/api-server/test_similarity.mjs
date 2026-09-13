import { queryScraperMatches } from "./lib/scraperDb";
import { findSimilarMatches } from "./lib/similarity";
const query = {
    oddsHome: 1.19,
    oddsDraw: 6.5,
    oddsAway: 12.0,
    altOdds: 2.30,
    ustOdds: 1.55,
    varOdds: 2.10,
    yokOdds: 1.65,
    league: "isvecallsvenskan",
    homeTeam: "Djurgarden",
    awayTeam: "Halmstad",
    date: "13.07.2026"
};
const allMatches = queryScraperMatches(query.oddsHome, query.oddsDraw, query.oddsAway);
console.log("Total candidate matches from DB:", allMatches.length);
const results = findSimilarMatches(query, allMatches);
console.log("Total similar matches found:", results.length);
if (results.length > 0) {
    console.log("Top matches similarity score:", results[0].similarityScore);
}
