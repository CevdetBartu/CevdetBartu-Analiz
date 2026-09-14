import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matchesRouter from "./matches";
import analyzeRouter from "./analyze";
import adminRouter from "./admin";
import todayRouter from "./today";
import couponRouter from "./coupon";
import spawnRouter from "./spawn";
import basketMatchesRouter from "./basketMatches";
import liveRouter from "./live";
import streamProxyRouter from "./streamProxy";
import aiRouter from "./ai";
import couponWizardRouter from "./couponWizard";

const router: IRouter = Router();

// Admin Authentication Middleware
const ADMIN_TOKEN = process.env.ADMIN_SECRET_KEY || "karga-secret-admin-key-9988";
router.use("/admin", (req, res, next) => {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Yetkisiz erişim. Geçersiz Admin Token." });
    return;
  }
  next();
});

import { requireUser } from "../lib/userAuthMiddleware";

router.use(healthRouter);
router.use(matchesRouter); // Tarihsel mac verileri
router.use(todayRouter); // Anasayfa icin lazim
router.use(spawnRouter);
router.use(streamProxyRouter);

// Korumali rotalar (Kullanici girisi gerektirir)
router.use("/analyze", requireUser);
router.use("/coupon", requireUser);
router.use("/coupon-of-the-day", requireUser);
router.use("/basket", requireUser);
router.use("/live-matches", requireUser);
router.use("/ai", requireUser);

// Rotalari bagla
router.use(analyzeRouter);
router.use(adminRouter);
router.use(couponRouter);
router.use(basketMatchesRouter);
router.use(liveRouter);
router.use("/ai", aiRouter);
router.use(couponWizardRouter);

export default router;
