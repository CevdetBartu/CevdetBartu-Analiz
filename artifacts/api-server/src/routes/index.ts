import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
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
import adminDashboardRouter from "./adminDashboard";
import announcementsRouter from "./announcements";

const router: IRouter = Router();

// Admin Authentication Middleware

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many admin requests from this IP, please try again later",
  handler: (req, res, next, options) => {
    logger.warn(`Admin endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});

router.use("/announcements", announcementsRouter);

router.use("/admin", requireAdmin, adminRateLimiter, (req, res, next) => {
  logger.info(`[AUDIT] Admin ${req.user?.email} accessed ${req.method} ${req.originalUrl}`);
  next();
});

import { requireUser, requireAdmin } from "../lib/userAuthMiddleware";

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
router.use("/admin/dashboard", adminDashboardRouter);
router.use(couponRouter);
router.use(basketMatchesRouter);
router.use(liveRouter);
router.use("/ai", aiRouter);
router.use(couponWizardRouter);

export default router;
