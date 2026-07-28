import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register({ name, email, passwordRaw: password });
      
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, passwordRaw: password });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await authService.getCurrentUser(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
