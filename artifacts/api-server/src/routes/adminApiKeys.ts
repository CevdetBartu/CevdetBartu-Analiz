import { Router } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../lib/userAuthMiddleware";
import crypto from "node:crypto";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

const router = Router();

router.use(requireAdmin);

// GET /api/admin/api-keys
router.get("/", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    // Add key_hint column migration if missing
    try { db.exec("ALTER TABLE api_keys ADD COLUMN key_hint TEXT"); } catch(e) {}
    
    const keys = db.prepare(`
      SELECT a.id, a.key_hint, a.status, a.created_at, u.username, u.email 
      FROM api_keys a 
      JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC
    `).all();
    res.json(keys);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/api-keys
router.post("/", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const db = new Database(DB_PATH);
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found." });

    const existing = db.prepare("SELECT id FROM api_keys WHERE user_id = ? AND status = 'active'").get(user.id);
    if (existing) return res.status(400).json({ error: "User already has an active API key." });

    const rawKey = "krg_" + crypto.randomBytes(24).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const hint = rawKey.substring(0, 10) + "...";

    try { db.exec("ALTER TABLE api_keys ADD COLUMN key_hint TEXT"); } catch(e) {}
    
    db.prepare("INSERT INTO api_keys (user_id, key, key_hint) VALUES (?, ?, ?)").run(user.id, hashedKey, hint);
    res.json({ success: true, key: rawKey }); // Return plaintext ONLY once
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/api-keys/:id/revoke
router.put("/:id/revoke", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    db.prepare("UPDATE api_keys SET status = 'revoked' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
