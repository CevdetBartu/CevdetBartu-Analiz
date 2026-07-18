import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const FLASK_URL = "http://127.0.0.1:5051";

// GET /live-matches
router.get("/live-matches", async (req, res): Promise<void> => {
  try {
    const response = await fetch(`${FLASK_URL}/live-matches`, {
      signal: AbortSignal.timeout(20000), // 20s timeout for concurrent scrapes
    });
    if (!response.ok) {
      res.status(response.status).json({ error: "Scraper servisinden canlı veri alınamadı." });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (e: any) {
    logger.error({ err: e }, "live-matches route error");
    res.status(500).json({ error: "Canlı maçlar çekilirken sunucu hatası oluştu." });
  }
});

export default router;
