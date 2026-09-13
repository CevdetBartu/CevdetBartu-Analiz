import { findSimilarMatches } from "../artifacts/api-server/src/lib/similarity";
import { analyze } from "../artifacts/api-server/src/lib/analyzeEngine";
import { queryScraperMatches } from "../artifacts/api-server/src/lib/scraperDb";

const candidates = queryScraperMatches(2.74, 2.59, 2.17, "CLOSING");
const refMatches = findSimilarMatches({
  oddsHome: 2.74,
  oddsDraw: 2.59,
  oddsAway: 2.17
}, candidates);
const analyzeData = analyze({
  homeTeam: "Londrina",
  awayTeam: "Juventude",
  league: "Brezilya Serie B",
  oddsHome: 2.74,
  oddsDraw: 2.59,
  oddsAway: 2.17
}, refMatches);
console.log(JSON.stringify(analyzeData.analiz_ozet, null, 2));
