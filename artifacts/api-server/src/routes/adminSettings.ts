import { Router } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../lib/userAuthMiddleware";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

const router = Router();

// Allow reading settings publicly (or specific ones)
router.get("/public", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    const settings = db.prepare("SELECT setting_key, setting_value FROM site_settings").all() as any[];
    const dict = settings.reduce((acc, curr) => ({ ...acc, [curr.setting_key]: curr.setting_value }), {});
    res.json(dict);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Admin only routes
router.use(requireAdmin);

router.get("/", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    const settings = db.prepare("SELECT * FROM site_settings ORDER BY setting_key ASC").all();
    res.json(settings);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/", (req, res) => {
  try {
    const { settings } = req.body; // Expects { [key]: value }
    const db = new Database(DB_PATH);
    const stmt = db.prepare("UPDATE site_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?");
    
    db.transaction(() => {
      for (const [key, val] of Object.entries(settings)) {
        const res = stmt.run(String(val), key);
        if (res.changes === 0) {
           // Insert if it didn't exist
           db.prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)").run(key, String(val));
        }
      }
    })();
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
