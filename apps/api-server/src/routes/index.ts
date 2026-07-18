import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matchesRouter from "./matches";
import analyzeRouter from "./analyze";
import adminRouter from "./admin";
import todayRouter from "./today";
import spawnRouter from "./spawn";
import liveRouter from "./live";
import dogrulamaRouter from "./dogrulama";

const router: IRouter = Router();

router.use(healthRouter);
router.use(matchesRouter);
router.use(analyzeRouter);
router.use(adminRouter);
router.use(todayRouter);
router.use(spawnRouter);
router.use(liveRouter);
router.use(dogrulamaRouter);

export default router;
