import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const db = new Database(dbPath, { readonly: false });

const router: IRouter = Router();

// GET /api/blog (Sadece yayınlanmış yazılar)
router.get("/", (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT id, title, slug, meta_description, created_at, updated_at 
      FROM blog_posts 
      WHERE status = 'published'
      ORDER BY created_at DESC LIMIT 20
    `).all();
    res.json(posts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/blog/:slug (Detay sayfası)
router.get("/:slug", (req, res) => {
  try {
    const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'").get(req.params.slug);
    if (!post) {
      res.status(404).json({ error: "Yazı bulunamadı veya henüz yayınlanmadı" });
      return;
    }
    res.json(post);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
