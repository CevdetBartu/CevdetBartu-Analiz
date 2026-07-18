/**
 * Admin rotaları — Scraper kontrol sunucusuna (Python/Flask, port 5051) proxy atar.
 */
import { Router, type IRouter } from "express";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router: IRouter = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../../../scripts/scraper/gecmis_maclar.db");
const FLASK = "http://127.0.0.1:5051";
const TIMEOUT = 6_000;

async function proxyGet(path: string): Promise<Response> {
  return fetch(`${FLASK}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT),
  });
}

async function proxyPost(path: string, body?: unknown): Promise<Response> {
  return fetch(`${FLASK}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT),
  });
}

function offline(res: import("express").Response, detail: string) {
  res.status(503).json({
    error: "Scraper servisi çalışmıyor",
    hint: "python3 scripts/scraper/run.py komutunu çalıştırın",
    detail,
  });
}

router.get("/admin/scraper/stats", async (req, res): Promise<void> => {
  try {
    const r = await proxyGet("/stats");
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    offline(res, e.message);
  }
});

router.post("/admin/scraper/start", async (req, res): Promise<void> => {
  try {
    const r = await proxyPost("/start", req.body);
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    offline(res, e.message);
  }
});

router.post("/admin/scraper/stop", async (req, res): Promise<void> => {
  try {
    const r = await proxyPost("/stop");
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    offline(res, e.message);
  }
});

router.post("/admin/scraper/reset", async (req, res): Promise<void> => {
  try {
    const r = await proxyPost("/reset");
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    offline(res, e.message);
  }
});

router.post("/admin/db/backup", (req, res): void => {
  try {
    if (!existsSync(DB_PATH)) {
      res.status(404).json({ ok: false, message: "Veritabanı dosyası bulunamadı." });
      return;
    }
    const dir = path.dirname(DB_PATH);
    const now = new Date();
    // format date as YYYYMMDD_HHMMSS
    const dateStr = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + "_" +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const backupName = `gecmis_maclar_yedek_${dateStr}.db`;
    const backupPath = path.join(dir, backupName);
    copyFileSync(DB_PATH, backupPath);
    res.json({ ok: true, message: `Veritabanı başarıyla yedeklendi: ${backupName}` });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: `Yedekleme hatası: ${e.message ?? "Bilinmeyen hata"}` });
  }
});

export default router;
