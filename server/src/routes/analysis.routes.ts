import { Router } from "express";
import { analysisController } from "../controllers/analysis.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all analysis endpoints using existing JWT middleware
router.use(authenticateJWT);

router.get("/", analysisController.getAnalyses);
router.get("/:id", analysisController.getAnalysisById);
router.delete("/:id", analysisController.deleteAnalysis);

export default router;
