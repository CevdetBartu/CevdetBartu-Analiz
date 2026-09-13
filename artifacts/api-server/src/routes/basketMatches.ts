import { Router, type IRouter } from "express";
import {
  queryBasketScraperMatches,
  queryTodayBasketMatches,
  getBasketScraperMatchCount,
} from "../lib/basketScraperDb";
import { findSimilarBasketMatches } from "../lib/basketSimilarity";
import { analyzeBasketMatches } from "../lib/basketAnalyzeEngine";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const FLASK_URL = "http://127.0.0.1:5051";

// ── Bugünün Basketbol Maçları ───────────────────────────────────────────────

router.get("/basket/today-matches", async (req, res): Promise<void> => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : null;

  let targetDate: string;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    targetDate = dateParam;
  } else {
    const now = new Date();
    targetDate = now.toISOString().slice(0, 10);
  }

  // YYYY-MM-DD formatını DD.MM.YYYY formatına çevir (SQLite için)
  const [y, m, d] = targetDate.split("-");
  const dotDate = `${d}.${m}.${y}`;

  const matches = queryTodayBasketMatches(dotDate);
  res.json({
    date: targetDate,
    matches,
    total: matches.length,
    last_updated: new Date().toISOString(),
  });
});

router.post("/basket/today-matches/refresh", async (req, res): Promise<void> => {
  try {
    const dateParam = typeof req.body?.date === "string" ? req.body.date : undefined;
    const targetDate = dateParam ?? new Date().toISOString().slice(0, 10);

    const resp = await fetch(`${FLASK_URL}/basket/today`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: targetDate }),
      signal: AbortSignal.timeout(300_000),
    });

    if (!resp.ok) {
      res.status(resp.status).json({ ok: false, message: "Scraper yanıt vermedi." });
      return;
    }

    const data = await resp.json();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message ?? "Scraper bağlantı hatası" });
  }
});

// ── Benzer Maç Bulma ────────────────────────────────────────────────────────

router.post("/basket/matches/find-similar", async (req, res): Promise<void> => {
  const { homeTeam, awayTeam, league, oran_1, oran_2, handikap_limit, toplam_limit } = req.body;

  if (!homeTeam || !awayTeam || oran_1 == null || oran_2 == null) {
    res.status(400).json({ error: "Eksik parametreler: homeTeam, awayTeam, oran_1, oran_2 gereklidir." });
    return;
  }

  try {
    const candidates = queryBasketScraperMatches(Number(oran_1), Number(oran_2));
    const similar = findSimilarBasketMatches(
      {
        homeTeam,
        awayTeam,
        league: league || "",
        oran_1: Number(oran_1),
        oran_2: Number(oran_2),
        handikap_limit: handikap_limit != null ? Number(handikap_limit) : null,
        toplam_limit: toplam_limit != null ? Number(toplam_limit) : null,
      },
      candidates
    );

    res.json(similar);
  } catch (e: any) {
    logger.error({ err: e }, "findSimilarBasketMatches route error");
    res.status(500).json({ error: "Benzer maç araması sırasında hata oluştu." });
  }
});

// ── Analiz Motoru ───────────────────────────────────────────────────────────

router.post("/basket/analyze", (req, res): void => {
  const { targetMatch, referenceMatches } = req.body;

  if (!targetMatch || !referenceMatches) {
    res.status(400).json({ error: "Eksik parametreler: targetMatch ve referenceMatches gereklidir." });
    return;
  }

  try {
    const result = analyzeBasketMatches(
      {
        handikap_limit: targetMatch.handikap_limit != null ? Number(targetMatch.handikap_limit) : null,
        toplam_limit: targetMatch.toplam_limit != null ? Number(targetMatch.toplam_limit) : null,
      },
      referenceMatches
    );

    res.json(result);
  } catch (e: any) {
    logger.error({ err: e }, "basket/analyze route error");
    res.status(500).json({ error: "Analiz sırasında hata oluştu." });
  }
});

// ── Admin İstatistikleri ───────────────────────────────────────────────────

router.get("/basket/admin/stats", (req, res): void => {
  res.json({
    total: getBasketScraperMatchCount(),
  });
});

// ── Scraper Proxy Uçları ───────────────────────────────────────────────────

router.get("/basket/stats", async (req, res): Promise<void> => {
  try {
    const r = await fetch(`${FLASK_URL}/basket/stats`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) {
      res.status(r.status).json({ error: "Scraper servisinden hata döndü" });
      return;
    }
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    res.status(503).json({ error: "Scraper servisi çalışmıyor", detail: e.message });
  }
});

router.post("/basket/start", async (req, res): Promise<void> => {
  try {
    const r = await fetch(`${FLASK_URL}/basket/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(6000),
    });
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    res.status(503).json({ error: "Scraper servisi çalışmıyor", detail: e.message });
  }
});

router.post("/basket/stop", async (req, res): Promise<void> => {
  try {
    const r = await fetch(`${FLASK_URL}/basket/stop`, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
    });
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    res.status(503).json({ error: "Scraper servisi çalışmıyor", detail: e.message });
  }
});

router.post("/basket/reset", async (req, res): Promise<void> => {
  try {
    const r = await fetch(`${FLASK_URL}/basket/reset`, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
    });
    res.status(r.status).json(await r.json());
  } catch (e: any) {
    res.status(503).json({ error: "Scraper servisi çalışmıyor", detail: e.message });
  }
});

export default router;
