import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router: IRouter = Router();
const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../scripts/scraper/gecmis_maclar.db");

router.get("/success-rate", (req, res): void => {
  try {
    const db = new Database(DB_PATH);
    const filter = req.query.filter || '30'; // '7', '30', 'all'
    
    let dateCondition = "";
    if (filter === '7') dateCondition = "WHERE date >= date('now', '-7 days')";
    else if (filter === '30') dateCondition = "WHERE date >= date('now', '-30 days')";

    // Genel Metrikleri Hesapla
    const query = `
      SELECT 
        COUNT(*) as total_analyzed,
        SUM(CASE WHEN ms_status = 'correct' THEN 1 ELSE 0 END) as ms_correct,
        SUM(CASE WHEN ms_status = 'incorrect' THEN 1 ELSE 0 END) as ms_incorrect,
        SUM(CASE WHEN ou_status = 'correct' THEN 1 ELSE 0 END) as ou_correct,
        SUM(CASE WHEN ou_status = 'incorrect' THEN 1 ELSE 0 END) as ou_incorrect,
        SUM(CASE WHEN btts_status = 'correct' THEN 1 ELSE 0 END) as btts_correct,
        SUM(CASE WHEN btts_status = 'incorrect' THEN 1 ELSE 0 END) as btts_incorrect
      FROM system_predictions
      ${dateCondition}
    `;
    const row = db.prepare(query).get() as any;

    const calcRate = (c: number, i: number) => (c + i > 0) ? ((c / (c + i)) * 100).toFixed(1) : 0;
    
    // Zaman serisi grafiği için (Son 7 veya 30 günün günlük isabet oranları - MS üzerinden)
    const trendQuery = `
      SELECT date, 
             COUNT(*) as count,
             SUM(CASE WHEN ms_status = 'correct' THEN 1 ELSE 0 END) as correct
      FROM system_predictions
      ${dateCondition}
      GROUP BY date
      ORDER BY date ASC
    `;
    const trendRows = db.prepare(trendQuery).all() as any[];
    
    const chartData = trendRows.map(r => ({
      date: r.date,
      rate: r.count > 0 ? ((r.correct / r.count) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      stats: {
        total: row.total_analyzed,
        msRate: calcRate(row.ms_correct, row.ms_incorrect),
        ouRate: calcRate(row.ou_correct, row.ou_incorrect),
        bttsRate: calcRate(row.btts_correct, row.btts_incorrect)
      },
      trend: chartData
    });
  } catch (err: any) {
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

export default router;
