import { Router } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../lib/userAuthMiddleware";
import bcrypt from "bcryptjs";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirnameLocal, "../../../../scripts/scraper/gecmis_maclar.db");

const router = Router();
router.use(requireAdmin);

// GET /api/admin/users
router.get("/", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    const users = db.prepare("SELECT id, email, created_at, membership_status, membership_plan, role, is_banned, last_login_at, vip_expires_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/users (Create new user)
router.post("/", async (req, res) => {
  try {
    const { email, password, role, membership_plan, vip_expires_at } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const db = new Database(DB_PATH);
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.status(400).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const info = db.prepare(`
      INSERT INTO users (email, password_hash, role, membership_plan, vip_expires_at) 
      VALUES (?, ?, ?, ?, ?)
    `).run(email, passwordHash, role || 'user', membership_plan || 'free', vip_expires_at || null);
    
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/users/:id (Update user)
router.put("/:id", async (req, res) => {
  try {
    const { email, role, membership_plan, is_banned, vip_expires_at, password } = req.body;
    const db = new Database(DB_PATH);
    
    let query = "UPDATE users SET email = ?, role = ?, membership_plan = ?, is_banned = ?, vip_expires_at = ?";
    let params: any[] = [email, role, membership_plan, is_banned ? 1 : 0, vip_expires_at || null];

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      query += ", password_hash = ?";
      params.push(passwordHash);
    }
    
    query += " WHERE id = ?";
    params.push(req.params.id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/:id", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    // Optional: delete related api keys or predictions if strict foreign keys aren't cascaded
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
