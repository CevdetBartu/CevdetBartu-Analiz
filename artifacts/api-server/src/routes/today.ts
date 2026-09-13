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
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    targetDate = `${year}-${month}-${day}`;
  }

  const result = getTodayMatchesFromDb(targetDate);
  res.json(result);
});

router.post("/today-matches/refresh", async (req, res): Promise<void> => {
  try {
    const dateParam = typeof req.body?.date === "string" ? req.body.date : undefined;
    const result = await refreshTodayMatches(dateParam);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message ?? "Bilinmeyen hata" });
  }
});

export default router;
