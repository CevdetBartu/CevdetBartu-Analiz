import { queryScraperMatches } from "./lib/scraperDb";
import { findSimilarMatches } from "./lib/similarity";
import { analyze } from "./lib/analyzeEngine";

const target = {
  date: "20.07.2026",
  time: "22:00",
  league: "Ecuador - LigaPro Serie A, Primera Etapa",
  homeTeam: "Mushuc Runa SC",
  awayTeam: "Orense SC",
  ligSirasiHome: 14,
  ligSirasiAway: 12,
  ligSirasiTotal: 16,
  oddsHome: 1.86,
  oddsDraw: 3.4,
  oddsAway: 4.1,
  altOdds: 1.91,
  ustOdds: 1.8,
  varOdds: 1.83,
  yokOdds: 1.83,
  altOdds35: 1.29,
  ustOdds35: 3.5,
  avgOddsMin: 1.86,
  avgOddsMax: 4.0
};

const allMatches = queryScraperMatches(target.oddsHome, target.oddsDraw, target.oddsAway, "CLOSING");
const similar = findSimilarMatches(target, allMatches);
console.log("Total candidate matches in DB:", allMatches.length);
console.log("Total similar matches found:", similar.length);

const refMatches = similar.map((res: any) => {
  const m = res.match;
  return {
    ...m,
    id: m.id.toString(),
    oddsHome: m.oddsHome ? parseFloat(m.oddsHome) : null,
    oddsDraw: m.oddsDraw ? parseFloat(m.oddsDraw) : null,
    oddsAway: m.oddsAway ? parseFloat(m.oddsAway) : null,
    altOdds: m.altOdds ? parseFloat(m.altOdds) : null,
    ustOdds: m.ustOdds ? parseFloat(m.ustOdds) : null,
    varOdds: m.varOdds ? parseFloat(m.varOdds) : null,
    yokOdds: m.yokOdds ? parseFloat(m.yokOdds) : null,
    altOdds35: m.altOdds35 ? parseFloat(m.altOdds35) : null,
    ustOdds35: m.ustOdds35 ? parseFloat(m.ustOdds35) : null,
    iyAltOdds15: m.iyAltOdds15 ? parseFloat(m.iyAltOdds15) : null,
    iyUstOdds15: m.iyUstOdds15 ? parseFloat(m.iyUstOdds15) : null,
    iyAltOdds05: m.iyAltOdds05 ? parseFloat(m.iyAltOdds05) : null,
    iyUstOdds05: m.iyUstOdds05 ? parseFloat(m.iyUstOdds05) : null,
    avgOddsMin: m.avgOddsMin ? parseFloat(m.avgOddsMin) : null,
    avgOddsMax: m.avgOddsMax ? parseFloat(m.avgOddsMax) : null,
    similarityScore: res.similarityScore
  };
});

const resAnalysis = analyze(target, refMatches);
const ozet = resAnalysis.analiz_ozet;
console.log("--- BASELINE ANALYSIS RESULTS ---");
console.log(`Ev sahibi yuzde: ${ozet.ev_sahibi.yuzde}%`);
console.log(`Beraberlik yuzde: ${ozet.beraberlik.yuzde}%`);
console.log(`Deplasman yuzde: ${ozet.deplasman.yuzde}%`);
console.log(`2.5 Ust yuzde: ${ozet.ust_25.yuzde}%`);
console.log(`KG Var yuzde: ${ozet.kg_var.yuzde}%`);
console.log("Kelly home edge:", ozet.kelly_onerileri?.ev_sahibi?.edge);
console.log("Kelly draw edge:", ozet.kelly_onerileri?.beraberlik?.edge);
console.log("Kelly away edge:", ozet.kelly_onerileri?.deplasman?.edge);
console.log("Tahminler:", resAnalysis.tahminler);
