/**
 * POST /api/admin/scraper/spawn
 * Python scraper sürecini arka planda başlatır.
 */
import { Router, type IRouter } from "express";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Workspace kökü: bu dosya artifacts/api-server/src/routes/spawn.ts
// Yürütülen dist dosyası: artifacts/api-server/dist/index.mjs
// Her iki konumdan da 4 seviye yukarı workspace köküne ulaşırız.
const WORKSPACE = path.resolve(
  process.cwd().includes("artifacts/api-server")
    ? process.cwd()
    : path.join(process.cwd()),
  // process.cwd() API sunucusu başlatıldığında artifacts/api-server/ olur
);

// Workspace kökü her zaman artifacts/api-server'ın üst üst dizinidir
const WORKSPACE_ROOT = path.resolve(process.cwd(), "../..");

const isWin = process.platform === "win32";
const VENV_PYTHON = isWin
  ? path.join(WORKSPACE_ROOT, ".venv/Scripts/python.exe")
  : path.join(WORKSPACE_ROOT, ".venv/bin/python3");

const SCRAPER_SCRIPT = path.join(WORKSPACE_ROOT, "scripts/scraper/run.py");
const SCRAPER_CWD    = path.join(WORKSPACE_ROOT, "scripts/scraper");

logger.info({ WORKSPACE_ROOT, VENV_PYTHON, SCRAPER_SCRIPT }, "Spawn route hazır");

let scraperPid: number | null = null;

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
  // Zaten ayakta mı?
  if (await isFlaskUp()) {
    res.status(409).json({ ok: false, message: "Scraper zaten çalışıyor." });
    return;
  }

  if (scraperPid !== null) {
    res.status(409).json({ ok: false, message: `Scraper başlatılıyor (PID ${scraperPid})...` });
    return;
  }

  // Python binary: sanal ortam varsa onu kullan
  const pythonBin = existsSync(VENV_PYTHON) ? VENV_PYTHON : (isWin ? "python" : "python3");

  if (!existsSync(SCRAPER_SCRIPT)) {
    res.status(500).json({ ok: false, message: `Scraper dosyası bulunamadı: ${SCRAPER_SCRIPT}` });
    return;
  }

  logger.info({ pythonBin, SCRAPER_SCRIPT, SCRAPER_CWD }, "Scraper süreci başlatılıyor");

  const child = spawn(pythonBin, [SCRAPER_SCRIPT], {
    detached: false,
    stdio: ["ignore", "pipe", "pipe"],
    cwd: SCRAPER_CWD,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  scraperPid = child.pid ?? null;
  logger.info({ pid: scraperPid }, "Scraper spawn edildi");

  // Hata logla — çökmezse burası tetiklenmez
  child.stdout?.on("data", (d: Buffer) => {
    logger.info({ src: "scraper-stdout" }, d.toString().trim());
  });
  child.stderr?.on("data", (d: Buffer) => {
    logger.warn({ src: "scraper-stderr" }, d.toString().trim());
  });

  child.on("error", (err) => {
    logger.error({ err }, "Scraper süreci başlatılamadı");
    scraperPid = null;
  });

  child.on("exit", (code, signal) => {
    logger.info({ code, signal }, "Scraper süreci kapandı");
    scraperPid = null;
  });

  // Flask'ın ayağa kalkmasını bekle (maks 12 sn)
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 700));
    if (await isFlaskUp()) {
      logger.info("Flask hazır!");
      res.json({ ok: true, message: "Scraper başarıyla başlatıldı ✓", pid: scraperPid });
      return;
    }
  }

  // Zaman doldu ama süreç hâlâ çalışıyor olabilir
  if (scraperPid !== null) {
    res.json({
      ok: true,
      message: "Scraper başlatıldı — Flask hazırlanıyor, birkaç saniye bekleyin.",
      pid: scraperPid,
    });
  } else {
    res.status(500).json({
      ok: false,
      message: "Scraper süreci başlatıldı ama hemen kapandı. API sunucusu günlüklerini kontrol edin.",
    });
  }
});

export default router;
