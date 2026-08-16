import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all settings endpoints with JWT authentication middleware
router.use(authenticateJWT);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);

export default router;
