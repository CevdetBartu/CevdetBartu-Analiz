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
const ADMIN_TOKEN = process.env.ADMIN_SECRET_KEY || "crs-secret-admin-key-9988";
router.use("/admin", (req, res, next) => {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Yetkisiz erişim. Geçersiz Admin Token." });
    return;
  }
  next();
});

router.use(healthRouter);
router.use(matchesRouter);
router.use(analyzeRouter);
router.use(adminRouter);
router.use(todayRouter);
router.use(couponRouter);
router.use(spawnRouter);
router.use(basketMatchesRouter);
router.use(liveRouter);
router.use(streamProxyRouter);
router.use("/ai", aiRouter);
router.use(couponWizardRouter);

export default router;
