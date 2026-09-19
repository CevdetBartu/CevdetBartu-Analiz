import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const db = new Database(dbPath, { readonly: false });

const router: IRouter = Router();

// GET /api/admin/blog/drafts - Tüm yazıları (taslak + yayında) listeler
router.get("/drafts", (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT id, title, slug, status, created_at, updated_at, raw_data 
      FROM blog_posts 
      ORDER BY created_at DESC
    `).all();
    res.json(posts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET detay
router.get("/posts/:id", (req, res) => {
  try {
    const post = db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post bulunamadı" });
      return;
    }
    res.json(post);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT güncelle ve/veya yayınla
router.put("/posts/:id", (req, res) => {
  try {
    const { title, slug, meta_description, content, status } = req.body;
    
    // Basit slug formatlaması
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    db.prepare(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, meta_description = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, formattedSlug, meta_description, content, status, req.params.id);
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete("/posts/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM blog_posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// POST /api/admin/blog/manual (Create post manually)
router.post("/manual", (req, res) => {
  try {
    const { title, content, prediction, category, slug, excerpt, image_url } = req.body;
    const db = new Database(DB_PATH);
    const info = db.prepare(`
      INSERT INTO blog_posts (title, content, prediction, category, slug, excerpt, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(title, content, prediction, category, slug, excerpt, image_url);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// PUT /api/admin/blog/:id (Edit post)
router.put("/:id", (req, res) => {
  try {
    const { title, content, prediction, category, slug, excerpt, image_url } = req.body;
    const db = new Database(DB_PATH);
    db.prepare(`
      UPDATE blog_posts 
      SET title=?, content=?, prediction=?, category=?, slug=?, excerpt=?, image_url=?
      WHERE id = ?
    `).run(title, content, prediction, category, slug, excerpt, image_url, req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// DELETE /api/admin/blog/:id (Delete post)
router.delete("/:id", (req, res) => {
  try {
    const db = new Database(DB_PATH);
    db.prepare("DELETE FROM blog_posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
