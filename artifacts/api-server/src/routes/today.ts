/**
 * Bugünün maçları rotası.
 * GET  /today-matches?date=YYYY-MM-DD → Belirtilen güne ait maçlar (varsayılan bugün)
 * POST /today-matches/refresh         → Manuel veri yenileme
 */
import { Router, type IRouter } from "express";
import { getTodayMatchesFromDb, refreshTodayMatches } from "../lib/todayMatches";

const router: IRouter = Router();

router.get("/today-matches", async (req, res): Promise<void> => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : null;

  let targetDate: string;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    targetDate = dateParam;
  } else {
    const now = new Date();
    targetDate = now.toISOString().slice(0, 10);
  }

  const result = getTodayMatchesFromDb(targetDate);
  res.json(result);
});

router.post("/today-matches/refresh", async (req, res): Promise<void> => {
  try {
    const result = await refreshTodayMatches();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message ?? "Bilinmeyen hata" });
  }
});

export default router;
