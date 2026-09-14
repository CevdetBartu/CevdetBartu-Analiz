import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { logAudit } from "../lib/audit";

const router: IRouter = Router();
const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = fs.existsSync("/var/www/futbol_app/gecmis_maclar.db") 
  ? "/var/www/futbol_app/gecmis_maclar.db" 
  : path.resolve(__dirnameLocal, "../../../../gecmis_maclar.db");
const db = new Database(dbPath);

// Stats
router.get("/stats", (req, res) => {
  try {
    const total = db.prepare("SELECT COUNT(*) as c FROM users").get() as any;
    const newToday = db.prepare("SELECT COUNT(*) as c FROM users WHERE date(created_at) = date('now')").get() as any;
    const active = db.prepare("SELECT COUNT(*) as c FROM users WHERE is_banned = 0").get() as any;
    res.json({
      totalUsers: total.c,
      newToday: newToday.c,
      activeUsers: active.c
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Users
router.get("/users", (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : "%";

    const users = db.prepare(`
      SELECT id, email, membership_status, membership_plan, role, is_banned, last_login_at, created_at 
      FROM users 
      WHERE email LIKE ? 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `).all(search, limit, offset);
    
    const totalObj = db.prepare("SELECT COUNT(*) as c FROM users WHERE email LIKE ?").get(search) as any;
    
    res.json({
      users,
      total: totalObj.c,
      page,
      totalPages: Math.ceil(totalObj.c / limit)
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/users/:id", (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role, is_banned, membership_status } = req.body;
    
    if (id == req.user?.userId) {
      return res.status(403).json({ error: "Kendi hesabinizi duzenleyemezsiniz." });
    }

    const updates = [];
    const params = [];
    if (role !== undefined) { updates.push("role = ?"); params.push(role); }
    if (is_banned !== undefined) { updates.push("is_banned = ?"); params.push(is_banned ? 1 : 0); }
    if (membership_status !== undefined) { updates.push("membership_status = ?"); params.push(membership_status); }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);
      
      const targetUser = db.prepare("SELECT email FROM users WHERE id = ?").get(id) as any;
      logAudit(req.user.email, "UPDATE_USER", targetUser?.email || id);
    }
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/users/:id", (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (id == req.user?.userId) {
      return res.status(403).json({ error: "Kendi hesabinizi silemezsiniz." });
    }
    
    const targetUser = db.prepare("SELECT email FROM users WHERE id = ?").get(id) as any;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    
    logAudit(req.user.email, "DELETE_USER", targetUser?.email || id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Announcements
router.get("/announcements", (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM announcements ORDER BY id DESC").all();
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/announcements", (req: any, res) => {
  try {
    const { title, content, is_active } = req.body;
    db.prepare(`
      INSERT INTO announcements (title, content, is_active, created_by) 
      VALUES (?, ?, ?, ?)
    `).run(title, content, is_active ? 1 : 0, req.user.email);
    
    logAudit(req.user.email, "CREATE_ANNOUNCEMENT", title);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/announcements/:id", (req: any, res) => {
  try {
    const { title, content, is_active } = req.body;
    db.prepare(`
      UPDATE announcements 
      SET title = ?, content = ?, is_active = ?
      WHERE id = ?
    `).run(title, content, is_active === undefined ? 1 : (is_active ? 1 : 0), req.params.id);
    
    logAudit(req.user.email, "UPDATE_ANNOUNCEMENT", req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/announcements/:id", (req: any, res) => {
  try {
    db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.id);
    logAudit(req.user.email, "DELETE_ANNOUNCEMENT", req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Audit Logs
router.get("/audit", (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100").all();
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
