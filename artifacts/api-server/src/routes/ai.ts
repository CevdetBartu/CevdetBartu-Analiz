import { Router, type IRouter } from "express";
import { generateHumanTipsterCommentary } from "../lib/geminiEngine";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/generate-commentary", async (req, res): Promise<void> => {
  try {
    const { matchData, stats } = req.body;
    
    if (!matchData || !stats) {
      res.status(400).json({ error: "Eksik veri gönderildi." });
      return;
    }

    const commentary = await generateHumanTipsterCommentary(matchData, stats);
    res.json({ commentary });
  } catch (e: any) {
    logger.error({ err: e }, "generate-commentary route error");
    res.status(500).json({ error: e.message || "Yorum oluşturulurken hata oluştu." });
  }
});

export default router;
