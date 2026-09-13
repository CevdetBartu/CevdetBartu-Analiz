import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTodayMatchesFromDb } from "../lib/todayMatches";

const router: IRouter = Router();
const FLASK_URL = "http://127.0.0.1:5051";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALARMS_PATH = path.resolve(__dirname, "../../../scripts/scraper/live_alarms_log.json");
const CONTROLS_PATH = path.resolve(__dirname, "../../../scripts/scraper/live_controls_log.json");

interface AlarmLog {
  status: string;
  outcome_any_goal: boolean | null;
  outcome_pressing_goal: boolean | null;
  api_lag_suspected: boolean;
}

interface ControlLog {
  status: string;
  outcome_any_goal: boolean | null;
  api_lag_suspected: boolean;
}

function readJsonFile<T>(filepath: string): T[] {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, "utf8");
      return JSON.parse(content) as T[];
    }
  } catch (e) {
    logger.error({ err: e, path: filepath }, "readJsonFile error");
  }
  return [];
}

// GET /live-matches
router.get("/live-matches", async (req, res): Promise<void> => {
  try {
    const response = await fetch(`${FLASK_URL}/live-matches`, {
      signal: AbortSignal.timeout(60000), // 60s timeout for concurrent scrapes
    });
    if (!response.ok) {
      res.status(response.status).json({ error: "Scraper servisinden canlı veri alınamadı." });
      return;
    }
    const data = await response.json();
    
    // Fuzzy match with bulletin to attach Mackolik odds
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayMatchesRes = getTodayMatchesFromDb(todayStr);
      const todayMatches = todayMatchesRes.matches || [];
      
      const normalizeStr = (s: string) => {
        return (s || "").toLowerCase()
          .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
          .replace(/[^a-z0-9]/g, "");
      };
      
      if (Array.isArray(data) || data.Count !== undefined) {
        const matchesArr = Array.isArray(data) ? data : data.matches || [];
        matchesArr.forEach((liveM: any) => {
          const lHome = normalizeStr(liveM.homeTeam);
          const lAway = normalizeStr(liveM.awayTeam);
          
          const matched = todayMatches.find(tm => {
            const tHome = normalizeStr(tm.ev_sahibi || tm.homeTeam || "");
            const tAway = normalizeStr(tm.deplasman || tm.awayTeam || "");
            return (tHome.includes(lHome.substring(0, 5)) || lHome.includes(tHome.substring(0, 5))) &&
                   (tAway.includes(lAway.substring(0, 5)) || lAway.includes(tAway.substring(0, 5)));
          });
          
          if (matched) {
            liveM.bulletin_props = matched;
          }
        });
      }
    } catch (err) {
      logger.error({ err }, "Error merging bulletin odds to live matches");
    }

    res.json(data);
  } catch (e: any) {
    logger.error({ err: e }, "live-matches route error");
    res.status(500).json({ error: "Canlı maçlar çekilirken sunucu hatası oluştu." });
  }
});

// GET /live/alarm-performance
router.get("/live/alarm-performance", async (req, res): Promise<void> => {
  try {
    const alarms = readJsonFile<AlarmLog>(ALARMS_PATH).filter(a => a.status === "resolved");
    const controls = readJsonFile<ControlLog>(CONTROLS_PATH).filter(c => c.status === "resolved");

    const totalAlarms = alarms.length;
    const anyGoalAlarmsLag = alarms.filter(a => a.outcome_any_goal === true).length;
    const anyGoalAlarmsNoLag = alarms.filter(a => a.outcome_any_goal === true && !a.api_lag_suspected).length;
    const pressGoalAlarmsLag = alarms.filter(a => a.outcome_pressing_goal === true).length;
    const pressGoalAlarmsNoLag = alarms.filter(a => a.outcome_pressing_goal === true && !a.api_lag_suspected).length;

    const totalControls = controls.length;
    const goalControlsLag = controls.filter(c => c.outcome_any_goal === true).length;
    const goalControlsNoLag = controls.filter(c => c.outcome_any_goal === true && !c.api_lag_suspected).length;

    const rateAnyAlarmLag = totalAlarms > 0 ? (anyGoalAlarmsLag / totalAlarms) * 100 : 0;
    const rateAnyAlarmNoLag = totalAlarms > 0 ? (anyGoalAlarmsNoLag / totalAlarms) * 100 : 0;
    const ratePressAlarmLag = totalAlarms > 0 ? (pressGoalAlarmsLag / totalAlarms) * 100 : 0;
    const ratePressAlarmNoLag = totalAlarms > 0 ? (pressGoalAlarmsNoLag / totalAlarms) * 100 : 0;

    const rateControlLag = totalControls > 0 ? (goalControlsLag / totalControls) * 100 : 0;
    const rateControlNoLag = totalControls > 0 ? (goalControlsNoLag / totalControls) * 100 : 0;

    // Calculate comparative lifts
    const liftAnyLag = rateAnyAlarmLag - rateControlLag;
    const liftAnyNoLag = rateAnyAlarmNoLag - rateControlNoLag;

    res.json({
      alarms: {
        total: totalAlarms,
        any_goal_lag: anyGoalAlarmsLag,
        any_goal_nolag: anyGoalAlarmsNoLag,
        press_goal_lag: pressGoalAlarmsLag,
        press_goal_nolag: pressGoalAlarmsNoLag,
        rate_any_lag: Math.round(rateAnyAlarmLag * 10) / 10,
        rate_any_nolag: Math.round(rateAnyAlarmNoLag * 10) / 10,
        rate_press_lag: Math.round(ratePressAlarmLag * 10) / 10,
        rate_press_nolag: Math.round(ratePressAlarmNoLag * 10) / 10,
      },
      controls: {
        total: totalControls,
        goal_lag: goalControlsLag,
        goal_nolag: goalControlsNoLag,
        rate_lag: Math.round(rateControlLag * 10) / 10,
        rate_nolag: Math.round(rateControlNoLag * 10) / 10,
      },
      lift_any_lag: Math.round(liftAnyLag * 10) / 10,
      lift_any_nolag: Math.round(liftAnyNoLag * 10) / 10,
    });
  } catch (e: any) {
    logger.error({ err: e }, "alarm-performance route error");
    res.status(500).json({ error: "Alarm performans verileri hesaplanırken sunucu hatası oluştu." });
  }
});

export default router;
