import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);
router.get("/me", authenticateJWT, authController.getMe);

export default router;
