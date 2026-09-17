import { Router } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rateLimit } from "express-rate-limit";
import { requireApiKey } from "../lib/apiAuthMiddleware";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

const router = Router();

// Rate limiter: 60 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Too many requests from this IP, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Protect all /api/v1 routes with API Key and Rate Limiter
router.use(apiLimiter);
router.use(requireApiKey);

// GET /api/v1/matches/today
router.get("/matches/today", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    const today = new Date().toISOString().split("T")[0];
    
    // Fetch today's predictions joined with match info
    const predictions = db.prepare(`
      SELECT 
        s.id, s.match_id, s.date, s.league, 
        m.ev_sahibi as home_team, m.deplasman as away_team,
        s.ms_prob, s.ms_prediction, s.ms_status,
        s.ou_prob, s.ou_prediction, s.ou_status,
        s.btts_prob as kg_prob, s.btts_prediction as kg_prediction, s.btts_status as kg_status
      FROM system_predictions s
      JOIN gecmis_maclar m ON s.match_id = m.id
      WHERE s.date = ? OR m.tarih LIKE '%' || ? || '%'
    `).all(today, today);

    res.json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
