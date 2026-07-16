/**
 * Admin rotaları — Scraper kontrol sunucusuna (Python/Flask, port 5051) proxy atar.
 */
import { Router, type IRouter } from "express";

const router: IRouter = Router();
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

export default router;
