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
    
    // Fetch today's predictions
    const predictions = db.prepare(`
      SELECT 
        id, match_id, date, time, 
        home_team, away_team, league, 
        ms_prob, ms_prediction,
        ou_prob, ou_prediction,
        kg_prob, kg_prediction,
        ms_status, ou_status, kg_status
      FROM system_predictions 
      WHERE date = ?
    `).all(today);

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
