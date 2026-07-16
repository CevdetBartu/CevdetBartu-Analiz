/**
 * POST /api/admin/scraper/spawn
 * Python scraper sürecini arka planda başlatır.
 * Zaten çalışıyorsa 409 döner.
 */
import { Router, type IRouter } from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRAPER_SCRIPT = path.resolve(__dirname, "../../../../scripts/scraper/run.py");

let scraperPid: number | null = null;

/** Flask'ın ayakta olup olmadığını hızlıca kontrol et */
async function isFlaskUp(): Promise<boolean> {
  try {
    const r = await fetch("http://127.0.0.1:5051/stats", {
      signal: AbortSignal.timeout(1500),
    });
    return r.ok;
  } catch {
    return false;
  }
}

router.post("/admin/scraper/spawn", async (req, res): Promise<void> => {
  // Zaten çalışıyor mu?
  if (await isFlaskUp()) {
    res.status(409).json({ ok: false, message: "Scraper zaten çalışıyor." });
    return;
  }

  if (scraperPid !== null) {
    res.status(409).json({ ok: false, message: `Scraper süreci başlatılıyor (PID ${scraperPid}).` });
    return;
  }

  logger.info("Scraper süreci başlatılıyor: %s", SCRAPER_SCRIPT);

  const child = spawn("python3", [SCRAPER_SCRIPT], {
    detached: false,
    stdio: "ignore",
    cwd: path.dirname(SCRAPER_SCRIPT),
  });

  scraperPid = child.pid ?? null;

  child.on("error", (err) => {
    logger.error({ err }, "Scraper süreci başlatılamadı");
    scraperPid = null;
  });

  child.on("exit", (code) => {
    logger.info({ code }, "Scraper süreci kapandı");
    scraperPid = null;
  });

  // Flask'ın ayağa kalkmasını en fazla 8 sn bekle
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 600));
    if (await isFlaskUp()) {
      res.json({ ok: true, message: "Scraper başarıyla başlatıldı.", pid: scraperPid });
      return;
    }
  }

  // Zaman aşımı — süreç belki hâlâ başlatılıyordur
  res.json({
    ok: true,
    message: "Scraper süreci başlatıldı. Flask'ın hazır olması birkaç saniye sürebilir.",
    pid: scraperPid,
  });
});

export default router;
