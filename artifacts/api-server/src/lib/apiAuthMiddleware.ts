import { Request, Response, NextFunction } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header("X-API-Key") || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: "API Key is required. Please provide it via 'X-API-Key' header." });
  }

  try {
    const db = new Database(DB_PATH);
    const keyRecord = db.prepare("SELECT * FROM api_keys WHERE key = ? AND status = 'active'").get(apiKey) as any;
    
    if (!keyRecord) {
      return res.status(403).json({ error: "Invalid or revoked API Key." });
    }

    // Attach user context to request
    (req as any).apiUserId = keyRecord.user_id;
    next();
  } catch (e: any) {
    res.status(500).json({ error: "Database error during API Key validation." });
  }
}
