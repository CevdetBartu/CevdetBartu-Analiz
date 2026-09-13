import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import blogRouter from "./routes/blog";
import authRouter from "./routes/auth";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirnameLocal = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirnameLocal, "../../scripts/scraper/gecmis_maclar.db");

app.use("/api", router);
app.use("/api", authRouter);
app.use("/api", blogRouter);

app.get("/sitemap.xml", (req, res) => {
  try {
    const db = new Database(dbPath, { readonly: true });
    const posts = db.prepare("SELECT slug, category, created_at FROM blog_posts ORDER BY created_at DESC").all() as any[];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://crsanalytics.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://crsanalytics.com/bugun</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://crsanalytics.com/canli</loc>
    <changefreq>always</changefreq>
    <priority>0.8</priority>
  </url>`;

    const categories = new Set(posts.map(p => p.category).filter(Boolean));
    categories.forEach(cat => {
      xml += `
  <url>
    <loc>https://crsanalytics.com/kategori/${cat}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    posts.forEach(post => {
      if (!post.slug) return;
      const date = new Date(post.created_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>https://crsanalytics.com/blog/${post.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `\n</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) {
    logger.error(e);
    res.status(500).end();
  }
});

app.get("/robots.txt", (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /manuel

Sitemap: https://crsanalytics.com/sitemap.xml`;
  res.header("Content-Type", "text/plain");
  res.send(robots);
});

export default app;
