import { Router } from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { uploadAudioMiddleware } from "../middlewares/multer.middleware.js";

const router = Router();

// Secure all upload endpoints using existing JWT middleware
router.use(authenticateJWT);

router.post("/", uploadAudioMiddleware, uploadController.createUpload);
router.get("/", uploadController.getUploads);
router.get("/:id", uploadController.getUploadById);
router.delete("/:id", uploadController.deleteUpload);
router.post("/:id/analyze", uploadController.analyzeUpload);

export default router;
