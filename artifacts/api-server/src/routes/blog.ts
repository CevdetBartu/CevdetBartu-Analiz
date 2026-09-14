import { Router, type IRouter } from "express";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";
import { getTodayMatchesFromDb } from "../lib/todayMatches";
import { findSimilarMatches } from "../lib/similarity";
import { analyze } from "../lib/analyzeEngine";
import { generateSEOBlogPost } from "../lib/geminiEngine";
import { requireAdmin } from "../lib/auth";
import { requireUser } from "../lib/userAuthMiddleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = require("fs").existsSync("/var/www/futbol_app/gecmis_maclar.db") ? "/var/www/futbol_app/gecmis_maclar.db" : path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const db = new Database(dbPath, { readonly: false });

const router: IRouter = Router();

// GET /api/blog
router.get("/blog", (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT b.*, t.oran_1, t.oran_x, t.oran_2 
      FROM blog_posts b 
      LEFT JOIN gecmis_maclar t ON b.match_id = t.id 
      ORDER BY b.created_at DESC LIMIT 20
    `).all();
    res.json(posts);
  } catch (e: any) {
    logger.error({ err: e }, "GET /blog error");
    res.status(500).json({ error: e.message });
  }
});

// GET /api/blog/:slug
router.get("/blog/:slug", requireUser, (req, res) => {
  try {
    const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(req.params.slug);
    if (!post) {
      res.status(404).json({ error: "Post bulunamadı" });
      return;
    }
    res.json(post);
  } catch (e: any) {
    logger.error({ err: e }, "GET /blog/:slug error");
    res.status(500).json({ error: e.message });
  }
});

// POST /api/blog/generate-daily
router.post("/blog/generate-daily", requireAdmin, async (req, res): Promise<void> => {
  try {
    // 1. Fetch today's matches
    const today = new Date().toISOString().split("T")[0];
    const todayData = getTodayMatchesFromDb(today);
    let matches = todayData.matches || [];
    
    // Yalnizca oranlari olan maclari al
    matches = matches.filter(m => m.oran_1 && m.oran_2 && m.oran_x);
    
    // Sort them by frequency (frekans_count) or some logic to find top matches
    matches.sort((a, b) => (b.frekans_count || 0) - (a.frekans_count || 0));
    const topMatches = matches.slice(0, 3); // Pick top 3 matches for the blog
    
    const generatedPosts = [];
    const { queryScraperMatches } = await import("../lib/scraperDb");

    for (const targetMatch of topMatches) {
      // 1. Mükerrer içerik (Duplicate) kontrolü - Aynı maç için zaten blog varsa atla!
      const existingPost = db.prepare("SELECT id FROM blog_posts WHERE match_id = ?").get(targetMatch.id);
      if (existingPost) {
        continue;
      }

      // 2. Aday maçları veritabanından çek
      const candidates = queryScraperMatches(
        targetMatch.oran_1, 
        targetMatch.oran_x, 
        targetMatch.oran_2, 
        "CLOSING"
      );

      // 2. Benzer maçları bul
      const refMatches = findSimilarMatches({
        oddsHome: targetMatch.oran_1,
        oddsDraw: targetMatch.oran_x,
        oddsAway: targetMatch.oran_2,
        altOdds: targetMatch.alt_orani,
        ustOdds: targetMatch.ust_orani,
        varOdds: targetMatch.kg_var,
        yokOdds: targetMatch.kg_yok,
        altOdds35: targetMatch.alt_orani_35,
        ustOdds35: targetMatch.ust_orani_35,
        iyAltOdds15: targetMatch.iy_alt_orani_15,
        iyUstOdds15: targetMatch.iy_ust_orani_15,
        iyAltOdds05: targetMatch.iy_alt_orani_05,
        iyUstOdds05: targetMatch.iy_ust_orani_05,
      }, candidates);

      // Analyze
      const analyzeData = analyze({
        homeTeam: targetMatch.ev_sahibi,
        awayTeam: targetMatch.deplasman,
        league: targetMatch.lig,
        oddsHome: targetMatch.oran_1,
        oddsDraw: targetMatch.oran_x,
        oddsAway: targetMatch.oran_2,
      }, refMatches);
      
      // Generate AI commentary
      const blogData = await generateSEOBlogPost(
        { homeTeam: targetMatch.ev_sahibi, awayTeam: targetMatch.deplasman, league: targetMatch.lig },
        analyzeData.analiz_ozet
      );

      // Save to database
      const stats = analyzeData.analiz_ozet;
      const edges = [
        { isim: "Ev Sahibi (MS1)", deger: analyzeData.real_edge_home || -99 },
        { isim: "Beraberlik (MSX)", deger: analyzeData.real_edge_draw || -99 },
        { isim: "Deplasman (MS2)", deger: analyzeData.real_edge_away || -99 },
        { isim: "2.5 Üst", deger: analyzeData.real_edge_over25 || -99 },
        { isim: "Karşılıklı Gol Var (KG Var)", deger: analyzeData.real_edge_btts || -99 }
      ];
      edges.sort((a, b) => b.deger - a.deger);
      const prediction = edges[0].isim;

      const insertStmt = db.prepare(`
        INSERT INTO blog_posts (match_id, title, content, prediction, slug, category, excerpt, read_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        targetMatch.id, 
        blogData.title, 
        blogData.content, 
        prediction,
        blogData.slug,
        targetMatch.lig,
        blogData.excerpt,
        blogData.read_time
      );
      
      generatedPosts.push({
        id: result.lastInsertRowid,
        ...blogData,
        prediction,
        match_id: targetMatch.id,
        created_at: new Date().toISOString()
      });
    }

    res.json({ success: true, posts: generatedPosts });
  } catch (e: any) {
    logger.error({ err: e }, "generate-daily route error");
    res.status(500).json({ error: e.message || "Blog üretilirken hata oluştu.", stack: e.stack });
  }
});

// DELETE /api/blog/:id (Opsiyonel: Silmek için)
router.delete("/blog/:id", requireAdmin, (req, res) => {
  try {
    const id = req.params.id;
    db.prepare("DELETE FROM blog_posts WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/blog/:id
router.put("/blog/:id", requireAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const { title, content, excerpt, category, prediction } = req.body;
    db.prepare(`
      UPDATE blog_posts 
      SET title = ?, content = ?, excerpt = ?, category = ?, prediction = ?
      WHERE id = ?
    `).run(title, content, excerpt, category, prediction, id);
    res.json({ success: true });
  } catch (e: any) {
    logger.error({ err: e }, "PUT /blog/:id error");
    res.status(500).json({ error: e.message });
  }
});

export default router;
