const fs = require("fs");
const path = require("path");

const fpath = path.join(__dirname, "..", "artifacts", "api-server", "src", "routes", "coupon.ts");

const code = `import { Router, type IRouter } from "express";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { queryScraperMatches } from "../lib/scraperDb";
import { logger } from "../lib/logger";

const router: IRouter = Router();

let couponCache: any = null;
let couponCacheDate: string | null = null;

router.get("/coupon-of-the-day", async (req, res): Promise<void> => {
  try {
    // Trkiye saatine gre bugnn tarihini al (gece 00:00'da sfrlanmas iin)
    const trTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
    const trDateObj = new Date(trTime);
    const y = trDateObj.getFullYear();
    const m = String(trDateObj.getMonth() + 1).padStart(2, "0");
    const d = String(trDateObj.getDate()).padStart(2, "0");
    const today = \`\${y}-\${m}-\${d}\`;
    
    if (couponCache && couponCacheDate === today) {
      res.json(couponCache);
      return;
    }
    
    const todayData = getTodayMatchesFromDb(today);
    const tm = todayData.matches || [];
    
    let pool_iy15: any[] = [];
    let pool_ust25: any[] = [];
    let pool_kgvar: any[] = [];
    
    for (const match of tm) {
      if (!match.oran_1 || !match.oran_x || !match.oran_2) continue;
      
      const refMatches = queryScraperMatches(match.oran_1, match.oran_x, match.oran_2, "CLOSING");
      
      const similar = findSimilarMatches({
        oddsHome: match.oran_1,
        oddsDraw: match.oran_x,
        oddsAway: match.oran_2,
        altOdds: match.alt_orani,
        ustOdds: match.ust_orani,
        varOdds: match.kg_var,
        yokOdds: match.kg_yok,
        altOdds35: match.alt_orani_35,
        ustOdds35: match.ust_orani_35,
        league: match.lig,
        homeTeam: match.ev_sahibi,
        awayTeam: match.deplasman
      }, refMatches);
      
      if (similar.length < 3) continue; // Minimum 3 referans
      
      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: parseFloat(s.match.oddsHome),
        oddsDraw: parseFloat(s.match.oddsDraw),
        oddsAway: parseFloat(s.match.oddsAway),
        altOdds: s.match.altOdds != null ? parseFloat(s.match.altOdds) : null,
        ustOdds: s.match.ustOdds != null ? parseFloat(s.match.ustOdds) : null,
        varOdds: s.match.varOdds != null ? parseFloat(s.match.varOdds) : null,
        yokOdds: s.match.yokOdds != null ? parseFloat(s.match.yokOdds) : null,
        altOdds35: s.match.altOdds35 != null ? parseFloat(s.match.altOdds35) : null,
        ustOdds35: s.match.ustOdds35 != null ? parseFloat(s.match.ustOdds35) : null,
        iyAltOdds15: s.match.iyAltOdds15 != null ? parseFloat(s.match.iyAltOdds15) : null,
        iyUstOdds15: s.match.iyUstOdds15 != null ? parseFloat(s.match.iyUstOdds15) : null,
        iyAltOdds05: s.match.iyAltOdds05 != null ? parseFloat(s.match.iyAltOdds05) : null,
        iyUstOdds05: s.match.iyUstOdds05 != null ? parseFloat(s.match.iyUstOdds05) : null,
        avgOddsMin: s.match.avgOddsMin != null ? parseFloat(s.match.avgOddsMin) : null,
        avgOddsMax: s.match.avgOddsMax != null ? parseFloat(s.match.avgOddsMax) : null,
        similarityScore: s.similarityScore
      }));
      
      const modelA = analyze({
        homeTeam: match.ev_sahibi,
        awayTeam: match.deplasman,
        league: match.lig
      }, mappedSims);
      
      const ozet = modelA.analiz_ozet;
      if (ozet.total_mac < 3) continue;
      
      const pushToPool = (stat: any, name: string, poolArr: any[]) => {
        if (stat && typeof stat.yuzde === "number" && stat.yuzde >= 75 && stat.yuzde <= 100) {
          poolArr.push({
            match: \`\${match.ev_sahibi} v \${match.deplasman}\`,
            league: match.lig,
            time: match.saat,
            prediction: name,
            probability: stat.yuzde,
            totalMatches: ozet.total_mac,
            score: (stat.yuzde * 100) + ozet.total_mac // Weighted score for sorting
          });
        }
      };
      
      pushToPool(ozet.iy_ust_15, "İY 1.5 Üst", pool_iy15);
      pushToPool(ozet.ust_25, "2.5 Gol Üst", pool_ust25);
      pushToPool(ozet.kg_var, "Karşılıklı Gol Var", pool_kgvar);
    }
    
    const getTop3 = (pool: any[]) => {
      pool.sort((a, b) => b.score - a.score);
      const res = [];
      const seen = new Set();
      for (const p of pool) {
        if (!seen.has(p.match)) {
          res.push(p);
          seen.add(p.match);
          if (res.length >= 3) break;
        }
      }
      return res;
    };
    
    const coupon_iy15 = getTop3(pool_iy15);
    const coupon_ust25 = getTop3(pool_ust25);
    
    // Karma kupon: 2.5 st ve KG Var karmas
    const pool_karma = [...pool_ust25, ...pool_kgvar];
    const coupon_karma = getTop3(pool_karma);
    
    const finalResult = {
      iy15: coupon_iy15,
      ust25: coupon_ust25,
      karma: coupon_karma
    };
    
    couponCache = finalResult;
    couponCacheDate = today;
    
    res.json(finalResult);
  } catch (e: any) {
    console.error(e); 
    logger.error({ err: e }, "coupon-of-the-day route error");
    res.status(500).json({ error: "Kupon hesaplanırken hata oluştu." });
  }
});

export default router;
`;

fs.writeFileSync(fpath, code, "utf-8");
console.log("Updated coupon.ts to support 3 distinct coupons!");

