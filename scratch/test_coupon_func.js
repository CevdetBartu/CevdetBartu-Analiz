const { getTodayMatchesFromDb } = require("../artifacts/api-server/dist/lib/todayMatches.mjs");
const { findSimilarMatches } = require("../artifacts/api-server/dist/lib/similarity.mjs");
const { analyze } = require("../artifacts/api-server/dist/lib/analyzeEngine.mjs");
const { queryScraperMatches } = require("../artifacts/api-server/dist/lib/scraperDb.mjs");

try {
    const todayData = getTodayMatchesFromDb(new Date().toISOString().slice(0, 10));
    console.log("Matches:", todayData.matches.length);
    
    for (const m of todayData.matches) {
        if (!m.oran_1 || !m.oran_x || !m.oran_2) continue;
        console.log("Checking match:", m.ev_sahibi, "vs", m.deplasman);
        const refMatches = queryScraperMatches(m.oran_1, m.oran_x, m.oran_2, "CLOSING");
        console.log("Ref matches:", refMatches.length);
        
        const similar = findSimilarMatches({
            oddsHome: m.oran_1,
            oddsDraw: m.oran_x,
            oddsAway: m.oran_2,
            league: m.lig,
            homeTeam: m.ev_sahibi,
            awayTeam: m.deplasman
        }, refMatches);
        console.log("Similar matches:", similar.length);
        
        const modelA = analyze({
            homeTeam: m.ev_sahibi,
            awayTeam: m.deplasman,
            league: m.lig
        }, similar.map(s => Object.assign({}, s.match, { similarityScore: s.similarityScore })));
        console.log(modelA.analiz_ozet.total_mac);
    }
} catch (e) {
    console.error("Test Error:", e);
}

