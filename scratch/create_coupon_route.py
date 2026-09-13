import os
fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\api-server\src\routes\coupon.ts"
code = """import { Router, type IRouter } from "express";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { queryScraperMatches } from "../lib/scraperDb";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// In-memory cache to avoid heavy calculations on every page load
let couponCache: any = null;
let couponCacheDate: string | null = null;

router.get("/coupon-of-the-day", async (req, res): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    if (couponCache && couponCacheDate === today) {
      res.json(couponCache);
      return;
    }
    
    const todayData = getTodayMatchesFromDb(today);
    const tm = todayData.matches || [];
    
    let predictions: any[] = [];
    
    for (const m of tm) {
      if (!m.oran_1 || !m.oran_x || !m.oran_2) continue;
      
      const refMatches = queryScraperMatches(m.oran_1, m.oran_x, m.oran_2, "CLOSING");
      
      const similar = findSimilarMatches({
        oddsHome: m.oran_1,
        oddsDraw: m.oran_x,
        oddsAway: m.oran_2,
        altOdds: m.alt_orani,
        ustOdds: m.ust_orani,
        varOdds: m.kg_var,
        yokOdds: m.kg_yok,
        altOdds35: m.alt_orani_35,
        ustOdds35: m.ust_orani_35,
        league: m.lig,
        homeTeam: m.ev_sahibi,
        awayTeam: m.deplasman
      }, refMatches);
      
      if (similar.length < 3) continue; // Minimum 3 referans
      
      const mappedSims = similar.map((s: any) => ({
        ...s.match,
        oddsHome: s.match.oran_1,
        oddsDraw: s.match.oran_x,
        oddsAway: s.match.oran_2,
        similarityScore: s.similarityScore
      }));
      
      const modelA = analyze({
        homeTeam: m.ev_sahibi,
        awayTeam: m.deplasman,
        league: m.lig
      }, mappedSims);
      
      const ozet = modelA.analiz_ozet;
      if (ozet.total_mac < 3) continue;
      
      const checkPred = (stat: any, name: string) => {
        if (stat.yuzde >= 75 && stat.yuzde < 100) {
          predictions.push({
            match: `${m.ev_sahibi} v ${m.deplasman}`,
            league: m.lig,
            time: m.saat,
            prediction: name,
            probability: stat.yuzde,
            totalMatches: ozet.total_mac,
            score: (stat.yuzde * 100) + ozet.total_mac // Weighted score for sorting
          });
        }
      };
      
      checkPred(ozet.ev_sahibi, "Maç Sonucu 1");
      checkPred(ozet.beraberlik, "Maç Sonucu X");
      checkPred(ozet.deplasman, "Maç Sonucu 2");
      checkPred(ozet.ust_25, "2.5 Gol Üst");
      checkPred(ozet.kg_var, "Karşılıklı Gol Var");
      checkPred(ozet.iy_ust_05, "İY 0.5 Üst");
      checkPred(ozet.iy_ust_15, "İY 1.5 Üst");
    }
    
    // Sort by weighted score descending
    predictions.sort((a, b) => b.score - a.score);
    
    // Take top 3 UNIQUE matches
    let finalCoupon = [];
    let seenMatches = new Set();
    for (const p of predictions) {
      if (!seenMatches.has(p.match)) {
        finalCoupon.push(p);
        seenMatches.add(p.match);
        if (finalCoupon.length >= 3) break;
      }
    }
    
    couponCache = finalCoupon;
    couponCacheDate = today;
    
    res.json(finalCoupon);
  } catch (e: any) {
    logger.error({ err: e }, "coupon-of-the-day route error");
    res.status(500).json({ error: "Kupon hesaplanırken hata oluştu." });
  }
});

export default router;
"""
with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("coupon.ts created!")

