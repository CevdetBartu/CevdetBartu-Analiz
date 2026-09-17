import cron from "node-cron";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { queryScraperMatches } from "../lib/scraperDb";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { generateDailyMultiMatchBlog } from "../lib/geminiEngine";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

export function startBlogDraftJob() {
  // Her gün sabah 09:00'de
  cron.schedule("15 9 * * *", async () => {
    logger.info("[CRON] Starting Daily Blog Draft Generation...");
    try {
      const db = new Database(DB_PATH);
      
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const todayData = getTodayMatchesFromDb(todayStr);
      let matches = todayData.matches || [];
      
      matches = matches.filter(m => m.oran_1 && m.oran_2 && m.oran_x);
      
      if (matches.length === 0) {
        logger.info("[CRON] No valid matches found for blog today.");
        return;
      }
      
      // En popüler / oranlari birbirine yakin olan veya frekansi yuksek olan ilk 4 maçi seç
      const topMatches = matches.slice(0, 4);
      
      const analyzedMatches = [];
      for (const m of topMatches) {
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
        
        if (analysis) {
          analyzedMatches.push({ ...m, stats: analysis.analiz_ozet });
        }
        await new Promise(r => setTimeout(r, 50));
      }
      
      if (analyzedMatches.length > 0) {
        const blogContent = await generateDailyMultiMatchBlog(analyzedMatches);
        
        db.prepare(`
          INSERT INTO blog_posts (title, slug, meta_description, content, status, raw_data)
          VALUES (?, ?, ?, ?, 'draft', ?)
        `).run(blogContent.title, blogContent.slug, blogContent.excerpt, blogContent.content, JSON.stringify(analyzedMatches));
        
        logger.info(`[CRON] Blog draft created: ${blogContent.title}`);
      }
      
    } catch (e: any) {
      logger.error({ err: e }, "Blog Draft Cron Error");
    }
  });
  
  logger.info("Blog Draft Cron Job Started (runs every day at 09:00).");
}
