import cron from "node-cron";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { queryScraperMatches } from "../lib/scraperDb";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

export function startSystemPredictionsJob() {
  // Her gün sabah 08:00'de o günün maçlarını analiz edip system_predictions tablosuna at
  cron.schedule("0 8 * * *", async () => {
    logger.info("[CRON] Starting Daily System Predictions Analysis...");
    try {
      const db = new Database(DB_PATH);
      
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const todayData = getTodayMatchesFromDb(todayStr);
      
      const insertStmt = db.prepare(`
        INSERT INTO system_predictions (
          match_id, date, league, 
          ms_prediction, ms_prob,
          ou_prediction, ou_prob,
          btts_prediction, btts_prob
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(match_id) DO NOTHING
      `);

      let count = 0;
      for (const m of todayData.matches) {
        // Event loop'un tıkanmasını önlemek için her maç arasında Node.js'e nefes aldırıyoruz
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!m.oran_1 || !m.oran_x || !m.oran_2) continue;
        
        const refsRaw = queryScraperMatches(m.oran_1, m.oran_x, m.oran_2, "CLOSING", m.lig, 15000);
        const similar = findSimilarMatches({
          oddsHome: m.oran_1, oddsDraw: m.oran_x, oddsAway: m.oran_2,
          league: m.lig, maxResults: 25
        }, refsRaw);

        const validRefs = similar.map(s => s.match);
        const analysis = analyze({
          date: m.tarih, time: m.saat, league: m.lig,
          homeTeam: m.ev_sahibi, awayTeam: m.deplasman,
          oddsHome: m.oran_1, oddsDraw: m.oran_x, oddsAway: m.oran_2
        }, validRefs);
        
        if (!analysis) continue;

        const msProb = Math.max(analysis.analiz_ozet.ev_sahibi.yuzde, analysis.analiz_ozet.beraberlik.yuzde, analysis.analiz_ozet.deplasman.yuzde);
        const msPred = msProb === analysis.analiz_ozet.ev_sahibi.yuzde ? '1' : msProb === analysis.analiz_ozet.beraberlik.yuzde ? 'X' : '2';
        
        const ouProb = Math.max(analysis.analiz_ozet.ust_25.yuzde, 100 - analysis.analiz_ozet.ust_25.yuzde);
        const ouPred = ouProb === analysis.analiz_ozet.ust_25.yuzde ? 'UST' : 'ALT';
        
        const bttsProb = Math.max(analysis.analiz_ozet.kg_var.yuzde, 100 - analysis.analiz_ozet.kg_var.yuzde);
        const bttsPred = bttsProb === analysis.analiz_ozet.kg_var.yuzde ? 'VAR' : 'YOK';
        
        try {
          insertStmt.run(m.id, todayStr, m.lig, msPred, msProb, ouPred, ouProb, bttsPred, bttsProb);
          count++;
        } catch(e) {}
      }
      logger.info(`[CRON] Daily System Predictions completed: added ${count} matches for ${todayStr}.`);
    } catch (e: any) {
      logger.error({ err: e }, "System Predictions Cron Job Error");
    }
  });
  
  logger.info("System Predictions Cron Job Started (runs every day at 08:00).");
}
