import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const router: IRouter = Router();
const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = fs.existsSync("/var/www/futbol_app/gecmis_maclar.db") 
  ? "/var/www/futbol_app/gecmis_maclar.db" 
  : path.resolve(__dirnameLocal, "../../../../gecmis_maclar.db");
const db = new Database(dbPath);

router.get("/active", (req, res) => {
  try {
    const ann = db.prepare("SELECT * FROM announcements WHERE is_active = 1 ORDER BY id DESC LIMIT 1").get();
    res.json(ann || null);
  } catch (e: any) {
    if (e.message.includes("no such table")) {
      return res.json(null);
    }
    res.status(500).json({ error: e.message });
  }
});

export default router;
