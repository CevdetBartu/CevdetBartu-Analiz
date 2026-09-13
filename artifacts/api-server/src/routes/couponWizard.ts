import { Router, type IRouter } from "express";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/coupon/wizard", async (req, res): Promise<void> => {
  try {
    const { betType, count = 3 } = req.body;
    // betType can be: "ms1", "ms2", "msx", "kg_var", "ust_25", "ust_35", "ust_45", "gol_6_plus", "iy_ms_1_2", "iy_ms_2_1"
    
    // 1. Fetch today's matches
    const today = new Date().toISOString().split("T")[0];
    const todayData = getTodayMatchesFromDb(today);
    let matches = todayData.matches || [];
    
    // Yalnızca oranları olan maçları al
    matches = matches.filter(m => m.oran_1 && m.oran_2 && m.oran_x);
    
    // Oran kapanışı gelmemiş olsa bile şimdilik açık olanları alıyoruz.
    const { queryScraperMatches } = await import("../lib/scraperDb");

    let analyzedMatches = [];

    // Analyze ALL valid today's matches
    console.log('Starting loop for', matches.length, 'matches');
    let countIdx = 0;
    for (const targetMatch of matches) {
      countIdx++;
      if (countIdx % 50 === 0) console.log('Processed', countIdx, 'matches');
      const candidates = queryScraperMatches(
        targetMatch.oran_1, 
        targetMatch.oran_x, 
        targetMatch.oran_2, 
        "CLOSING"
      );

      const refMatches = findSimilarMatches({
        oddsHome: targetMatch.oran_1,
        oddsDraw: targetMatch.oran_x,
        oddsAway: targetMatch.oran_2,
        maxResults: 1500,
          altOdds: targetMatch.alt_orani,
        ustOdds: targetMatch.ust_orani,
        varOdds: targetMatch.kg_var,
        yokOdds: targetMatch.kg_yok,
        altOdds35: targetMatch.alt_orani_35,
        ustOdds35: targetMatch.ust_orani_35,
        iyAltOdds15: targetMatch.iy_alt_orani_15,
        iyUstOdds15: targetMatch.iy_ust_orani_15,
        iyAltOdds05: targetMatch.iy_alt_orani_05,
        iyUstOdds05: targetMatch.iy_ust_orani_05,
      }, candidates);

      if (refMatches.length === 0) continue;

      const analyzeData = analyze({
        homeTeam: targetMatch.ev_sahibi,
        awayTeam: targetMatch.deplasman,
        league: targetMatch.lig,
        oddsHome: targetMatch.oran_1,
        oddsDraw: targetMatch.oran_x,
        oddsAway: targetMatch.oran_2,
        maxResults: 1500
      }, refMatches);
      
      const stats = analyzeData.analiz_ozet;
      
      let probability = 0;
      let selection = "";
        let rankingScore = 0;
      let oran = "";
      
      switch (betType) {
        case "taraf":
          if (stats.ev_sahibi.yuzde >= stats.deplasman.yuzde) {
            probability = stats.ev_sahibi.yuzde;
            selection = "Maç Sonucu 1";
            oran = targetMatch.oran_1;
          } else {
            probability = stats.deplasman.yuzde;
            selection = "Maç Sonucu 2";
            oran = targetMatch.oran_2;
          }
          break;
        case "kg_var":
          probability = stats.kg_var.yuzde;
          selection = "Karşılıklı Gol Var";
          oran = targetMatch.kg_var || "-";
          break;
        case "ust_25":
          probability = stats.ust_25.yuzde;
          selection = "2.5 Gol Üstü";
          oran = targetMatch.ust_orani || "-";
          break;
        case "ust_35":
          probability = stats.ust_35.yuzde;
          selection = "3.5 Gol Üstü";
          oran = targetMatch.ust_orani_35 || "-";
          break;
        case "ust_45":
          probability = stats.ust_45?.yuzde || 0;
          selection = "4.5 Gol Üstü";
          oran = "-"; // Bülten 4.5 oranını vermeyebilir
          break;
        case "gol_6_plus":
          probability = stats.gol_6_plus?.yuzde || 0;
          selection = "6+ Gol";
          rankingScore = probability * 1000 + (stats.ust_35?.yuzde || 0);
          oran = "-";
          break;
        case "iy_ms_surpriz":
          const p12 = stats.iy_ms_1_2?.yuzde || 0;
          const p21 = stats.iy_ms_2_1?.yuzde || 0;
          if (p12 >= p21) {
            probability = p12;
            selection = "İlk Yarı 1 / Maç Sonucu 2 (1/2)";
            rankingScore = probability * 1000 + (stats.ms_2?.yuzde || 0);
          } else {
            probability = p21;
            selection = "İlk Yarı 2 / Maç Sonucu 1 (2/1)";
            rankingScore = probability * 1000 + (stats.ms_1?.yuzde || 0);
          }
          oran = "-";
          break;
        default:
          probability = 0;
      }
      
      console.log('Prob:', probability, 'stats.iy_ms_1_2:', stats.iy_ms_1_2, 'stats.iy_ms_2_1:', stats.iy_ms_2_1);
        if (probability >= 0) {
        analyzedMatches.push({
          match_id: targetMatch.id,
          tarih: targetMatch.tarih,
          saat: targetMatch.saat,
          lig: targetMatch.lig,
          ev_sahibi: targetMatch.ev_sahibi,
          deplasman: targetMatch.deplasman,
          selection: selection,
          oran: oran,
          probability: probability,
          refCount: stats.total_mac,
          guvenlik_skoru: stats.guvenlik_skoru
        });
      }
    }
    
    // Sort by probability descending
    analyzedMatches.sort((a, b) => {
      if (b.probability !== a.probability) return b.probability - a.probability;
      return b.refCount - a.refCount;
    });
    
    // Return top N
    const couponMatches = analyzedMatches.slice(0, count);
    
    res.json({ success: true, matches: couponMatches });
  } catch (e: any) {
    logger.error({ err: e }, "POST /coupon/wizard error");
    res.status(500).json({ error: e.message });
  }
});

export default router;
